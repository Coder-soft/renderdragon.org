import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  MONITOR_DESCRIPTIONS,
  STATE_META,
  averagePing,
  fetchStatus,
  formatClock,
  formatUptime,
  parseKumaTime,
  type StatusBeat,
  type StatusIncident,
  type StatusMonitor,
  type StatusPayload,
} from "@/lib/status";

// ---------------------------------------------------------------------------
// Status page. Uptime Kuma on e3 does the monitoring; /api/uptime fetches its
// status-page API server-side and hands this page one payload.
// ---------------------------------------------------------------------------

const POLL_MS = 60_000;
const BAR_SLOTS = 40;
const KUMA_PAGE = "https://kuma.codersoft.xyz/status/renderdragon";

const HeartbeatBars = ({ beats }: { beats: StatusBeat[] }) => {
  const shown = beats.slice(-BAR_SLOTS);
  const padding = Math.max(0, BAR_SLOTS - shown.length);
  return (
    <div className="hidden items-end gap-[2px] lg:flex" aria-hidden="true">
      {Array.from({ length: padding }).map((_, index) => (
        <span key={`pad-${index}`} className="h-6 w-[3px] bg-muted-foreground/15" />
      ))}
      {shown.map((beat, index) => (
        <span
          key={`${beat.time}-${index}`}
          title={`${formatClock(beat.time)}${beat.ping === null ? "" : ` · ${beat.ping} ms`}`}
          className={cn("h-6 w-[3px]", STATE_META[beat.status].bar)}
        />
      ))}
    </div>
  );
};

const MonitorRow = ({ monitor }: { monitor: StatusMonitor }) => {
  const meta = STATE_META[monitor.state];
  const description = MONITOR_DESCRIPTIONS[monitor.name];
  const ping = averagePing(monitor.beats);
  const showMessage = Boolean(monitor.message) && monitor.state !== "up";

  return (
    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
            meta.dot,
            monitor.state === "pending" && "animate-pulse",
          )}
        />
        <div className="min-w-0">
          <div className="font-medium">{monitor.name}</div>
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
          {showMessage && (
            <div className="mt-1 break-words font-mono text-xs text-muted-foreground/80">{monitor.message}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5 pl-6 md:gap-6 md:pl-0">
        <HeartbeatBars beats={monitor.beats} />
        <div className="w-24 text-right">
          <div className={cn("text-sm font-medium", meta.text)}>{meta.label}</div>
          <div className="font-mono text-xs text-muted-foreground">{ping === null ? "—" : `${ping} ms`}</div>
        </div>
        <div className="hidden w-16 text-right sm:block">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">24h</div>
          <div className="font-mono text-sm">{formatUptime(monitor.uptime24)}</div>
        </div>
      </div>
    </div>
  );
};

const summaryCopy = (summary: StatusPayload["summary"]) => {
  if (summary.down > 0) {
    return {
      tone: "down" as const,
      title: summary.down === 1 ? "One service is down" : `${summary.down} services are down`,
      blurb: `${summary.total - summary.down} of ${summary.total} checks are passing.`,
    };
  }
  if (summary.up === 0) {
    return { tone: "pending" as const, title: "Waiting for results", blurb: "No checks have reported back yet." };
  }
  if (summary.up === summary.total) {
    return { tone: "up" as const, title: "All systems operational", blurb: `All ${summary.total} checks are passing.` };
  }
  return {
    tone: "pending" as const,
    title: "Collecting results",
    blurb: `${summary.up} of ${summary.total} checks are up.`,
  };
};

const SUMMARY_TONES = {
  up: { border: "border-emerald-500/40", bg: "bg-emerald-500/5", dot: "bg-emerald-500", text: "text-emerald-400" },
  down: { border: "border-red-500/40", bg: "bg-red-500/5", dot: "bg-red-500", text: "text-red-400" },
  pending: { border: "border-border", bg: "bg-card", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

const INCIDENT_TONES: Record<string, string> = {
  info: "border-sky-500/40 bg-sky-500/5",
  primary: "border-primary/40 bg-primary/5",
  warning: "border-amber-500/40 bg-amber-500/5",
  danger: "border-red-500/40 bg-red-500/5",
};

const IncidentList = ({ incidents }: { incidents: StatusIncident[] }) => {
  if (!incidents.length) {
    return (
      <div className="chamfer border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No incidents on record.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {incidents.map((incident) => {
        const created = incident.createdAt ? parseKumaTime(incident.createdAt) : null;
        return (
          <div key={incident.id} className={cn("chamfer border p-4", INCIDENT_TONES[incident.style] ?? INCIDENT_TONES.info)}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-medium">{incident.title}</div>
              {created && (
                <div className="font-mono text-xs text-muted-foreground">{created.toLocaleString()}</div>
              )}
            </div>
            {incident.monitor && <div className="mt-1 text-xs text-muted-foreground">{incident.monitor}</div>}
            {incident.content && <div className="mt-2 text-sm text-muted-foreground">{incident.content}</div>}
          </div>
        );
      })}
    </div>
  );
};

const useStatusFeed = () => {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (background = false) => {
    if (!background) setRefreshing(true);
    try {
      const payload = await fetchStatus();
      setData(payload);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Status feed unreachable");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => load(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  return { data, error, loading, refreshing, refresh: () => load() };
};

const Status = () => {
  const { data, error, loading, refreshing, refresh } = useStatusFeed();

  const summary = data?.summary;
  const copy = summary ? summaryCopy(summary) : null;
  const tone = copy ? SUMMARY_TONES[copy.tone] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Status - Renderdragon</title>
        <meta
          name="description"
          content="Live status of RenderDragon services: website, authentication, database, assets API, resources API, storage origin and the Cloudflare edge."
        />
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 pb-20 pt-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold md:text-4xl">RenderDragon Status</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {data?.description || "Live health of the website, APIs and infrastructure that power RenderDragon."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs text-muted-foreground">
              <div>Updated</div>
              <div className="font-mono text-foreground">
                {data ? new Date(data.updatedAt).toLocaleTimeString() : "—"}
              </div>
            </div>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="chamfer inline-flex items-center gap-2 border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-60"
            >
              <IconRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="chamfer border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading the latest checks…
          </div>
        )}

        {!loading && error && !data && (
          <div className="chamfer border border-red-500/40 bg-red-500/5 p-6">
            <div className="flex items-center gap-2 font-medium text-red-400">
              <IconAlertTriangle className="h-5 w-5" />
              Status feed unavailable
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              The monitoring server did not answer. That usually means the monitoring host itself is offline.
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground/80">{error}</p>
          </div>
        )}

        {data?.stale && (
          <div className="chamfer mb-8 border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-muted-foreground">
            Showing the last successful check. The monitoring server is not answering right now.
          </div>
        )}

        {data && copy && tone && (
          <>
            <div className={cn("chamfer border p-6", tone.border, tone.bg)}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={cn("h-3 w-3 rounded-full", tone.dot, refreshing && "animate-pulse")} />
                  <div>
                    <div className="text-lg font-semibold">{copy.title}</div>
                    <div className="text-sm text-muted-foreground">{copy.blurb}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className={cn("font-medium", tone.text)}>{summary?.up}</span> up
                  {summary && summary.down > 0 && (
                    <>
                      {" · "}
                      <span className="font-medium text-red-400">{summary.down}</span> down
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-8">
              {data.groups.map((group) => (
                <section key={group.id}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {group.name}
                  </h2>
                  <div className="chamfer divide-y divide-border border border-border bg-card">
                    {group.monitors.map((monitor) => (
                      <MonitorRow key={monitor.id} monitor={monitor} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Operational
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Down
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Pending
              </span>
              <span className="ml-auto">Bars show the last {BAR_SLOTS} checks.</span>
            </div>

            <section className="mt-10">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Recent incidents
              </h2>
              <IncidentList incidents={data.incidents} />
            </section>

            <p className="mt-8 text-xs text-muted-foreground">
              Checks run every minute on our own server and are collected by Uptime Kuma.{" "}
              <a href={KUMA_PAGE} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Open the raw report
              </a>
              .
            </p>
          </>
        )}
      </main>
    </div>
  );
};

export default Status;
