import { Helmet } from "react-helmet-async";

const SITE_URL = "https://renderdragon.org";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export default function Seo({ title, description, path, image = "/ogimg.png" }: SeoProps) {
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  const canonical = `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  return <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:type" content="website" />
    <meta property="og:image" content={imageUrl} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />
  </Helmet>;
}
