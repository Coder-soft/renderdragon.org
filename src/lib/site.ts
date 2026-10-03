export const SITE_URL = "https://renderdragon.org";
export const DEFAULT_OG_IMAGE = "/ogimg.png";

const OG_IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "/ogimg.png": { width: 1920, height: 1440 },
  "/renderdragon.png": { width: 900, height: 650 },
};

export function getOgImageDimensions(image: string) {
  if (OG_IMAGE_DIMENSIONS[image]) return OG_IMAGE_DIMENSIONS[image];
  // Every per-page social card under /ogimg/ is 1000x525.
  if (image.startsWith("/ogimg/")) return { width: 1000, height: 525 };
  return undefined;
}
