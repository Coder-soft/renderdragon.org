import { supabase } from "@/integrations/supabase/client";
import { getTurnstileToken } from "@/lib/turnstile";

// Every asset call goes to the same-origin assets gateway
// (workers/assets-gateway, routed at /api/assets-gw/*). The gateway holds the signing
// secret and authenticates the request to the router, so the browser never needs a key.
export const ASSETS_API_BASE_URL = "/api/assets-gw";

export function assetsApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${ASSETS_API_BASE_URL}${normalized}`;
}

// Public, no session required: the catalog version. A visitor whose cached copy
// matches this never triggers a Turnstile challenge.
export async function fetchAssetsVersion(): Promise<string | null> {
  try {
    const response = await fetch(`${ASSETS_API_BASE_URL}/__version`, { credentials: "omit" });
    if (!response.ok) return null;
    const data = (await response.json()) as { version?: unknown };
    return typeof data.version === "string" ? data.version : null;
  } catch {
    return null;
  }
}

let sessionPromise: Promise<void> | null = null;

async function hasSession(): Promise<boolean> {
  try {
    const response = await fetch(`${ASSETS_API_BASE_URL}/__session`, { credentials: "include" });
    return response.ok;
  } catch {
    return false;
  }
}

async function acquireSession(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const supabaseToken = data.session?.access_token;

  // Logged-in visitors are accepted via their Supabase token; anonymous visitors
  // solve one Turnstile challenge that the gateway verifies server-side.
  const turnstileToken = supabaseToken ? undefined : await getTurnstileToken();

  const response = await fetch(`${ASSETS_API_BASE_URL}/__session`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ supabaseToken, turnstileToken }),
  });

  if (!response.ok) {
    throw new Error(`Unable to establish an assets session (${response.status})`);
  }
}

export async function ensureAssetsSession(): Promise<void> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      if (await hasSession()) return;
      await acquireSession();
    })().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

export async function fetchFromAssetsApi(path: string, init?: RequestInit): Promise<Response> {
  await ensureAssetsSession();

  const send = () => fetch(assetsApiUrl(path), { ...init, credentials: "include" });
  let response = await send();

  if (response.status === 401) {
    // Session expired or was rejected; re-establish once and retry.
    sessionPromise = null;
    await ensureAssetsSession();
    response = await send();
  }

  if (!response.ok) {
    throw new Error(`Assets API error ${response.status} ${response.statusText} for ${path}`);
  }
  return response;
}
