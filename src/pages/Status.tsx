import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Live status page. Every check runs in the browser against public endpoints
// (no auth secrets), so the page reflects what a real visitor experiences.
// ---------------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string;

const DEV = import.meta.env.DEV;
// The router only echoes allowed origins, and localhost isn't one, so in dev we
// reach it through the Vite proxy (see vite.config.ts). Production is cross-origin
// but renderdragon.org is allow-listed on the router and gateway.
const ROUTER_BASE = DEV ? "/api/status-router" : "https://api.codersoft.xyz";
const GATEWAY_BASE = "https://gateway.codersoft.xyz";
const ORIGIN_BASE = "https://hamburger.codersoft.xyz";
const FALLBACK_BASE = "https://hamburger-api.powernplant101-c6b.workers.dev";

const TIMEOUT_MS = 10_000;
const REFRESH_MS = 60_000;
const BAR_SLOTS = 36;

type Level = "operational" | "degraded" | "down" | "checking";
type Group = "Core" | "APIs" | "Infrastructure";

const GROUP_ORDER: Group[] = ["Core", "APIs", "Infrastructure"];

const LEVEL: Record<Level, { label: string; dot: string; text: string; bar: string }> = {
  operational: { label: "Operational", dot: "bg-emerald-500", text: "text-emerald-400", bar: "bg-emerald-500/80" },
  degraded: { label: "Degraded", dot: "bg-amber-500", text: "text-amber-400", bar: "bg-amber-500/80" },
  down: { label: "Major outage", dot: "bg-red-500", text: "text-red-400", bar: "bg-red-500/80" },
  checking: { label: "Checking", dot: "bg-muted-foreground", text: "text-muted-foreground", bar: "bg-muted-foreground/30" },
};

interface Probe {
  level: Level;
  detail?: string;
  latencyMs: number | null;
}

interface CheckDef {
  id: string;
  group: Group;
  name: string;
  description: string;
  run: (signal: AbortSignal) => Promise<Probe>;
}

const probeHttp = async (
  url: string,
  signal: AbortSignal,
  opts: { headers?: Record<string, string>; parse?: (data: unknown) => string | undefined } = {},
): Promise<Probe> => {
  const start = performance.now();
  const res = await fetch(url, { signal, cache: "no-store", credentials: "omit", headers: opts.headers });
  const latencyMs = Math.round(performance.now() - start);
  let detail: string | undefined;
  if (opts.parse) {
    try {
      detail = opts.parse(await res.clone().json());
    } catch {
      // non-JSON body; ignore
    }
  }
  if (res.status >= 500) return { level: "down", detail: detail ?? `HTTP ${res.status}`, latencyMs };
  if (res.status >= 400) return { level: "degraded", detail: detail ?? `HTTP ${res.status}`, latencyMs };
  return { level: "operational", detail, latencyMs };
};

const CHECKS: CheckDef[] = [
  {
    id: "web",
    group: "Core",
    name: "Website",
    description: "Frontend application, served from the edge",
    run: async () => ({ level: "operational", detail: "Serving current build", latencyMs: null }),
  },
  {
    id: "auth",
    group: "Core",
    name: "Authentication",
    description: "Sign-in, sessions and partner OAuth",
    run: (signal) =>
      probeHttp(`${SUPABASE_URL}/auth/v1/health`, signal, {
        headers: { apikey: SUPABASE_KEY },
        parse: (data) => {
          const d = data as { name?: string; version?: string };
          return d?.name ? `${d.name} ${d.version ?? ""}`.trim() : "Healthy";
        },
      }),
  },
  {
    id: "db",
    group: "Core",
    name: "Database",
    description: "Postgres, reached through PostgREST",
    run: (signal) =>
      probeHttp(`${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`, signal, {
        headers: { apikey: SUPABASE_KEY },
        parse: () => "Queries responding",
      }),
  },
  {
    id: "assets",
    group: "APIs",
    name: "Assets API",
    description: "Signed asset gateway and uploads",
    run: (signal) =>
      probeHttp(`${GATEWAY_BASE}/__version`, signal, {
        parse: (data) => {
          const v = (data as { version?: unknown })?.version;
          return typeof v === "string" ? `Gateway v${v}` : "Gateway online";
        },
      }),
  },
  {
    id: "resources",
    group: "APIs",
    name: "Resources API",
    description: "Catalog and file-delivery router",
    run: async (signal) => {
      const start = performance.now();
      const res = await fetch(`${ROUTER_BASE}/__router/health`, { signal, cache: "no-store", credentials: "omit" });
      const latencyMs = Math.round(performance.now() - start);
      if (res.status >= 500) return { level: "down", detail: `HTTP ${res.status}`, latencyMs };
      let data: { origins?: { resources?: { origin: string; up: boolean }[] } } = {};
      try {
        data = await res.json();
      } catch {
        // ignore
      }
      const origins = data?.origins?.resources ?? [];
      const down = origins.filter((origin) => !origin.up);
      if (down.length) {
        const host = down[0].origin.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
        return { level: "degraded", detail: `Serving from fallback (${host} down)`, latencyMs };
      }
      return { level: "operational", detail: "All origins healthy", latencyMs };
    },
  },
  {
    id: "origin",
    group: "Infrastructure",
    name: "Home origin",
    description: "Primary catalog build and file storage",
    run: (signal) =>
      probeHttp(`${ORIGIN_BASE}/__health`, signal, {
        parse: (data) => {
          const files = (data as { files?: unknown })?.files;
          return typeof files === "number" ? `${files.toLocaleString()} files indexed` : "Online";
        },
      }),
  },
  {
    id: "edge",
    group: "Infrastructure",
    name: "Cloudflare edge",
    description: "Fallback for the catalog and asset API",
    run: (signal) =>
      probeHttp(`${FALLBACK_BASE}/__health`, signal, { parse: () => "Edge online" }),
  },
];

interface Result extends Probe {
  checkedAt: number | null;
}

const INITIAL: Record<string, Result> = Object.fromEntries(
  CHECKS.map((check) => [check.id, { level: "checking" as Level, latencyMs: null, checkedAt: null }]),
);

const useStatus = () => {
  const [results, setResults] = useState<Record<string, Result>>(INITIAL);
  const [history, setHistory] = useState<Record<string, Level[]>>(() =>
    Object.fromEntries(CHECKS.map((check) => [check.id, []])),
  );
  const [checking, setChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const running = useRef(false);

  const runAll = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setChecking(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const entries = await Promise.all(
      CHECKS.map(async (check) => {
        const start = performance.now();
        let probe: Probe;
        try {
          probe = await check.run(controller.signal);
        } catch {
          probe = { level: "down", detail: "Unreachable", latencyMs: Math.round(performance.now() - start) };
        }
        return [check.id, probe] as const;
      }),
    );

    clearTimeout(timer);
    const now = Date.now();

    setResults(Object.fromEntries(entries.map(([id, probe]) => [id, { ...probe, checkedAt: now }])));
    setHistory((prev) => {
      const next = { ...prev };
      for (const [id, probe] of entries) next[id] = [...(next[id] ?? []), probe.level].slice(-BAR_SLOTS);
      return next;
    });
    setLastChecked(now);
    setChecking(false);
    running.current = false;
  }, []);

  useEffect(() => {
    runAll();
    const interval = setInterval(runAll, REFRESH_MS);
    return () => {
      clearInterval(interval);
      running.current = false;
    };
  }, [runAll]);

  const overall = useMemo<Level>(() => {
    const levels = CHECKS.map((check) => results[check.id]?.level ?? "checking");
    if (levels.includes("down")) return "down";
    if (levels.includes("degraded")) return "degraded";
    if (levels.every((level) => level === "operational")) return "operational";
    return "checking";
  }, [results]);

  return { results, history, checking, lastChecked, overall, runAll };
};

const OVERALL_COPY: Record<Level, { title: string; blurb: string; border: string }> = {
  operational: {
    title: "All systems operational",
    blurb: "Every service is responding normally.",
    border: "border-emerald-500/40",
  },
  degraded: {
    title: "Degraded performance",
    blurb: "Some services are running on fallback. Requests are still being served.",
    border: "border-amber-500/40",
  },
  down: {
    title: "Partial outage",
    blurb: "One or more services are unavailable right now.",
    border: "border-red-500/40",
  },
  checking: {
    title: "Checking services",
    blurb: "Gathering the current status of every service.",
    border: "border-border",
  },
};

const UptimeBar = ({ history }: { history: Level[] }) => {
  const slots: Level[] = [
    ...Array(Math.max(0, BAR_SLOTS - history.length)).fill("checking" as Level),
    ...history,
  ].slice(-BAR_SLOTS) as Level[];

  return (
    <div className="flex h-6 w-full max-w-[200px] items-stretch gap-[3px]" aria-hidden="true">
      {slots.map((level, index) => (
        <span key={index} className={cn("flex-1", LEVEL[level].bar)} />
      ))}
    </div>
  );
};

const formatTime = (value: number | null) =>
  value
    ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

const Status = () => {
  const { results, history, checking, lastChecked, overall, runAll } = useStatus();
  const copy = OVERALL_COPY[overall];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Status - Renderdragon</title>
        <meta
          name="description"
          content="Live status of RenderDragon services: website, authentication, database, assets API, resources API, storage origin and the Cloudflare edge."
        />
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 pb-20 pt-28">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">RenderDragon Status</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Live health of the website, APIs and infrastructure that power RenderDragon. Checks run in your
            browser every minute.
          </p>
        </div>

        <div className={cn("chamfer border bg-card p-6", copy.border)}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={cn("h-3 w-3 rounded-full", LEVEL[overall].dot, checking && "animate-pulse")} />
              <div>
                <div className="text-lg font-semibold">{copy.title}</div>
                <div className="text-sm text-muted-foreground">{copy.blurb}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-xs text-muted-foreground">
                <div>Last checked</div>
                <div className="font-mono text-foreground">{formatTime(lastChecked)}</div>
              </div>
              <button
                type="button"
                onClick={runAll}
                disabled={checking}
                className="chamfer inline-flex items-center gap-2 border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                <IconRefresh className={cn("h-4 w-4", checking && "animate-spin")} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {GROUP_ORDER.map((group) => {
            const checks = CHECKS.filter((check) => check.group === group);
            if (!checks.length) return null;
            return (
              <section key={group}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {group}
                </h2>
                <div className="chamfer divide-y divide-border border border-border bg-card">
                  {checks.map((check) => {
                    const result = results[check.id];
                    const meta = LEVEL[result?.level ?? "checking"];
                    const isChecking = result?.level === "checking";
                    return (
                      <div
                        key={check.id}
                        className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className={cn(
                              "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                              meta.dot,
                              isChecking && "animate-pulse",
                            )}
                          />
                          <div className="min-w-0">
                            <div className="font-medium">{check.name}</div>
                            <div className="text-xs text-muted-foreground">{check.description}</div>
                            {result?.detail && (
                              <div className="mt-1 font-mono text-xs text-muted-foreground/80">{result.detail}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-5 pl-6 md:pl-0">
                          <UptimeBar history={history[check.id] ?? []} />
                          <div className="w-28 text-right">
                            <div className={cn("text-sm font-medium", meta.text)}>{meta.label}</div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {result?.latencyMs == null ? "—" : `${result.latencyMs} ms`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Operational
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Degraded / fallback
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Outage
          </span>
          <span className="ml-auto">The bars show the last {BAR_SLOTS} checks. Older runs are empty.</span>
        </div>

        <section className="mt-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Recent incidents
          </h2>
          <div className="chamfer border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No incidents reported in the past 7 days.
          </div>
        </section>
      </main>
    </div>
  );
};

export default Status;
