import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { UploadButton } from "@/components/UploadThingClient";
import { createShowcase, listShowcases, type Showcase, type ShowcaseAsset, type ShowcaseTag } from "@/lib/showcases";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2, IconPlus, IconSearch } from '@tabler/icons-react';
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthDialog from "@/components/auth/AuthDialog";

type ShowcaseWithAssets = Showcase & { assets: ShowcaseAsset[]; profile?: { display_name?: string | null; avatar_url?: string | null; email?: string | null; username?: string | null } };

type NewAsset = { url: string; kind: ShowcaseAsset["kind"]; provider: "uploadthing" | "external" };

const useProfiles = (userIds: string[]) => {
  const [profiles, setProfiles] = useState<Record<string, { display_name?: string | null; avatar_url?: string | null; email?: string | null; username?: string | null }>>({});
  useEffect(() => {
    const unique = Array.from(new Set(userIds)).filter(Boolean);
    if (unique.length === 0) return;
    (async () => {
      const { data, error } = await supabase.from("profiles").select("id, display_name, email, avatar_url, username").in("id", unique);
      if (!error && data) {
        const map: Record<string, { display_name?: string | null; avatar_url?: string | null; email?: string | null; username?: string | null }> = {};
        for (const row of data as any[]) map[row.id] = { display_name: row.display_name, email: row.email, avatar_url: (row as any).avatar_url, username: (row as any).username };
        setProfiles(map);
      }
    })();
  }, [JSON.stringify(userIds.sort())]);
  return profiles;
};

const ShowcaseCard: React.FC<{ item: ShowcaseWithAssets }> = ({ item }) => {
  const name = item.profile?.display_name || item.profile?.email || "Anonymous";
  const profileUrl = item.profile?.username ? `/u/${item.profile.username}` : undefined;
  const avatar = item.profile?.avatar_url;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<ShowcaseAsset | null>(null);
  return (
    <Card className="pixel-corners bg-card border-white/10 w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          {profileUrl ? (
            <Link to={profileUrl} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Avatar className="h-9 w-9">
                {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
                <AvatarFallback>{name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-vt323">{name}</CardTitle>
                <div className="text-xs text-white/60">{formatDistanceToNow(new Date(item.created_at))} ago</div>
              </div>
            </Link>
          ) : (
            <>
              <Avatar className="h-9 w-9">
                {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
                <AvatarFallback>{name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-vt323">{name}</CardTitle>
                <div className="text-xs text-white/60">{formatDistanceToNow(new Date(item.created_at))} ago</div>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {item.description ? (
          <p className="mb-3 text-sm text-white/80 whitespace-pre-wrap">{item.description}</p>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {item.assets.filter((a) => {
            const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(a.url);
            const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(a.url);
            const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(a.url);
            return isImage || isVideo || isAudio || ["image","video","audio"].includes(a.kind);
          }).map((a) => {
            const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(a.url);
            const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(a.url);
            const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(a.url);
            const baseKind = ["image","video","audio"].includes(a.kind) ? a.kind : "file";
            const effectiveKind = baseKind === "file" ? (isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "file") : baseKind as typeof a.kind;
            return (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setPreviewAsset(a);
                setPreviewOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setPreviewAsset(a);
                  setPreviewOpen(true);
                }
              }}
              className="group pixel-corners overflow-hidden border border-white/10 cursor-zoom-in transition-transform duration-200 hover:scale-[1.015] hover:border-white/20 h-56 bg-background/40"
            
            >
              {(effectiveKind === "image") && (
                <img src={a.url} alt="showcase" className="w-full h-full object-cover" />
              )}
              {(effectiveKind === "video") && (
                <video src={a.url} controls className="w-full h-full object-cover" />
              )}
              {(effectiveKind === "audio") && (
                <div className="w-full h-full flex items-center justify-center p-3 text-xs text-white/70">Audio</div>
              )}
              {(effectiveKind === "file") && (
                <div className="w-full h-full flex items-center justify-center p-3 text-xs text-white/70">Unsupported</div>
              )}
            </div>
            );
          })}
        </div>
      </CardContent>
      {/* Lightbox dialog for preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl bg-popover/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="font-vt323">Preview</DialogTitle>
          </DialogHeader>
          <div className="w-full max-h-[80vh] flex items-center justify-center">
            {(() => {
              if (!previewAsset) return null;
              const url = previewAsset.url;
              const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);
              const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(url);
              const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(url);
              const baseKind = ["image","video","audio"].includes(previewAsset.kind) ? previewAsset.kind : "file";
              const kind = baseKind === "file" ? (isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "file") : baseKind;
              if (kind === "image") return <img src={url} alt="preview" className="max-h-[80vh] w-auto h-auto object-contain" />;
              if (kind === "video") return <video src={url} controls autoPlay className="max-h-[80vh] w-auto h-auto object-contain" />;
              if (kind === "audio") return <audio src={url} controls className="w-full" />;
              return (
                <a href={url} target="_blank" rel="noreferrer" className="underline text-cow-purple">Open file</a>
              );
            })()}
          </div>
          {/* Filename and actions */}
          {previewAsset ? (
            <div className="mt-4 w-full flex items-center justify-between gap-2 flex-wrap">
              {(() => {
                const url = previewAsset.url;
                const filename = (() => {
                  try {
                    const u = new URL(url);
                    return decodeURIComponent(u.pathname.split('/').pop() || '');
                  } catch {
                    const clean = url.split('?')[0].split('#')[0];
                    const parts = clean.split('/');
                    return decodeURIComponent(parts[parts.length - 1] || '');
                  }
                })();
                return <div className="text-xs text-white/70 break-all">{filename || url}</div>;
              })()}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="pixel-corners border border-white/10 bg-background/40 hover:bg-background/60 text-white text-sm px-3 py-1"
                  onClick={() => window.open(previewAsset.url, '_blank', 'noopener')}
                >
                  Open
                </button>
                <a
                  href={previewAsset.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="pixel-corners bg-cow-purple hover:bg-cow-purple/90 text-white text-sm px-3 py-1"
                >
                  Download
                </a>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const ShowcasePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ShowcaseWithAssets[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tagFilter, setTagFilter] = useState<ShowcaseTag | "All">("All");
  const [tag, setTag] = useState<ShowcaseTag | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const [desc, setDesc] = useState("");
  const [uploaded, setUploaded] = useState<NewAsset[]>([]);
  const [externalLinks, setExternalLinks] = useState<string[]>([""]);
  const [uploadQueue, setUploadQueue] = useState<Array<{ id: string; name: string; status: 'uploading' | 'done'; kind: NewAsset['kind']; url?: string }>>([]);
  const [currentPreviewIdx, setCurrentPreviewIdx] = useState(0);
  const hasPendingUploads = useMemo(() => uploadQueue.some((q) => q.status === 'uploading'), [uploadQueue]);

  const load = async (q?: string, t?: ShowcaseTag | "All") => {
    setLoading(true);
    try {
      const { showcases, assetsByShowcase } = await listShowcases(q, (t ?? tagFilter) !== "All" ? (t ?? tagFilter) as ShowcaseTag : undefined);
      const userIds = showcases.map((s) => s.user_id);
      const profiles = await (async () => {
        const map: Record<string, { display_name?: string | null; avatar_url?: string | null; email?: string | null; username?: string | null }> = {};
        if (userIds.length) {
          const { data } = await supabase.from("profiles").select("id, display_name, email, avatar_url, username").in("id", userIds);
          for (const row of (data || []) as any[]) map[row.id] = { display_name: row.display_name, email: row.email, avatar_url: (row as any).avatar_url, username: (row as any).username };
        }
        return map;
      })();
      const merged: ShowcaseWithAssets[] = showcases.map((s) => ({
        ...s,
        assets: assetsByShowcase.get(s.id) || [],
        profile: profiles[s.user_id],
      }));
      setItems(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(undefined, tagFilter);
  }, [tagFilter]);

  const onAddExternalField = () => setExternalLinks((prev) => [...prev, ""]);
  const onChangeExternal = (idx: number, val: string) => setExternalLinks((prev) => prev.map((v, i) => (i === idx ? val : v)));

  const onCreate = async () => {
    if (!user || submitting || !tag) return;
    const assets: NewAsset[] = [...uploaded];
    for (const link of externalLinks.map((l) => l.trim()).filter(Boolean)) {
      const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(link);
      const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(link);
      const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(link);
      if (!(isImage || isVideo || isAudio)) continue;
      const kind = isImage ? ("image" as const) : isVideo ? ("video" as const) : ("audio" as const);
      assets.push({ url: link, kind, provider: "external" });
    }
    if (assets.length === 0 && !desc.trim()) return;
    try {
      setSubmitting(true);
      await createShowcase({ description: desc.trim(), tag, assets });
      setDesc("");
      setUploaded([]);
      setUploadQueue([]);
      setCurrentPreviewIdx(0);
      setOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background cow-grid-bg">
      <Navbar />
      {/* pad top to avoid content under fixed navbar */}
      <div className="container mx-auto px-4 pt-28 pb-12">
        <Helmet>
          <title>Showcase | Renderdragon</title>
          <meta name="description" content="Share your art with images and videos." />
        </Helmet>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
          <h1 className="text-3xl md:text-4xl font-vt323">Community <span className="text-cow-purple">Assets</span></h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search descriptions..."
                className="pl-9 bg-background/60"
              />
            </div>
            <Select value={tagFilter} onValueChange={(v) => setTagFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Images">Images</SelectItem>
                <SelectItem value="Animations">Animations</SelectItem>
                <SelectItem value="Music/SFX">Music/SFX</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={() => void load(search, tagFilter)} className="pixel-corners">Search</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <Button
                className="pixel-corners bg-cow-purple hover:bg-cow-purple/90"
                onClick={() => {
                  if (!user) {
                    setAuthOpen(true);
                  } else {
                    setOpen(true);
                  }
                }}
              >
                <IconPlus className="mr-2 h-4 w-4" /> Create Showcase
              </Button>
              <DialogContent className="bg-popover/90 border-white/10">
                <DialogHeader>
                  <DialogTitle className="font-vt323">Create Showcase</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Say something about your art..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Tag</Label>
                    <Select value={tag ?? undefined} onValueChange={(v) => setTag(v as ShowcaseTag)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a tag (required)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Images">Images</SelectItem>
                        <SelectItem value="Animations">Animations</SelectItem>
                        <SelectItem value="Music/SFX">Music/SFX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload files</Label>
                    <UploadButton
                      endpoint={(r) => r.mediaUploader}
                      onUploadBegin={(arg) => {
                        // Coerce arg to an array of file names regardless of UploadThing version shape
                        const names = (() => {
                          if (Array.isArray(arg)) return arg.filter((n): n is string => typeof n === 'string');
                          if (typeof arg === 'string') return [arg];
                          if (arg && typeof arg === 'object') {
                            const maybe = (arg as { files?: unknown }).files;
                            if (Array.isArray(maybe)) return maybe.filter((n): n is string => typeof n === 'string');
                          }
                          return [] as string[];
                        })();
                        const additions = names.map((name, i) => {
                          const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(name);
                          const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(name);
                          const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(name);
                          if (!(isImage || isVideo || isAudio)) return null;
                          const kind = isImage ? ("image" as const) : isVideo ? ("video" as const) : ("audio" as const);
                          return { id: `pending-${Date.now()}-${i}`, name, status: 'uploading' as const, kind };
                        }).filter(Boolean) as Array<{ id: string; name: string; status: 'uploading'; kind: 'image' | 'video' | 'audio' }>;
                        setUploadQueue((prev) => {
                          const next = [...prev, ...additions];
                          if (prev.length === 0 && additions.length > 0) setCurrentPreviewIdx(0);
                          return next;
                        });
                      }}
                      onClientUploadComplete={(files) => {
                        type UploadedFile = { name?: string; url?: string; ufsUrl?: string };
                        if (!files) return;
                        const arr: UploadedFile[] = Array.isArray(files) ? (files as UploadedFile[]) : [files as UploadedFile];
                        const mapped: NewAsset[] = arr.map((f) => {
                          const name = f.name ?? "";
                          const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(name);
                          const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(name);
                          const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(name);
                          if (!(isImage || isVideo || isAudio)) return null as any;
                          const kind = isImage ? ("image" as const) : isVideo ? ("video" as const) : ("audio" as const);
                          const url = (f.ufsUrl && typeof f.ufsUrl === 'string') ? f.ufsUrl : (f.url ?? "");
                          if (!url) return null as any;
                          return { url, kind, provider: "uploadthing" } as const;
                        }).filter((x): x is NewAsset => Boolean(x));
                        setUploaded((prev) => [...prev, ...mapped]);
                        // Mark queue items as done and attach urls
                        setUploadQueue((prev) => {
                          const next = [...prev];
                          for (const f of arr) {
                            const idx = next.findIndex((q) => q.name === (f.name ?? q.name) && q.status === 'uploading');
                            if (idx >= 0) {
                              const name = f.name ?? next[idx].name;
                              const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(name);
                              const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(name);
                              const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(name);
                              const url = (f.ufsUrl && typeof f.ufsUrl === 'string') ? f.ufsUrl : (f.url ?? "");
                              if (isImage || isVideo || isAudio) {
                                next[idx] = { ...next[idx], status: 'done', url, kind: (isImage ? 'image' : isVideo ? 'video' : 'audio') } as any;
                              } else {
                                // remove unsupported item from queue
                                next.splice(idx, 1);
                              }
                            }
                          }
                          return next;
                        });
                      }}
                      onUploadError={(e) => {
                        console.error(e);
                      }}
                      content={{ button: "Choose files", allowedContent: "Images, Videos, Audio" }}
                      className="ut-button:bg-cow-purple ut-button:pixel-corners"
                    />
                    {(uploadQueue.length > 0 || uploaded.length > 0) && (
                      <div className="mt-4">
                        <div className="relative w-full aspect-video bg-background/40 pixel-corners border border-white/10 flex items-center justify-center">
                          {(() => {
                            const all = uploadQueue.map(q => ({ kind: q.kind, url: q.url, status: q.status, name: q.name }))
                              .concat(uploaded.map(u => ({ kind: u.kind, url: u.url, status: 'done' as const, name: u.url })));
                            const idx = Math.min(Math.max(currentPreviewIdx, 0), Math.max(all.length - 1, 0));
                            const item = all[idx];
                            if (!item) return <div className="text-white/60 text-sm">No selection</div>;
                            const isFont = item.url ? /\.(ttf|otf|woff2?|ttc)(\?|$)/i.test(item.url) : /\.(ttf|otf|woff2?|ttc)(\?|$)/i.test(item.name);
                            if (item.status === 'uploading') {
                              return (
                                <div className="flex flex-col items-center gap-2 text-white/70">
                                  <IconLoader2 className="h-6 w-6 animate-spin" />
                                  <div className="text-xs">Uploading {item.name}</div>
                                </div>
                              );
                            }
                            if (isFont && item.url) {
                              const fontFamily = `UploadedFont_${idx}`;
                              const format = item.url.endsWith('.otf') ? 'opentype' : item.url.match(/\.woff2?$/) ? (item.url.endsWith('.woff2') ? 'woff2' : 'woff') : 'truetype';
                              return (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                  <style>{`@font-face { font-family: '${fontFamily}'; src: url('${item.url}') format('${format}'); font-weight: normal; font-style: normal; }`}</style>
                                  <div className="text-3xl" style={{ fontFamily }}>Aa Bb Cc 123 The quick brown fox</div>
                                  <div className="mt-2 text-xs text-white/60 break-all">{item.url}</div>
                                </div>
                              );
                            }
                            if (item.kind === 'image' && item.url) return <img src={item.url} alt="preview" className="w-full h-full object-contain" />;
                            if (item.kind === 'video' && item.url) return <video src={item.url} controls className="w-full h-full object-contain" />;
                            if (item.kind === 'audio' && item.url) return <audio src={item.url} controls className="w-3/4" />;
                            return <div className="text-white/70 text-sm">File added</div>;
                          })()}
                          {uploadQueue.length + uploaded.length > 1 && (
                            <>
                              <button type="button" aria-label="Prev" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white px-2 py-1 pixel-corners" onClick={() => setCurrentPreviewIdx((i) => Math.max(i - 1, 0))}>{'<'}</button>
                              <button type="button" aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white px-2 py-1 pixel-corners" onClick={() => setCurrentPreviewIdx((i) => i + 1)}>{'>'}</button>
                            </>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {uploadQueue.map((q, i) => (
                            <div key={`q-${i}`} className={`h-16 w-16 pixel-corners border ${currentPreviewIdx === i ? 'border-cow-purple' : 'border-white/10'} bg-background/40 flex items-center justify-center text-[10px] text-white/70`} onClick={() => setCurrentPreviewIdx(i)}>
                              {q.status === 'uploading' ? <IconLoader2 className="h-4 w-4 animate-spin" /> : q.kind}
                            </div>
                          ))}
                          {uploaded.map((u, i) => (
                            <div key={`u-${i}`} className={`h-16 w-16 pixel-corners border ${currentPreviewIdx === (uploadQueue.length + i) ? 'border-cow-purple' : 'border-white/10'} bg-background/40 overflow-hidden`} onClick={() => setCurrentPreviewIdx(uploadQueue.length + i)}>
                              {u.kind === 'image' ? <img src={u.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-white/70">{u.kind}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Or paste external links</Label>
                    <div className="space-y-2">
                      {externalLinks.map((v, i) => (
                        <Input key={i} value={v} onChange={(e) => onChangeExternal(i, e.target.value)} placeholder="https://... (image or video URL)" />
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" onClick={onAddExternalField}>Add another link</Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2 flex-wrap">
                    {hasPendingUploads ? (
                      <div className="text-xs text-amber-300/80">Uploads are still in progress. Please wait before publishing.</div>
                    ) : <div />}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button className="bg-cow-purple hover:bg-cow-purple/90 disabled:opacity-70" onClick={() => void onCreate()} disabled={!user || authLoading || submitting || !tag || hasPendingUploads}>
                        {submitting ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Publish"}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <IconLoader2 className="h-6 w-6 animate-spin text-cow-purple" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-white/70 min-h-[40vh] py-16">
            <div className="text-2xl font-vt323 mb-2">No showcases yet</div>
            <p className="max-w-md">Be the first to share your art! Click "Create Showcase" to upload images or videos, or paste external links.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 justify-items-center">
            {items.map((it) => (
              <ShowcaseCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </div>
      <Footer />
      {/* Authentication dialog shown when user tries to create a post without being signed in */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default ShowcasePage;
