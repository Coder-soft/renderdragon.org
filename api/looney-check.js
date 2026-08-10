import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const DEFAULT_LOONEY_URL = 'https://looney.codersoft.xyz/check';
const DAILY_CHECK_LIMIT = 5;

const allowedOrigins = new Set([
  'https://renderdragon.org',
  'https://www.renderdragon.org',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:3000',
]);

function getHeader(request, name) {
  if (request.headers?.get) return request.headers.get(name);
  return request.headers?.[name.toLowerCase()] || request.headers?.[name] || null;
}

function getClientIp(request) {
  const forwarded = getHeader(request, 'x-forwarded-for') || getHeader(request, 'x-real-ip') || 'unknown';
  return String(forwarded).split(',')[0].trim() || 'unknown';
}

function hashIdentifier(value) {
  return crypto.createHash('sha256').update(`${process.env.SUPABASE_SECRET_KEY || 'looney-rate-limit'}:${value}`).digest('hex');
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase rate-limit storage is not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getAuthenticatedUserId(request) {
  const authorization = getHeader(request, 'authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;
  try {
    const { data } = await getSupabaseAdmin().auth.getUser(authorization.slice(7));
    return data.user?.id || null;
  } catch {
    return null;
  }
}

async function consumeRateLimit(request) {
  const browserId = getHeader(request, 'x-looney-browser-id');
  if (!browserId || String(browserId).length > 200) return { allowed: false, error: 'A browser identifier is required to run a check.' };
  const userId = await getAuthenticatedUserId(request);
  const buckets = [
    { type: 'browser', hash: hashIdentifier(`browser:${browserId}`) },
    { type: 'ip', hash: hashIdentifier(`ip:${getClientIp(request)}`) },
  ];
  if (userId) buckets.push({ type: 'account', hash: hashIdentifier(`account:${userId}`), user_id: userId });
  const { data, error } = await getSupabaseAdmin().rpc('consume_looney_check_rate_limit', { p_buckets: buckets });
  if (error) {
    // Keep local development usable before the migration is pushed; production fails closed.
    if (error.code === 'PGRST202' && process.env.NODE_ENV !== 'production') return { allowed: true };
    throw new Error(`Unable to verify check limit: ${error.message}`);
  }
  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.allowed) return { allowed: false, retryAfter: Number(result?.retry_after_seconds || 0) };
  return { allowed: true };
}

function corsHeaders(request) {
  const origin = getHeader(request, 'origin');
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'https://renderdragon.org',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function jsonResponse(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function getLooneyBaseUrl() {
  const configuredUrl = new URL(process.env.LOONEY_API_URL || DEFAULT_LOONEY_URL);
  configuredUrl.pathname = configuredUrl.pathname.replace(/\/(?:check|jobs)\/?$/, '') || '/';
  configuredUrl.search = '';
  configuredUrl.hash = '';
  return configuredUrl.toString().replace(/\/$/, '');
}

function getJobId(request) {
  const requestUrl = new URL(request.url || 'http://localhost/api/looney-check');
  const jobId = requestUrl.searchParams.get('job_id');
  if (!jobId || !/^[A-Za-z0-9_-]{1,200}$/.test(jobId)) return null;
  return jobId;
}

function upstreamHeaders(contentType, accept = 'application/json') {
  const headers = { Accept: accept };
  if (contentType) headers['Content-Type'] = contentType;
  if (process.env.LOONEY_API_KEY) headers['X-API-Key'] = process.env.LOONEY_API_KEY;
  return headers;
}

async function proxyUpstreamResponse(request, response, rewriteStatusUrl = false) {
  const responseText = await response.text();
  let responseBody;
  try {
    responseBody = JSON.parse(responseText);
  } catch {
    responseBody = { error: 'The copyright service returned an invalid response' };
  }

  if (rewriteStatusUrl && response.ok && responseBody && typeof responseBody === 'object' && responseBody.job_id) {
    responseBody = {
      ...responseBody,
      status_url: `/api/looney-check?job_id=${encodeURIComponent(responseBody.job_id)}`,
    };
  }

  return jsonResponse(request, responseBody, response.status);
}

async function proxyJobEvents(request, jobId) {
  const response = await fetch(`${getLooneyBaseUrl()}/jobs/${encodeURIComponent(jobId)}/events`, {
    headers: upstreamHeaders(undefined, 'text/event-stream'),
    signal: AbortSignal.timeout(300000),
  });

  if (!response.ok || !response.body) return proxyUpstreamResponse(request, response);

  return new Response(response.body, {
    status: response.status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

async function readBody(request) {
  if (Buffer.isBuffer(request.body) || request.body instanceof Uint8Array) {
    return Buffer.from(request.body);
  }

  if (request.body && typeof request.body !== 'object') {
    return Buffer.from(String(request.body));
  }

  if (!request[Symbol.asyncIterator]) return Buffer.alloc(0);

  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_UPLOAD_BYTES + 1024 * 1024) {
      throw new Error('Upload exceeds the 50 MB limit');
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

async function buildUpstreamRequest(request) {
  const contentType = getHeader(request, 'content-type') || '';

  if (contentType.toLowerCase().startsWith('multipart/form-data')) {
    const body = await readBody(request);
    if (body.length > MAX_UPLOAD_BYTES + 1024 * 1024) {
      throw new Error('Upload exceeds the 50 MB limit');
    }
    return { body, contentType };
  }

  let payload = request.body;
  if (!payload || typeof payload !== 'object' || Buffer.isBuffer(payload) || (!('spotify_url' in payload) && !('file_url' in payload))) {
    const rawBody = await readBody(request);
    if (rawBody.length) {
      try {
        payload = JSON.parse(rawBody.toString('utf8'));
      } catch {
        throw new Error('Invalid JSON request');
      }
    } else {
      payload = null;
    }
  }

  if (!payload || (typeof payload.spotify_url !== 'string' && typeof payload.file_url !== 'string')) {
    throw new Error('Provide a Spotify track URL or an audio file');
  }

  if (typeof payload.file_url === 'string') {
    let fileUrl;
    try {
      fileUrl = new URL(payload.file_url);
    } catch {
      throw new Error('Enter a valid public audio file URL');
    }
    if (!['http:', 'https:'].includes(fileUrl.protocol)) throw new Error('Enter a valid public audio file URL');
    return { body: JSON.stringify({ file_url: fileUrl.toString() }), contentType: 'application/json' };
  }

  let spotifyUrl;
  try {
    spotifyUrl = new URL(payload.spotify_url);
  } catch {
    throw new Error('Enter a valid Spotify track URL');
  }

  if (spotifyUrl.hostname !== 'open.spotify.com' || !spotifyUrl.pathname.startsWith('/track/')) {
    throw new Error('Enter a valid Spotify track URL');
  }

  return {
    body: JSON.stringify({ spotify_url: spotifyUrl.toString() }),
    contentType: 'application/json',
  };
}

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '52mb',
  },
  maxDuration: 300,
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method === 'GET') {
    const jobId = getJobId(request);
    if (!jobId) return jsonResponse(request, { error: 'Missing or invalid job ID' }, 400);

    try {
      const requestUrl = new URL(request.url || 'http://localhost/api/looney-check');
      if (requestUrl.searchParams.get('stream') === '1') {
        return await proxyJobEvents(request, jobId);
      }

      const response = await fetch(`${getLooneyBaseUrl()}/jobs/${encodeURIComponent(jobId)}`, {
        headers: upstreamHeaders(),
        signal: AbortSignal.timeout(10000),
      });
      return proxyUpstreamResponse(request, response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to read the copyright job';
      return jsonResponse(request, { error: message }, 502);
    }
  }

  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'Method not allowed' }, 405);
  }

  try {
    const upstream = await buildUpstreamRequest(request);
    const rateLimit = await consumeRateLimit(request);
    if (!rateLimit.allowed) {
      const retryAfter = String(rateLimit.retryAfter || 86400);
      return jsonResponse(request, { error: `Daily limit reached. You can run up to ${DAILY_CHECK_LIMIT} checks per day.`, retry_after_seconds: Number(retryAfter) }, 429);
    }
    const response = await fetch(`${getLooneyBaseUrl()}/jobs`, {
      method: 'POST',
      headers: upstreamHeaders(upstream.contentType),
      body: upstream.body,
      signal: AbortSignal.timeout(30000),
    });
    return proxyUpstreamResponse(request, response, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to check this track';
    const status = message.includes('50 MB') || message.includes('valid') || message.includes('Provide') || message.includes('Invalid JSON') ? 400 : 502;
    return jsonResponse(request, { error: message }, status);
  }
}
