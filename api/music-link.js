const CUSTOM_USER_AGENT = 'RenderDragon-CopyrightLink/1.0 (+https://renderdragon.org; music copyright reference)';
const SITE_ORIGIN = 'https://renderdragon.org';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Only allow direct links to repositories RenderDragon actually owns, so this
// endpoint cannot be abused as an open redirect/proxy for arbitrary files.
const ALLOWED_REPO_PREFIXES = [
  '/Renderdragonorg/resources_renderdragon/',
  '/Yxmura/resources_renderdragon/',
  '/Coder-soft/Minecraft-Creator-Safe-Playlist/',
];

function getHeader(request, name) {
  if (request.headers?.get) return request.headers.get(name);
  return request.headers?.[name.toLowerCase()] || request.headers?.[name] || null;
}

function getSearchParams(request) {
  try {
    return new URL(request.url || '', SITE_ORIGIN).searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function toCsvValue(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text || null;
}

function isAllowedDirectUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    if (url.hostname !== 'raw.githubusercontent.com') return false;
    return ALLOWED_REPO_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
  } catch {
    return false;
  }
}

function buildWebsiteUrl(resource) {
  const target = new URL('/resources', SITE_ORIGIN);
  if (resource.id) target.searchParams.set('track', resource.id);
  if (resource.category) target.searchParams.set('cat', resource.category);
  if (resource.file) target.searchParams.set('file', resource.file);
  if (resource.url) target.searchParams.set('url', resource.url);
  return target.toString();
}

function jsonResponse(body, status = 200, cacheSeconds = 300) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheSeconds > 0 ? `public, max-age=${cacheSeconds}` : 'no-store',
      Vary: 'Accept',
      ...CORS_HEADERS,
    },
  });
}

async function inspectDirectFile(directUrl) {
  const headers = { 'User-Agent': CUSTOM_USER_AGENT, Accept: '*/*' };
  try {
    let response = await fetch(directUrl, {
      method: 'HEAD',
      headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    let contentLength = response.headers.get('content-length');
    if (!response.ok || !contentLength) {
      response = await fetch(directUrl, {
        headers: { ...headers, Range: 'bytes=0-0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });
      contentLength = response.headers.get('content-range')?.split('/').pop() || response.headers.get('content-length');
    }

    if (!response.ok && response.status !== 206) {
      return { available: false };
    }

    const size = contentLength && Number.isFinite(Number(contentLength)) ? Number(contentLength) : null;
    const contentType = response.headers.get('content-type');
    return { available: true, size, contentType: contentType && contentType !== 'text/plain' ? contentType : null };
  } catch {
    return { available: false, error: true };
  }
}

export async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const params = getSearchParams(request);
  const resource = {
    name: toCsvValue(params.get('name')),
    url: toCsvValue(params.get('url')),
    credits: toCsvValue(params.get('credits')),
    category: toCsvValue(params.get('category')),
    ext: toCsvValue(params.get('ext')),
    file: toCsvValue(params.get('file')),
    id: toCsvValue(params.get('id')),
  };

  const accept = getHeader(request, 'accept') || '';

  // Humans opening the link in a browser land on the page where the music lives.
  if (accept.includes('text/html')) {
    return new Response(null, {
      status: 302,
      headers: { Location: buildWebsiteUrl(resource), 'Cache-Control': 'no-store', Vary: 'Accept' },
    });
  }

  const allowed = isAllowedDirectUrl(resource.url);
  const metadata = {
    service: 'RenderDragon music link',
    name: resource.name,
    credits: resource.credits,
    category: resource.category,
    extension: resource.ext,
    filename: resource.file,
    direct_url: allowed ? resource.url : null,
    raw_reference: resource.url,
    website_url: buildWebsiteUrl(resource),
    source: 'github',
    available: false,
  };

  if (!allowed) {
    metadata.error = resource.url
      ? 'The provided URL is not an allowed RenderDragon resource.'
      : 'Missing direct GitHub file URL.';
    return jsonResponse(metadata, resource.url ? 400 : 422);
  }

  const inspection = await inspectDirectFile(resource.url);
  if (inspection.error) {
    metadata.error = 'Unable to verify the direct file right now.';
    return jsonResponse(metadata, 502, 0);
  }
  metadata.available = inspection.available;
  metadata.size = inspection.size ?? null;
  metadata.content_type = inspection.contentType ?? null;
  return jsonResponse(metadata, 200);
}

// Vercel's Node.js runtime ignores a Response returned from a default-exported
// function, so expose the Web `fetch` handler it recognizes instead.
export default { fetch: handler };
