import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { createShowcase, listShowcases, type Showcase, type ShowcaseAsset, type ShowcaseTag } from "@/lib/showcases";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
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
            return isImage || isVideo || isAudio || ["image", "video", "audio"].includes(a.kind);
          }).map((a) => {
            const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(a.url);
            const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(a.url);
            const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(a.url);
            const baseKind = ["image", "video", "audio"].includes(a.kind) ? a.kind : "file";
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
              const baseKind = ["image", "video", "audio"].includes(previewAsset.kind) ? previewAsset.kind : "file";
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
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ShowcaseWithAssets[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tagFilter, setTagFilter] = useState<ShowcaseTag | "All">("All");
  const [tag, setTag] = useState<ShowcaseTag | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const [desc, setDesc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const load = async (q?: string, t?: ShowcaseTag | "All") => {
    setLoading(true);
    try {
      const { showcases, assetsByShowcase } = await listShowcases(q, (t ?? tagFilter) !== "All" ? (t ?? tagFilter) as ShowcaseTag : undefined);
      
      const legacyIds = showcases.filter(s => !s.id.startsWith('new-')).map(s => s.user_id);
      const newEmails = showcases.filter(s => s.id.startsWith('new-')).map(s => s.user_id);

      const profiles = await (async () => {
        const map: Record<string, { display_name?: string | null; avatar_url?: string | null; email?: string | null; username?: string | null }> = {};
        
        if (legacyIds.length > 0) {
          const { data } = await supabase.from("profiles").select("id, display_name, email, avatar_url, username").in("id", legacyIds);
          for (const row of (data || []) as any[]) {
            map[row.id] = { display_name: row.display_name, email: row.email, avatar_url: row.avatar_url, username: row.username };
          }
        }
        
        if (newEmails.length > 0) {
          const { data } = await supabase.from("profiles").select("id, display_name, email, avatar_url, username").in("email", newEmails);
          for (const row of (data || []) as any[]) {
            map[row.email] = { display_name: row.display_name, email: row.email, avatar_url: row.avatar_url, username: row.username };
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFilter]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(file.name);
    const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(file.name);
    const isAudio = /\.(mp3|wav|flac|ogg|aac|m4a)(\?|$)/i.test(file.name);
    
    if (!(isImage || isVideo || isAudio)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image, video, or audio file.",
      });
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const onCreate = async () => {
    if (!user || submitting || !tag || !selectedFile) {
      if (!selectedFile) {
        toast({
          variant: "destructive",
          title: "File required",
          description: "Please select a file to upload.",
        });
      }
      return;
    }
    
    try {
      setSubmitting(true);
      await createShowcase({ 
        description: desc.trim(), 
        tag, 
        file: selectedFile 
      });
      
      toast({
        title: "Success",
        description: "Your showcase has been created!",
      });

      setDesc("");
      setSelectedFile(null);
      setFilePreview(null);
      setOpen(false);
      await load();
    } catch (error: any) {
      console.error("Failed to create showcase:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create showcase. Please try again.",
      });
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
            <Select value={tagFilter} onValueChange={(v) => setTagFilter(v as ShowcaseTag | "All")}>
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
                    <Label>Message</Label>
                    <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Say something about your art..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={tag ?? undefined} onValueChange={(v) => setTag(v as ShowcaseTag)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category (required)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Images">Images</SelectItem>
                        <SelectItem value="Animations">Animations</SelectItem>
                        <SelectItem value="Music/SFX">Music/SFX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload file</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full pixel-corners border-dashed border-2 h-20 hover:bg-cow-purple/10 hover:border-cow-purple/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <IconPlus className="h-6 w-6" />
                        <span className="text-sm">Choose file (Image, Video, Audio)</span>
                      </div>
                    </Button>
                    
                    {filePreview && (
                      <div className="mt-4">
                        <div className="relative w-full aspect-video bg-background/40 pixel-corners border border-white/10 flex items-center justify-center overflow-hidden">
                          {selectedFile?.type.startsWith('image/') ? (
                            <img src={filePreview} alt="preview" className="w-full h-full object-contain" />
                          ) : selectedFile?.type.startsWith('video/') ? (
                            <video src={filePreview} controls className="w-full h-full object-contain" />
                          ) : selectedFile?.type.startsWith('audio/') ? (
                            <audio src={filePreview} controls className="w-3/4" />
                          ) : (
                            <div className="text-white/70 text-sm">{selectedFile?.name}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                      onClick={onCreate}
                      disabled={submitting || !tag || !selectedFile}
                      className="pixel-corners bg-cow-purple hover:bg-cow-purple/90"
                    >
                      {submitting ? (
                        <>
                          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        "Publish Showcase"
                      )}
                    </Button>
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
            <p className="max-w-md">Be the first to share your art! Click "Create Showcase" to upload an image, video, or audio file.</p>
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
