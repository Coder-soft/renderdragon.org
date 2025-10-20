import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconLoader2 } from '@tabler/icons-react';
import { formatDistanceToNow } from "date-fns";

// Reuse types similar to Showcase page
type Showcase = {
  id: string;
  user_id: string;
  description: string | null;
  tag: string;
  created_at: string;
};

type ShowcaseAsset = {
  id: string;
  showcase_id: string;
  kind: "image" | "video" | "audio" | "file";
  url: string;
  provider: "uploadthing" | "external";
  position: number;
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
};

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [assetsByShowcase, setAssetsByShowcase] = useState<Map<string, ShowcaseAsset[]>>(new Map());

  const sb = supabase as SupabaseClient;
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        if (!username) return;
        // Find profile by username
        const { data: prof, error: pErr } = await sb
          .from("profiles")
          .select("id, email, display_name, avatar_url, username")
          .eq("username", username)
          .maybeSingle();
        if (pErr) throw pErr;
        if (!active) return;
        setProfile(prof || null);

        if (prof?.id) {
          // Load showcases for this user
          const { data: sc, error: sErr } = await sb
            .from("showcases")
            .select("*")
            .eq("user_id", prof.id)
            .order("created_at", { ascending: false });
          if (sErr) throw sErr;
          if (!active) return;
          const list = (sc as Showcase[]) || [];
          setShowcases(list);
          if (list.length) {
            const ids = list.map((s) => s.id);
            const { data: assets, error: aErr } = await sb
              .from("showcase_assets")
              .select("*")
              .in("showcase_id", ids)
              .order("position", { ascending: true });
            if (aErr) throw aErr;
            const map = new Map<string, ShowcaseAsset[]>();
            (assets as ShowcaseAsset[] | null)?.forEach((a) => {
              const arr = map.get(a.showcase_id) || [];
              arr.push(a);
              map.set(a.showcase_id, arr);
            });
            if (!active) return;
            setAssetsByShowcase(map);
          } else {
            setAssetsByShowcase(new Map());
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [username]);

  const name = profile?.display_name || profile?.email || profile?.username || "User";

  return (
    <div className="min-h-screen bg-background cow-grid-bg">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-12">
        <Helmet>
          <title>{profile ? `${name} • Profile | Renderdragon` : "Profile | Renderdragon"}</title>
        </Helmet>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <IconLoader2 className="h-6 w-6 animate-spin text-cow-purple" />
          </div>
        ) : !profile ? (
          <div className="text-center text-white/70 py-24">Profile not found.</div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={name} /> : null}
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-2xl font-vt323">{name}</div>
                {profile.username ? (
                  <div className="text-sm text-white/60">@{profile.username}</div>
                ) : null}
              </div>
            </div>

            {showcases.length === 0 ? (
              <div className="text-center text-white/70 py-12">No showcases yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {showcases.map((item) => {
                  const assets = assetsByShowcase.get(item.id) || [];
                  return (
                    <Card key={item.id} className="pixel-corners bg-card border-white/10">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {profile.avatar_url ? <AvatarImage src={profile.avatar_url!} alt={name} /> : null}
                            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base font-vt323">{name}</CardTitle>
                            <div className="text-xs text-white/60">{formatDistanceToNow(new Date(item.created_at))} ago</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {item.description ? (
                          <p className="mb-3 text-sm text-white/80 whitespace-pre-wrap">{item.description}</p>
                        ) : null}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {assets.map((a) => {
                            const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(a.url);
                            const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(a.url);
                            const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(a.url);
                            const kind = a.kind === "file" ? (isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "file") : a.kind;
                            return (
                              <div key={a.id} className="group pixel-corners overflow-hidden border border-white/10">
                                {kind === "image" && <img src={a.url} alt="showcase" className="w-full h-full object-cover" />}
                                {kind === "video" && <video src={a.url} controls className="w-full h-full" />}
                                {kind === "audio" && (
                                  <div className="w-full h-full flex items-center justify-center p-3 text-xs text-white/70">Audio</div>
                                )}
                                {kind === "file" && (
                                  <div className="w-full h-full flex items-center justify-center p-3 text-xs text-white/70">File</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
