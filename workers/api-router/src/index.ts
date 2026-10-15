import { authenticateRequest } from "./auth";
import {
  E3_HEADERS,
  canonicalString,
  hmacHex,
  randomHex,
  sha256Hex,
  timingSafeEqual,
} from "./signing";

export { AuthStore } from "./auth-store";

export interface Env {
  E3_ORIGIN: string;
  E3_RESOURCES_ORIGIN?: string;
  ASSETS_FALLBACK_ORIGIN: string;
  RESOURCES_FALLBACK_ORIGIN: string;
  // Shared secret for router -> e3 request signing (set on both sides). Required in production.
  E3_SHARED_SECRET?: string;
  // Master key for the /__admin/* client-management API.
  ADMIN_KEY?: string;
  // "writes" (default) | "all" | "off" — see auth.ts.
  REPLAY_PROTECTION?: string;
  // Paths hashed to form the public asset-catalog version, and how long to cache it.
  VERSION_SOURCES?: string;
  VERSION_CACHE_TTL_SECONDS?: string;
  PRIMARY_TIMEOUT_MS?: string;
  FAILOVER_COOLDOWN_MS?: string;
  ALLOWED_ORIGINS?: string;
  AUTH_STORE: DurableObjectNamespace;
}

const DEFAULT_E3_ORIGIN = "https://e3.codersoft.xyz";
const DEFAULT_ASSETS_FALLBACK = "https://assets-api-worker.powernplant101-c6b.workers.dev";
const DEFAULT_RESOURCES_FALLBACK = "https://hamburger-api.powernplant101-c6b.workers.dev";
const DEFAULT_ALLOWED_ORIGINS = [
  "https://renderdragon.org",
  "https://www.renderdragon.org",
  "https://api.codersoft.xyz",
  "https://assets.codersoft.xyz",
];
const DEFAULT_PRIMARY_TIMEOUT_MS = 2500;
const DEFAULT_FAILOVER_COOLDOWN_MS = 30000;
const E3_ROUTER_CLIENT_ID = "api-router";

type Group = "assets" | "resources";

const RESOURCE_PREFIXES = ["/categories", "/category", "/all", "/fonts", "/mcicons"];

let e3DownUntil = 0;

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const parseIntEnv = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const listEnv = (value: string | undefined, fallback: string[]): string[] =>
  (value ?? fallback.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const classify = (pathname: string): Group =>
  RESOURCE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    ? "resources"
    : "assets";

// Read-only endpoints a partner-scoped key (`assets:read`) may request.
const PARTNER_READ_PREFIXES = ["/all", "/categories", "/category", "/mcicons", "/fonts"];

const isPartnerReadPath = (pathname: string): boolean =>
  PARTNER_READ_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const isLocalOrigin = (origin: string): boolean => {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".local") ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

const buildCorsHeaders = (request: Request, env: Env): Record<string, string> => {
  const allowed = (env.ALLOWED_ORIGINS ?? DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origin = request.headers.get("Origin") ?? "";
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && (allowed.includes(origin) || isLocalOrigin(origin))) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else {
    headers["Access-Control-Allow-Origin"] = allowed[0] ?? DEFAULT_ALLOWED_ORIGINS[0];
  }

  return headers;
};

const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "cf-connecting-ip",
  "cf-ipcountry",
  "cf-ray",
  "cf-visitor",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-real-ip",
]);

const STRIP_FROM_RESPONSE = new Set(["content-encoding", "content-length", "transfer-encoding"]);

const forwardHeaders = (source: Headers): Headers => {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });
  return headers;
};

const isOriginDownStatus = (status: number): boolean =>
  status === 502 || status === 503 || status === 504 || (status >= 520 && status <= 527) || status === 530;

const json = (body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...extraHeaders, "content-type": "application/json" },
  });

const applyCors = (upstream: Response, cors: Record<string, string>, via: string): Response => {
  const headers = new Headers(upstream.headers);
  for (const key of STRIP_FROM_RESPONSE) headers.delete(key);
  for (const [key, value] of Object.entries(cors)) headers.set(key, value);
  headers.set("x-api-router-upstream", via);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
};

async function signToE3(
  secret: string,
  method: string,
  path: string,
  body: ArrayBuffer | undefined,
): Promise<Headers> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomHex(16);
  const bodyHash = await sha256Hex(body ?? new Uint8Array());
  const canonical = canonicalString({
    method,
    path,
    clientId: E3_ROUTER_CLIENT_ID,
    timestamp,
    nonce,
    bodyHash,
  });
  const signature = await hmacHex(secret, canonical);
  const headers = new Headers();
  headers.set(E3_HEADERS.timestamp, timestamp);
  headers.set(E3_HEADERS.nonce, nonce);
  headers.set(E3_HEADERS.signature, signature);
  return headers;
}

async function handleAdmin(
  request: Request,
  env: Env,
  cors: Record<string, string>,
  url: URL,
): Promise<Response> {
  if (!env.ADMIN_KEY) return json({ error: "admin_disabled" }, 501, cors);
  const supplied = request.headers.get("x-admin-key") ?? "";
  if (!timingSafeEqual(supplied, env.ADMIN_KEY)) return json({ error: "unauthorized" }, 401, cors);

  const stub = env.AUTH_STORE.get(env.AUTH_STORE.idFromName("global"));
  const doPath = url.pathname.replace(/^\/__admin/, "") + url.search;
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  const doResponse = await stub.fetch(`https://auth.internal${doPath}`, {
    method: request.method,
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
    body,
  });
  return new Response(await doResponse.text(), {
    status: doResponse.status,
    headers: { ...cors, "content-type": "application/json" },
  });
}

async function fetchUpstream(env: Env, path: string): Promise<{ ok: boolean; status: number; text: string }> {
  const group = classify(path);
  const primary = stripTrailingSlash(
    group === "resources"
      ? env.E3_RESOURCES_ORIGIN || env.E3_ORIGIN || DEFAULT_E3_ORIGIN
      : env.E3_ORIGIN || DEFAULT_E3_ORIGIN,
  );
  const fallback = stripTrailingSlash(
    group === "resources"
      ? env.RESOURCES_FALLBACK_ORIGIN || DEFAULT_RESOURCES_FALLBACK
      : env.ASSETS_FALLBACK_ORIGIN || DEFAULT_ASSETS_FALLBACK,
  );
  const timeoutMs = parseIntEnv(env.PRIMARY_TIMEOUT_MS, DEFAULT_PRIMARY_TIMEOUT_MS);
  const cooldownMs = parseIntEnv(env.FAILOVER_COOLDOWN_MS, DEFAULT_FAILOVER_COOLDOWN_MS);
  const headers = new Headers({ accept: "application/json" });

  if (Date.now() >= e3DownUntil) {
    try {
      const primaryHeaders = new Headers(headers);
      if (env.E3_SHARED_SECRET) {
        const signature = await signToE3(env.E3_SHARED_SECRET, "GET", path, undefined);
        signature.forEach((value, key) => primaryHeaders.set(key, value));
      }
      const upstream = await fetch(`${primary}${path}`, {
        headers: primaryHeaders,
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!isOriginDownStatus(upstream.status)) {
        return { ok: upstream.ok, status: upstream.status, text: await upstream.text() };
      }
      e3DownUntil = Date.now() + cooldownMs;
    } catch {
      e3DownUntil = Date.now() + cooldownMs;
    }
  }

  const upstream = await fetch(`${fallback}${path}`, { headers, redirect: "manual" });
  return { ok: upstream.ok, status: upstream.status, text: await upstream.text() };
}

// Public, unauthenticated so visitors with a valid cache pay no Turnstile challenge:
// the client compares this version and only refreshes its cached catalog when it changes.
async function handleVersion(env: Env, cors: Record<string, string>): Promise<Response> {
  const stub = env.AUTH_STORE.get(env.AUTH_STORE.idFromName("global"));
  const ttlMs = parseIntEnv(env.VERSION_CACHE_TTL_SECONDS, 300) * 1000;

  const cachedResponse = await stub.fetch("https://auth.internal/version");
  const cached = (await cachedResponse.json()) as {
    version?: string;
    generatedAt?: number;
    cachedAt?: number;
  };

  if (cached.version && Date.now() - (cached.cachedAt ?? 0) < ttlMs) {
    return json({ version: cached.version, generatedAt: cached.generatedAt }, 200, {
      ...cors,
      "cache-control": "no-store",
    });
  }

  const sources = listEnv(env.VERSION_SOURCES, ["/all", "/api/assets"]);
  const parts: string[] = [];
  for (const source of sources) {
    const result = await fetchUpstream(env, source);
    if (!result.ok) return json({ error: "version_unavailable" }, 503, cors);
    parts.push(`${source}:${result.status}:${await sha256Hex(result.text)}`);
  }

  const version = await sha256Hex(parts.join("\n"));
  const generatedAt = Date.now();
  await stub.fetch("https://auth.internal/version", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ version, generatedAt }),
  });

  return json({ version, generatedAt }, 200, { ...cors, "cache-control": "no-store" });
}

// Drop the cached catalog version so the next /__version recomputes it (called after
// a successful write, so uploads are reflected without waiting for the TTL).
async function invalidateVersion(env: Env): Promise<void> {
  try {
    const stub = env.AUTH_STORE.get(env.AUTH_STORE.idFromName("global"));
    await stub.fetch("https://auth.internal/version", { method: "DELETE" });
  } catch {
    // best effort
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const cors = buildCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/__router/health") {
      return json(
        { ok: true, e3: Date.now() >= e3DownUntil ? "up" : "down", authStore: Boolean(env.AUTH_STORE) },
        200,
        cors,
      );
    }

    if (url.pathname === "/__version") {
      return handleVersion(env, cors);
    }

    if (url.pathname.startsWith("/__admin/")) {
      return handleAdmin(request, env, cors, url);
    }

    const isBodyless = request.method === "GET" || request.method === "HEAD";
    const body = isBodyless ? undefined : await request.arrayBuffer();

    const auth = await authenticateRequest(request, url, env, body);
    if (!auth.ok) {
      return json({ error: "unauthorized", reason: auth.reason }, auth.status, cors);
    }

    // Partner keys carry scopes (e.g. `assets:read`) and are read-only: reject
    // writes and any path outside the asset read set. Unscoped clients (the
    // gateway, internal callers) are unrestricted.
    if (auth.scopes.length > 0 && !auth.scopes.includes("*")) {
      const method = request.method.toUpperCase();
      if (auth.scopes.includes("assets:read")) {
        if (method !== "GET" && method !== "HEAD") {
          return json({ error: "forbidden", reason: "read_only_scope" }, 403, cors);
        }
        if (!isPartnerReadPath(url.pathname)) {
          return json({ error: "forbidden", reason: "path_not_allowed" }, 403, cors);
        }
      }
    }

    const group = classify(url.pathname);
    const primary = stripTrailingSlash(
      group === "resources"
        ? env.E3_RESOURCES_ORIGIN || env.E3_ORIGIN || DEFAULT_E3_ORIGIN
        : env.E3_ORIGIN || DEFAULT_E3_ORIGIN,
    );
    const fallback = stripTrailingSlash(
      group === "resources"
        ? env.RESOURCES_FALLBACK_ORIGIN || DEFAULT_RESOURCES_FALLBACK
        : env.ASSETS_FALLBACK_ORIGIN || DEFAULT_ASSETS_FALLBACK,
    );

    const timeoutMs = parseIntEnv(env.PRIMARY_TIMEOUT_MS, DEFAULT_PRIMARY_TIMEOUT_MS);
    const cooldownMs = parseIntEnv(env.FAILOVER_COOLDOWN_MS, DEFAULT_FAILOVER_COOLDOWN_MS);
    const target = `${url.pathname}${url.search}`;
    const headers = forwardHeaders(request.headers);

    const e3Signature = env.E3_SHARED_SECRET
      ? await signToE3(env.E3_SHARED_SECRET, request.method, target, body)
      : null;

    if (Date.now() >= e3DownUntil) {
      try {
        const primaryHeaders = new Headers(headers);
        e3Signature?.forEach((value, key) => primaryHeaders.set(key, value));
        const upstream = await fetch(`${primary}${target}`, {
          method: request.method,
          headers: primaryHeaders,
          body,
          redirect: "manual",
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!isOriginDownStatus(upstream.status)) {
          if (!isBodyless && upstream.status < 400) ctx.waitUntil(invalidateVersion(env));
          return applyCors(upstream, cors, "e3");
        }

        console.warn(`e3 returned ${upstream.status}; failing over to ${fallback}`);
        e3DownUntil = Date.now() + cooldownMs;
      } catch (error) {
        console.warn(`e3 unreachable (${String(error)}); failing over to ${fallback}`);
        e3DownUntil = Date.now() + cooldownMs;
      }
    }

    const upstream = await fetch(`${fallback}${target}`, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    if (!isBodyless && upstream.status < 400) ctx.waitUntil(invalidateVersion(env));
    return applyCors(upstream, cors, "fallback");
  },
};
