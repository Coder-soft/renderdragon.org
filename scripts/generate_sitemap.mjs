import { mkdir, writeFile } from "node:fs/promises";

const site = "https://renderdragon.org";
const routes = [
  "/", "/resources", "/blogs", "/guides", "/faq", "/contact", "/showcase",
  "/community", "/changelogs", "/utilities", "/generators", "/background-generator",
  "/text-generator", "/ai-title-helper", "/youtube-downloader", "/player-renderer",
  "/renderbot", "/native-application", "/music-copyright", "/tos", "/privacy",
];

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const urls = routes.map((route) => `<url><loc>${site}${route}</loc></url>`);

// Public profile and creator-pack slugs are added when build credentials are available.
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  const headers = { apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY };
  const [profiles, packs, blogs] = await Promise.all([
    fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=username&username=not.is.null`, { headers }),
    fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/creator_packs?select=slug&is_public=eq.true`, { headers }),
    fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/blogs?select=slug&published=eq.true`, { headers }),
  ]);
  if (profiles.ok) for (const { username } of await profiles.json()) if (username) urls.push(`<url><loc>${site}/u/${escapeXml(username)}</loc></url>`);
  if (packs.ok) for (const { slug } of await packs.json()) if (slug) urls.push(`<url><loc>${site}/creator-packs/${escapeXml(slug)}</loc></url>`);
  if (blogs.ok) for (const { slug } of await blogs.json()) if (slug) urls.push(`<url><loc>${site}/blogs/${escapeXml(slug)}</loc></url>`);
}

await mkdir("public", { recursive: true });
await writeFile("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>\n`);
