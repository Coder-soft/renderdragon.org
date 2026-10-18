// Shared types and helpers for the status page, fed by /api/uptime (Uptime Kuma
// on e3). Kuma stores heartbeat times in UTC without a zone marker.

export type MonitorState = "up" | "down" | "pending" | "maintenance";

export interface StatusBeat {
  status: MonitorState;
  time: string;
  ping: number | null;
}

export interface StatusMonitor {
  id: number;
  name: string;
  type: string;
  state: MonitorState;
  message: string;
  ping: number | null;
  uptime24: number | null;
  beats: StatusBeat[];
}

export interface StatusGroup {
  id: number;
  name: string;
  monitors: StatusMonitor[];
}

export interface StatusIncident {
  id: number;
  title: string;
  content: string;
  style: string;
  createdAt: string | null;
  monitor: string | null;
}

export interface StatusPayload {
  ok: boolean;
  slug: string;
  title: string;
  description: string;
  footerText?: string;
  refreshSeconds?: number;
  updatedAt: string;
  cached?: boolean;
  stale?: boolean;
  error?: string;
  summary: { total: number; up: number; down: number; pending: number };
  groups: StatusGroup[];
  incidents: StatusIncident[];
}

export const STATE_META: Record<MonitorState, { label: string; dot: string; text: string; bar: string }> = {
  up: { label: "Operational", dot: "bg-emerald-500", text: "text-emerald-400", bar: "bg-emerald-500/80" },
  down: { label: "Down", dot: "bg-red-500", text: "text-red-400", bar: "bg-red-500/80" },
  pending: { label: "Pending", dot: "bg-muted-foreground", text: "text-muted-foreground", bar: "bg-muted-foreground/30" },
  maintenance: { label: "Maintenance", dot: "bg-sky-500", text: "text-sky-400", bar: "bg-sky-500/80" },
};

// Kuma's public status-page API exposes monitor names but not descriptions, so
// the short blurbs live here, keyed by monitor name.
export const MONITOR_DESCRIPTIONS: Record<string, string> = {
  "Website (renderdragon.org)": "The site itself.",
  "Supabase Auth": "Sign-in, sessions, and partner OAuth.",
  "Supabase Database": "Postgres, reached through PostgREST.",
  "Supabase Storage": "Avatars and uploaded files.",
  "API router (health)": "Signed request router and its origin pools.",
  "API router (version)": "Deployed router build.",
  "Browser gateway": "Mints browser sessions and signs API requests.",
  "Asset uploads worker": "Community uploads and the showcase.",
  "Analytics": "Traffic analytics.",
  "Looney check API": "Music copyright checks.",
  "Assets origin (e3)": "Catalog and files served from the home server.",
  "assets API (public)": "Public asset catalog.",
  "files host (public)": "Public file host.",
  "filehost (files.codersoft.xyz origin)": "File host running on the home server.",
  "assets API (e3 origin)": "Asset catalog running on the home server.",
  "e3 host (ping)": "Home server reachability.",
  "SSH (e3)": "Remote access to the home server.",
  "renderbot (Discord copyright bot)": "Discord bot for copyright checks.",
  "music-copyright checker": "Copyright checker running on the home server.",
};

export async function fetchStatus(signal?: AbortSignal): Promise<StatusPayload> {
  const res = await fetch("/api/uptime", { signal, headers: { accept: "application/json" } });
  const data = (await res.json()) as StatusPayload;
  if (!res.ok && data?.ok !== true) {
    throw new Error(data?.error || `Status feed responded ${res.status}`);
  }
  return data;
}

export function parseKumaTime(time: string): Date | null {
  if (!time) return null;
  const iso = time.includes("T") ? time : time.replace(" ", "T");
  const date = new Date(/Z$|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatClock(time: string): string {
  const date = parseKumaTime(time);
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatUptime(uptime24: number | null): string {
  if (uptime24 === null) return "—";
  const percent = uptime24 * 100;
  if (percent >= 100) return "100%";
  // Two decimals keeps a single failed check in a day visible.
  return `${percent.toFixed(percent >= 99 ? 2 : 1)}%`;
}

export function averagePing(beats: StatusBeat[]): number | null {
  const pings = beats.map((beat) => beat.ping).filter((ping): ping is number => typeof ping === "number");
  if (!pings.length) return null;
  return Math.round(pings.reduce((total, ping) => total + ping, 0) / pings.length);
}
