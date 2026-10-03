const SITE_URL = "https://renderdragon.org";

interface SoftwareApplicationOptions {
  name: string;
  description: string;
  path: string;
  image?: string;
  category?: string;
}

export function softwareApplicationSchema({
  name,
  description,
  path,
  image,
  category = "MultimediaApplication",
}: SoftwareApplicationOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: category,
    operatingSystem: "Web browser",
    ...(image ? { image: `${SITE_URL}${image}` } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
