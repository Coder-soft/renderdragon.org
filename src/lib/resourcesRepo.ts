import type { Resource } from "@/types/resources";

export const RESOURCES_REPO_RAW_BASE =
  "https://raw.githubusercontent.com/Renderdragonorg/resources_renderdragon/main";

export const RESOURCES_REPO_BLOB_BASE =
  "https://github.com/Renderdragonorg/resources_renderdragon/blob/main";

export const buildResourceRepoUrl = (resource: Resource): string | undefined => {
  if (!resource?.title || !resource?.category || !resource?.filetype) {
    return undefined;
  }
  const titleLowered = resource.title.toLowerCase().replace(/ /g, "%20");
  const creditPart = resource.credit
    ? `__${resource.credit.replace(/ /g, "_")}`
    : "";
  return `${RESOURCES_REPO_RAW_BASE}/${resource.category}/${titleLowered}${creditPart}.${resource.filetype}`;
};
