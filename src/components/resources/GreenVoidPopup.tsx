import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IconX, IconPalette, IconBrightness, IconEye, IconCloud, IconSparkles } from '@tabler/icons-react';

const GREEN_VOID_KEY = 'green-void-changelog-dismissed';
const MC_PLAYLIST_KEY = 'mc-creator-playlist-changelog-dismissed';

const GreenVoidPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const greenVoidDismissed = localStorage.getItem(GREEN_VOID_KEY);
    const mcPlaylistDismissed = localStorage.getItem(MC_PLAYLIST_KEY);
    if (!greenVoidDismissed && mcPlaylistDismissed) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(GREEN_VOID_KEY, 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="sm:max-w-lg pixel-corners bg-gradient-to-b from-card/95 to-card/70 border-green-500/20 max-h-[90vh] overflow-y-auto">
        <div className="space-y-5">
          <h1 className="text-2xl font-minecraftia font-bold text-center leading-tight">
            Green Void Shader Pack
          </h1>

          <img
            src="/VERT_Screencast_20260705_160503.gif"
            alt="Green Void Shader Pack"
            className="w-full rounded-lg border border-border/40"
          />

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="text-foreground/80 font-medium">
              Green Void is a Minecraft shader pack designed for content creators. Change the chroma color of the sky, terrain, and entities to create stunning thumbnail visuals.
            </p>

            <div>
              <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-minecraftia">
                <IconSparkles className="h-3.5 w-3.5 text-green-400" />
                Features
              </h4>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <IconCloud className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground/80">Chroma sky</strong> — recolor the sky with any chroma color</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconBrightness className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground/80">Chroma terrain</strong> — apply chroma effects to all terrain blocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconEye className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground/80">Chroma entities</strong> — change entity colors for seamless composites</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconPalette className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground/80">Full color control</strong> — pick any chroma key for perfect thumbnails</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href="https://modrinth.com/shader/greenvoid"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors text-sm font-medium"
              >
                <img src="/modrinth.svg" alt="Modrinth" className="h-5 w-5" />
                Download on Modrinth
                <IconX className="h-3 w-3 ml-auto rotate-45" />
              </a>
            </div>
          </div>

          <Button
            onClick={dismiss}
            className="w-full pixel-corners bg-green-600 hover:bg-green-700 font-minecraft font-bold text-white"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GreenVoidPopup;
