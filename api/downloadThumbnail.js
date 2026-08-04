const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// SSRF guard: only YouTube-hosted thumbnails may be fetched.
// The client only ever passes URLs from ytdl video info (i.ytimg.com / img.youtube.com).
const ALLOWED_THUMBNAIL_HOSTS = new Set([
  'i.ytimg.com',
  'img.youtube.com',
  'yt3.googleusercontent.com',
  'yt3.ggpht.com',
]);

function isAllowedThumbnailUrl(rawUrl) {
  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  return ALLOWED_THUMBNAIL_HOSTS.has(u.hostname.toLowerCase());
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const thumbnailUrl = params.get('url');
    const title = params.get('title') || 'thumbnail';

    if (!thumbnailUrl) {
      return new Response(JSON.stringify({ error: 'Thumbnail URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isAllowedThumbnailUrl(thumbnailUrl)) {
      return new Response(JSON.stringify({ error: 'URL not allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // redirect: 'manual' — never follow redirects (they could point at internal hosts)
    const response = await fetch(thumbnailUrl, { redirect: 'manual' });

    if (response.status >= 300 && response.status < 400) {
      throw new Error('Redirect not allowed');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch thumbnail: ${response.statusText}`);
    }

    const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    let extension = 'jpg';
    if (contentType.includes('webp')) {
      extension = 'webp';
    } else if (contentType.includes('png')) {
      extension = 'png';
    }

    const filename = `${safeTitle}.${extension}`;

    const headers = {
      ...corsHeaders,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': contentType,
    };

    return new Response(response.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Thumbnail download error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process thumbnail download';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
} 