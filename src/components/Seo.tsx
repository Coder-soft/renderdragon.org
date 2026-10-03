import { Helmet } from "react-helmet-async";
import { DEFAULT_OG_IMAGE, SITE_URL, getOgImageDimensions } from "@/lib/site";

const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

type JsonLd = Record<string, unknown>;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  robots?: string;
  jsonLd?: JsonLd | JsonLd[];
}

export default function Seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  type = "website",
  robots = DEFAULT_ROBOTS,
  jsonLd,
}: SeoProps) {
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  const canonical = `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const dimensions = getOgImageDimensions(image);
  const alt = imageAlt ?? title;
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
      {dimensions && <meta property="og:image:width" content={String(dimensions.width)} />}
      {dimensions && <meta property="og:image:height" content={String(dimensions.height)} />}
      <meta property="og:image:alt" content={alt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={alt} />
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
