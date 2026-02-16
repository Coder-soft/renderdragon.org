import { readCache, writeCache } from "@/lib/cache";
import { Resource } from "@/types/resources";

const API_BASE = "https://hamburger-api.powernplant101-c6b.workers.dev";
const ALL_RESOURCES_CACHE_KEY = "api:all-resources";
const CATEGORIES_CACHE_KEY = "api:categories";
const CATEGORY_CACHE_PREFIX = "api:category:";

export const MCICONS_BLACKLISTED_SUBCATEGORIES = ['backgrounds'];

export interface ApiResource {
  id: number;
  title: string;
  credit: string;
  filename: string;
  ext: string;
  url: string;
  size: number;
  subcategory?: string;
}

export interface ApiCategories {
  categories: string[];
  total: number;
}

export interface ApiAllResources {
  categories: Record<string, ApiResource[]>;
}

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, {
      cache: "default",
      headers: {
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

const normalizeCategory = (category: string): Resource["category"] => {
  if (category === "mcicons") return "minecraft-icons";
  if (category === "resources") return "images";
  return category as Resource["category"];
};

const toApiCategory = (category: string): string => {
  if (category === "minecraft-icons") return "mcicons";
  if (category === "images") return "images";
  return category;
};

const inferSubcategory = (url: string, category: string): string | undefined => {
  if (category !== "presets") return undefined;
  const lower = url.toLowerCase();
  if (lower.includes("/adobe/")) return "adobe";
  if (lower.includes("/davinci/")) return "davinci";
  if (lower.includes("/previews/")) return "previews";
  return undefined;
};

const normalizeApiResource = (item: ApiResource, category: string): Resource => {
  const normalizedCategory = normalizeCategory(category);
  let subcategory: string | undefined = item.subcategory || undefined;
  
  if (!subcategory && category === "presets") {
    subcategory = inferSubcategory(item.url, category);
  }
  
  return {
    id: item.id,
    title: item.title,
    category: normalizedCategory,
    subcategory,
    credit: item.credit || undefined,
    filetype: item.ext,
    download_url: item.url,
    preview_url: undefined,
    image_url: undefined,
    software: undefined,
    description: undefined,
  };
};

export const fetchCategories = async (): Promise<ApiCategories | null> => {
  const cached = readCache<ApiCategories>(CATEGORIES_CACHE_KEY);
  if (cached) return cached;

  const data = await fetchJson<ApiCategories>(`${API_BASE}/categories`);
  if (data) {
    writeCache(CATEGORIES_CACHE_KEY, data);
    return data;
  }
  return null;
};

export const fetchCategory = async (category: string): Promise<Resource[]> => {
  const cacheKey = `${CATEGORY_CACHE_PREFIX}${category}`;
  const cached = readCache<ApiResource[]>(cacheKey);
  if (cached) {
    return cached.map(item => normalizeApiResource(item, category));
  }

  const apiCategory = toApiCategory(category);
  const data = await fetchJson<{ category: string; files: ApiResource[] }>(
    `${API_BASE}/category/${apiCategory}`
  );
  if (data?.files) {
    writeCache(cacheKey, data.files);
    return data.files.map(item => normalizeApiResource(item, category));
  }
  return [];
};

export const fetchAllResources = async (): Promise<Resource[]> => {
  const cached = readCache<ApiAllResources>(ALL_RESOURCES_CACHE_KEY);
  if (cached) {
    return Object.entries(cached.categories).flatMap(([category, items]) =>
      items.map(item => normalizeApiResource(item, category))
    );
  }

  const data = await fetchJson<ApiAllResources>(`${API_BASE}/all`);
  if (data?.categories) {
    writeCache(ALL_RESOURCES_CACHE_KEY, data);
    return Object.entries(data.categories).flatMap(([category, items]) =>
      items.map(item => normalizeApiResource(item, category))
    );
  }
  return [];
};

export const refreshAllResources = async (): Promise<Resource[]> => {
  const data = await fetchJson<ApiAllResources>(`${API_BASE}/all`);
  if (data?.categories) {
    writeCache(ALL_RESOURCES_CACHE_KEY, data);
    return Object.entries(data.categories).flatMap(([category, items]) =>
      items.map(item => normalizeApiResource(item, category))
    );
  }
  return [];
};

export const getResourceByCategory = async (category: string): Promise<Resource[]> => {
  const apiCategory = toApiCategory(category);
  const allCached = readCache<ApiAllResources>(ALL_RESOURCES_CACHE_KEY);
  if (allCached?.categories?.[apiCategory]) {
    return allCached.categories[apiCategory].map(item =>
      normalizeApiResource(item, category)
    );
  }

  return fetchCategory(category);
};

export const getAvailableCategories = (): string[] => {
  const cached = readCache<ApiCategories>(CATEGORIES_CACHE_KEY);
  return cached?.categories || [];
};
