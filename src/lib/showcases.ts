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

const ASSETS_API_BASE_URL = 'https://assets-api-worker.powernplant101-c6b.workers.dev';

export interface NewApiAsset {
  _id: string;
  _creationTime: number;
  email: string;
  filename: string;
  message: string;
  slug: string;
  storageId: string;
  url: string;
}

export async function listShowcases(search?: string, tag?: ShowcaseTag) {
  // Fetch only from New Assets API
  let newApiShowcases: Showcase[] = [];
  let newApiAssetsByShowcase = new Map<string, ShowcaseAsset[]>();

  try {
    const response = await fetch(`${ASSETS_API_BASE_URL}/api/assets`, { cache: 'no-store' });
    if (response.ok) {
      const assets: NewApiAsset[] = await response.json();
      
      assets.forEach((asset) => {
        // Parse tag and description from message (Format: "Tag|Description")
        let assetTag: ShowcaseTag = "Images";
        let description = asset.message;
        
        if (asset.message && asset.message.includes('|')) {
          const parts = asset.message.split('|');
          if (parts.length >= 2) {
            const possibleTag = parts[0] as ShowcaseTag;
            if (["Animations", "Images", "Music/SFX"].includes(possibleTag)) {
              assetTag = possibleTag;
              description = parts.slice(1).join('|');
            }
          }
        }

        // Apply filters
        if (tag && tag !== assetTag) return;
        if (search && !description.toLowerCase().includes(search.toLowerCase()) && !asset.filename.toLowerCase().includes(search.toLowerCase())) return;

        const showcaseId = `new-${asset._id}`;
        newApiShowcases.push({
          id: showcaseId,
          user_id: asset.email, // Using email as a unique identifier for profile fetching
          description: description,
          tag: assetTag,
          created_at: new Date(asset._creationTime).toISOString(),
        });

        const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(asset.filename);
        const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(asset.filename);
        const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(asset.filename);
        const kind: ShowcaseAsset["kind"] = isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "file";

        newApiAssetsByShowcase.set(showcaseId, [{
          id: asset.storageId,
          showcase_id: showcaseId,
          kind: kind,
          url: asset.url,
          provider: "external",
          position: 0,
          created_at: new Date(asset._creationTime).toISOString(),
        }]);
      });
    }
  } catch (err) {
    console.error("Failed to fetch from new Assets API:", err);
  }

  // Sort by creation time
  const allShowcases = newApiShowcases.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  return { showcases: allShowcases, assetsByShowcase: newApiAssetsByShowcase };
}

export async function createShowcase(params: {
  description: string;
  tag: ShowcaseTag;
  file: File;
}) {
  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Must be logged in to create a showcase");

  const formData = new FormData();
  formData.append('file', params.file);
  // Auto-generate a slug: "user-timestamp-random"
  const slug = `asset-${user.id.substring(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  formData.append('slug', slug);
  // Pass the user's email automatically
  formData.append('email', user.email || 'anonymous@renderdragon.org');
  // Encode tag into message: "Tag|Description"
  formData.append('message', `${params.tag}|${params.description}`);

  const response = await fetch(`${ASSETS_API_BASE_URL}/api/assets`, {
    method: 'POST',
    body: formData,
    cache: 'no-store'
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "Failed to upload asset to new API");
  }
  
  const result = await response.json();

  // Return synthetic showcase object based on the upload
  return {
    id: `new-${result.id}`,
    user_id: user.email || 'anonymous@renderdragon.org',
    description: params.description,
    tag: params.tag,
    created_at: new Date().toISOString()
  } as Showcase;
}
