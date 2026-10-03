import { Helmet } from "react-helmet-async";

const SITE_URL = "https://renderdragon.org";
const DEFAULT_IMAGE = "/ogimg.png";
const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

type JsonLd = Record<string, unknown>;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  robots?: string;
  jsonLd?: JsonLd | JsonLd[];
}

export default function Seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  robots = DEFAULT_ROBOTS,
  jsonLd,
}: SeoProps) {
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  const canonical = `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {robots && <meta name="robots" content={robots} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
