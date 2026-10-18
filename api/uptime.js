import { isAllowedOrigin } from './cors.js';

// ---------------------------------------------------------------------------
// Status feed for /status.
//
// Uptime Kuma runs on e3 and answers on kuma.codersoft.xyz. Its status-page API
// sends no CORS headers, so the browser can't call it directly. This handler
// fetches the three Kuma endpoints server-side and returns one payload.
// ---------------------------------------------------------------------------

const BASE = (process.env.UPTIME_KUMA_URL || 'https://kuma.codersoft.xyz').replace(/\/+$/, '');
const SLUG = process.env.UPTIME_KUMA_PAGE || 'renderdragon';
const TIMEOUT_MS = 8_000;
const CACHE_MS = 30_000;
const MAX_BEATS = 50;

let cache = { key: '', at: 0, payload: null };

function getHeader(request, name) {
  const headers = request.headers;
  if (!headers) return null;
  if (typeof headers.get === 'function') return headers.get(name);
  const lower = name.toLowerCase();
  return headers[lower] ?? headers[name] ?? null;
}

function corsHeaders(request) {
  const origin = getHeader(request, 'origin');
  const headers = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
  if (origin && isAllowedOrigin(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// Kuma heartbeat states: 0 down, 1 up, 2 pending, 3 maintenance.
function stateOf(status) {
  if (status === 1) return 'up';
  if (status === 0) return 'down';
  if (status === 3) return 'maintenance';
  return 'pending';
}

async function fetchJson(path, signal) {
  const res = await fetch(`${BASE}${path}`, {
    signal,
    headers: { accept: 'application/json', 'user-agent': 'renderdragon-status' },
  });
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  return res.json();
}

function buildIncidents(payload) {
  const list = Array.isArray(payload?.incidents) ? payload.incidents : [];
  return list.map((incident) => ({
    id: incident.id,
    title: incident.title || 'Incident',
    content: incident.content || '',
    style: incident.style || 'info',
    createdAt: incident.createdDate || incident.created_date || null,
    monitor: incident.monitor_name || incident.monitorName || null,
  }));
}

async function build() {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const [page, heartbeats, incidents] = await Promise.all([
    fetchJson(`/api/status-page/${SLUG}`, signal),
    fetchJson(`/api/status-page/heartbeat/${SLUG}`, signal),
    fetchJson(`/api/status-page/${SLUG}/incident-history`, signal).catch(() => null),
  ]);

  const heartbeatList = heartbeats?.heartbeatList ?? {};
  const uptimeList = heartbeats?.uptimeList ?? {};

  const groups = (page?.publicGroupList ?? []).map((group) => ({
    id: group.id,
    name: group.name,
    monitors: (group.monitorList ?? []).map((monitor) => {
      const beats = Array.isArray(heartbeatList[monitor.id]) ? heartbeatList[monitor.id] : [];
      const last = beats[beats.length - 1];
      return {
        id: monitor.id,
        name: monitor.name,
        type: monitor.type,
        state: last ? stateOf(last.status) : 'pending',
        message: last?.msg || '',
        ping: typeof last?.ping === 'number' ? last.ping : null,
        uptime24: typeof uptimeList[`${monitor.id}_24`] === 'number' ? uptimeList[`${monitor.id}_24`] : null,
        beats: beats.slice(-MAX_BEATS).map((beat) => ({
          status: stateOf(beat.status),
          time: beat.time,
          ping: typeof beat.ping === 'number' ? beat.ping : null,
        })),
      };
    }),
  }));

  const monitors = groups.flatMap((group) => group.monitors);
  const summary = {
    total: monitors.length,
    up: monitors.filter((monitor) => monitor.state === 'up').length,
    down: monitors.filter((monitor) => monitor.state === 'down').length,
    pending: monitors.filter((monitor) => monitor.state === 'pending').length,
  };

  return {
    ok: true,
    slug: SLUG,
    title: page?.config?.title || 'RenderDragon Status',
    description: page?.config?.description || '',
    footerText: page?.config?.footerText || '',
    refreshSeconds: page?.config?.autoRefreshInterval || 60,
    updatedAt: new Date().toISOString(),
    summary,
    groups,
    incidents: buildIncidents(incidents),
  };
}

export async function handler(request) {
  const headers = corsHeaders(request);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405, headers);

  const now = Date.now();
  if (cache.payload && cache.key === SLUG && now - cache.at < CACHE_MS) {
    return json({ ...cache.payload, cached: true }, 200, headers);
  }

  try {
    const payload = await build();
    cache = { key: SLUG, at: now, payload };
    return json({ ...payload, cached: false }, 200, headers);
  } catch (error) {
    if (cache.payload && cache.key === SLUG) {
      return json({ ...cache.payload, cached: true, stale: true, error: String(error.message || error) }, 200, headers);
    }
    return json(
      { ok: false, error: String(error.message || error), slug: SLUG, updatedAt: new Date().toISOString() },
      503,
      headers,
    );
  }
}

export default handler;
