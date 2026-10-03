import { mkdir, writeFile } from "node:fs/promises";

const site = "https://renderdragon.org";

// Static routes with a priority hint. Higher priority = more important to crawlers.
const staticRoutes = {
  "/": 1.0,
  "/resources": 0.9,
  "/generators": 0.8,
  "/guides": 0.8,
  "/gappa": 0.8,
  "/background-generator": 0.7,
  "/text-generator": 0.7,
  "/player-renderer": 0.7,
  "/youtube-downloader": 0.7,
  "/ai-title-helper": 0.7,
  "/utilities": 0.6,
  "/showcase": 0.6,
  "/blogs": 0.6,
  "/community": 0.6,
  "/guides/scriptwriting": 0.6,
  "/guides/AI": 0.6,
  "/guides/questions": 0.6,
  "/guides/copyright": 0.6,
  "/guides/thingstoask": 0.6,
  "/guides/voice": 0.6,
  "/renderbot": 0.5,
  "/native-application": 0.5,
  "/changelogs": 0.4,
  "/contact": 0.4,
  "/faq": 0.5,
  "/privacy": 0.2,
  "/tos": 0.2,
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const lastmod = new Date().toISOString();
const urlEntry = (loc, priority, changefreq = "weekly") =>
  `<url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority.toFixed(1)}</priority></url>`;

const urls = Object.entries(staticRoutes).map(([route, priority]) =>
  urlEntry(`${site}${route}`, priority, route === "/" ? "daily" : "weekly"),
);

// Public profile and creator-pack slugs are added when build credentials are available.
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  const headers = { apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY };
  const fetchJson = async (path) => {
    const pageSize = 1000;
    const rows = [];

    for (let start = 0; ; start += pageSize) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/${path}`, {
          headers: { ...headers, Range: `${start}-${start + pageSize - 1}`, Prefer: "count=exact" },
          signal: controller.signal,
        });
        if (!response.ok) return rows;

        const page = await response.json();
        if (!Array.isArray(page)) return rows;
        rows.push(...page);

        const contentRange = response.headers.get("content-range");
        const total = contentRange?.match(/\/([0-9]+)$/)?.[1];
        if (page.length < pageSize || (total && start + page.length >= Number(total))) return rows;
      } catch (error) {
        console.warn(`Skipping sitemap enrichment for ${path}:`, error instanceof Error ? error.message : error);
        return rows;
      } finally {
        clearTimeout(timeout);
      }
    }
  };
  const [profiles, packs, blogs] = await Promise.all([
    fetchJson("profiles?select=username&username=not.is.null&order=username.asc"),
    fetchJson("creator_packs?select=slug&status=eq.approved&order=slug.asc"),
    fetchJson("blogs?select=slug&published=eq.true&order=slug.asc"),
  ]);
  for (const { username } of profiles) if (username) urls.push(urlEntry(`${site}/u/${escapeXml(username)}`, 0.4));
  for (const { slug } of packs) if (slug) urls.push(urlEntry(`${site}/creator-packs/${escapeXml(slug)}`, 0.6));
  for (const { slug } of blogs) if (slug) urls.push(urlEntry(`${site}/blogs/${escapeXml(slug)}`, 0.6));
}

await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>\n`);
