import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Use a broadly-typed client so we can work with tables created by migrations
const sb = supabase as SupabaseClient;

export type ShowcaseTag = "Animations" | "Images" | "Music/SFX";

export type Showcase = {
  id: string;
  user_id: string;
  description: string | null;
  tag: ShowcaseTag;
  created_at: string;
};

export type ShowcaseAsset = {
  id: string;
  showcase_id: string;
  kind: "image" | "video" | "audio" | "file";
  url: string;
  provider: "uploadthing" | "external";
  position: number;
  created_at: string;
};

export async function listShowcases(search?: string, tag?: ShowcaseTag) {
  let query = sb.from("showcases").select("*").order("created_at", { ascending: false });
  if (search && search.trim()) {
    // Simple ILIKE filter on description
    query = query.ilike("description", `%${search.trim()}%`);
  }
  if (tag) {
    query = query.eq("tag", tag);
  }
  const { data: showcases, error } = await query;
  if (error) throw error;
  if (!showcases || showcases.length === 0)
    return { showcases: [] as Showcase[], assetsByShowcase: new Map<string, ShowcaseAsset[]>() };

  const ids = (showcases as Array<{ id: string }>).map((s) => s.id);
  const { data: assets, error: aErr } = await sb
    .from("showcase_assets")
    .select("*")
    .in("showcase_id", ids)
    .order("position", { ascending: true });
  if (aErr) throw aErr;
  const byShowcase = new Map<string, ShowcaseAsset[]>();
  (assets as unknown as ShowcaseAsset[] | null)?.forEach((a) => {
    const arr = byShowcase.get(a.showcase_id) || [];
    arr.push(a);
    byShowcase.set(a.showcase_id, arr);
  });
  return { showcases: showcases as unknown as Showcase[], assetsByShowcase: byShowcase };
}

export async function createShowcase(params: {
  description: string;
  tag: ShowcaseTag;
  assets: Array<{ url: string; kind: ShowcaseAsset["kind"]; provider: "uploadthing" | "external" }>;
}) {
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Must be logged in to create a showcase");

  const { data: showcase, error: sErr } = await sb
    .from("showcases")
    .insert({ user_id: user.id, description: params.description, tag: params.tag })
    .select("*")
    .single();
  if (sErr) throw sErr;

  if (params.assets.length > 0) {
    const toInsert = params.assets.map((a, idx) => ({
      showcase_id: (showcase as { id: string }).id,
      kind: a.kind,
      url: a.url,
      provider: a.provider,
      position: idx,
    }));
    const { error: aErr } = await sb.from("showcase_assets").insert(toInsert);
    if (aErr) throw aErr;
  }

  return showcase as unknown as Showcase;
}
