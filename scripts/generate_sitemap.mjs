import { mkdir, writeFile } from "node:fs/promises";

const site = "https://renderdragon.org";
const routes = [
  "/", "/resources", "/blogs", "/guides", "/faq", "/contact", "/showcase",
  "/community", "/changelogs", "/utilities", "/generators", "/background-generator",
  "/text-generator", "/ai-title-helper", "/youtube-downloader", "/player-renderer",
  "/renderbot", "/native-application", "/tos", "/privacy",
  "/guides/scriptwriting", "/guides/AI", "/guides/questions", "/guides/copyright", "/guides/thingstoask", "/guides/voice",
];

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const urls = routes.map((route) => `<url><loc>${site}${route}</loc></url>`);

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
  for (const { username } of profiles) if (username) urls.push(`<url><loc>${site}/u/${escapeXml(username)}</loc></url>`);
  for (const { slug } of packs) if (slug) urls.push(`<url><loc>${site}/creator-packs/${escapeXml(slug)}</loc></url>`);
  for (const { slug } of blogs) if (slug) urls.push(`<url><loc>${site}/blogs/${escapeXml(slug)}</loc></url>`);
}

await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>\n`);
