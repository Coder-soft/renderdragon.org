// Fast path for the two cacheable routes of the Resources RenderDragon API.
//
// Why this exists: the original build fetches the full git tree from GitHub and
// assembles a 3.6 MB payload, and even a cache hit re-parses and re-serialises
// that payload. Against the Workers Free plan budget (10 ms CPU per request)
// that trips error 1102 most of the time. Here:
//   - /all is assembled from the per-category KV values by string concatenation,
//     with no JSON.parse and no JSON.stringify.
//   - a cache hit streams the stored body back untouched.
//   - everything else (and any failure) falls through to the original handler.
import orig from "./orig.js";

const CATEGORIES = [
  "animations",
  "fonts",
  "images",
  "mcicons",
  "mcsounds",
  "music",
  "presets",
  "resources",
  "sfx",
];

const GITHUB_REPO = "Renderdragonorg/resources_renderdragon";
const GITHUB_BRANCH = "main";
const CACHE_TTL = 3600;
const CACHE_VERSION = "v4-kv";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const isCacheable = (path) => path === "/all" || path.startsWith("/category/");

// The KV values are compact JSON arrays, so counting "id" keys is exact and
// avoids parsing megabytes of JSON just to read lengths.
function countItems(text) {
  let index = 0;
  let count = 0;
  while ((index = text.indexOf('{"id":', index)) !== -1) {
    count += 1;
    index += 6;
  }
  return count;
}

async function buildAll(env) {
  const parts = [];
  let totalFiles = 0;
  for (const category of CATEGORIES) {
    const raw = await env.RESOURCES_KV.get(`category:${category}`, "text");
    if (raw === null) {
      parts.push(`"${category}":[]`);
      continue;
    }
    totalFiles += countItems(raw);
    parts.push(`"${category}":${raw}`);
  }
  return `{"categories":{${parts.join(",")}},"totalCategories":${CATEGORIES.length},"totalFiles":${totalFiles},"source":"kv"}`;
}

async function buildCategory(env, category) {
  const raw = await env.RESOURCES_KV.get(`category:${category}`, "text");
  if (raw === null) return null;
  return `{"category":${JSON.stringify(category)},"files":${raw},"total":${countItems(raw)},"repository":"https://github.com/${GITHUB_REPO}/tree/${GITHUB_BRANCH}/${category}","source":"kv-cache"}`;
}

function passthrough(cached, status) {
  const headers = new Headers(cached.headers);
  for (const [name, value] of Object.entries(CORS)) headers.set(name, value);
  headers.set("X-Cache", status);
  headers.set("X-Cache-Version", CACHE_VERSION);
  return new Response(cached.body, { status: 200, headers });
}

function json(body, status, extra = {}) {
  return new Response(body, {
    status,
    headers: { ...CORS, "Content-Type": "application/json", "X-Cache-Version": CACHE_VERSION, ...extra },
  });
}

export default {
  async fetch(request, env, ctx) {
    let url;
    try {
      url = new URL(request.url);
    } catch {
      return orig.fetch(request, env, ctx);
    }

    const path = url.pathname;
    if (request.method !== "GET" || !isCacheable(path) || !env || !env.RESOURCES_KV) {
      return orig.fetch(request, env, ctx);
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    const cached = await cache.match(cacheKey);

    // Serve what we already have, byte for byte.
    if (cached) {
      const cachedAt = Number.parseInt(cached.headers.get("X-Cached-At") || "0", 10);
      const age = cachedAt ? (Date.now() - cachedAt) / 1000 : Number.POSITIVE_INFINITY;
      if (age < CACHE_TTL) return passthrough(cached, "HIT");
    }

    // Cold, or the cached copy aged out: rebuild from KV.
    try {
      let body = null;
      if (path === "/all") {
        body = await buildAll(env);
      } else {
        const category = decodeURIComponent(path.slice("/category/".length)).toLowerCase();
        body = await buildCategory(env, category);
      }

      if (body !== null) {
        const stored = new Response(body, {
          headers: {
            ...CORS,
            "Content-Type": "application/json",
            "X-Cached-At": String(Date.now()),
            "Cache-Control": `public, max-age=${CACHE_TTL}`,
          },
        });
        ctx.waitUntil(cache.put(cacheKey, stored.clone()));
        return json(body, 200, { "X-Cache": "MISS" });
      }
    } catch (error) {
      console.warn(`KV build failed for ${path}: ${(error && error.message) || error}`);
    }

    // Unknown category, missing KV data, or a KV failure: use the original handler.
    return orig.fetch(request, env, ctx);
  },
};
