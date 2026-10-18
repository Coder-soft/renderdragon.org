import { useCallback, useEffect, useRef, useState } from "react";
import { IconDownload, IconLoader2, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RENDER_KINDS, type RenderKind, drawRender } from "@/lib/chibiRender";
import { fetchSkinByUsername } from "@/lib/chibiRenderer";

const CHECKER: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg,#1c1c24 25%,transparent 25%),linear-gradient(-45deg,#1c1c24 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1c1c24 75%),linear-gradient(-45deg,transparent 75%,#1c1c24 75%)",
  backgroundSize: "22px 22px",
  backgroundPosition: "0 0,0 11px,11px -11px,-11px 0",
};

const FRAMES: { id: string; label: string; ratio: number }[] = [
  { id: "square", label: "Profile (1:1)", ratio: 1 },
  { id: "portrait", label: "Post (4:5)", ratio: 4 / 5 },
  { id: "classic", label: "Classic (4:3)", ratio: 4 / 3 },
  { id: "wide", label: "Wide (16:9)", ratio: 16 / 9 },
  { id: "story", label: "Story (9:16)", ratio: 9 / 16 },
];
const SCALES = [4, 6, 8, 12, 16, 20, 24];
const BORDERS = [0, 1, 2, 3, 4];
const BORDER_COLORS = ["#000000", "#1b1b22", "#ffffff", "#3b2c22", "#0f2b46"];

const detectSlim = async (blob: Blob): Promise<boolean> => {
  try {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const s = bitmap.width / 64;
    const alpha = ctx.getImageData(Math.round(47 * s), Math.round(20 * s), 1, 1).data[3];
    bitmap.close?.();
    return alpha === 0;
  } catch {
    return false;
  }
};

const ChibiTool = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [skin, setSkin] = useState<Blob | null>(null);
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<RenderKind>("bighead");
  const [scale, setScale] = useState(8);
  const [border, setBorder] = useState(2);
  const [borderColor, setBorderColor] = useState("#000000");
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayInflated, setOverlayInflated] = useState(true);
  const [slimMode, setSlimMode] = useState<"auto" | "classic" | "slim">("auto");
  const [frame, setFrame] = useState("square");
  const [round, setRound] = useState(false);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !skin) return;
    const slim = slimMode === "auto" ? await detectSlim(skin) : slimMode === "slim";
    try {
      await drawRender(canvas, skin, {
        kind,
        scale,
        border,
        borderColor,
        showOverlay,
        overlayInflated,
        slim,
      });
    } catch {
      toast.error("Couldn't render that skin.");
    }
  }, [skin, kind, scale, border, borderColor, showOverlay, overlayInflated, slimMode]);

  useEffect(() => {
    render();
  }, [render]);

  const loadBlob = (blob: Blob, name: string) => {
    setSkin(blob);
    setLabel(name);
  };

  const fromFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a PNG skin file.");
      return;
    }
    loadBlob(file, file.name);
  };

  const fromUsername = async () => {
    const name = username.trim();
    if (!name) return;
    setBusy(true);
    try {
      loadBlob(await fetchSkinByUsername(name), `${name}.png`);
    } catch {
      toast.error("Couldn't load that skin.");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !skin) return;
    const ratio = FRAMES.find((entry) => entry.id === frame)?.ratio ?? 1;
    const outWidth = Math.max(canvas.width, Math.round(canvas.height * ratio));
    const outHeight = ratio <= 1 ? canvas.height : Math.round(outWidth / ratio);
    const out = document.createElement("canvas");
    out.width = outWidth;
    out.height = ratio <= 1 ? canvas.height : outHeight;
    const ctx = out.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const fit = Math.min(out.width / canvas.width, out.height / canvas.height);
    const w = canvas.width * fit;
    const h = canvas.height * fit;
    ctx.drawImage(canvas, (out.width - w) / 2, (out.height - h) / 2, w, h);
    if (round) {
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(out.width / 2, out.height / 2, Math.min(out.width, out.height) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(label || "chibi").replace(/\.[^.]+$/, "")}-${kind}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Downloaded!");
    }, "image/png");
  };

  const isChibi = RENDER_KINDS.find((entry) => entry.id === kind)?.chibi;
  const groupLabel = "text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground";
  const chip = (active: boolean) =>
    cn(
      "chamfer border px-2.5 py-1 text-xs font-medium transition-colors",
      active ? "border-primary bg-primary/15 text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className={groupLabel}>Skin</div>
          <div className="flex gap-2">
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && fromUsername()}
              placeholder="Minecraft username"
              disabled={busy}
            />
            <Button type="button" variant="outline" onClick={fromUsername} disabled={busy || !username.trim()}>
              {busy ? <IconLoader2 className="h-4 w-4 animate-spin" /> : "Load"}
            </Button>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
            <IconUpload className="h-4 w-4 mr-2" /> Upload a skin
          </Button>
          <input ref={fileRef} type="file" accept="image/png,image/*" className="hidden" onChange={(event) => fromFile(event.target.files?.[0])} />
          {label && <p className="font-mono text-xs text-muted-foreground">{label}</p>}
        </div>

        <div className="space-y-2">
          <div className={groupLabel}>Render</div>
          <div className="flex flex-wrap gap-1.5">
            {RENDER_KINDS.map((entry) => (
              <button key={entry.id} type="button" className={chip(kind === entry.id)} onClick={() => setKind(entry.id)}>
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className={groupLabel}>Size</div>
          <div className="flex flex-wrap gap-1.5">
            {SCALES.map((value) => (
              <button key={value} type="button" className={chip(scale === value)} onClick={() => setScale(value)}>
                {value}px
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className={groupLabel}>Options</div>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={chip(showOverlay)} onClick={() => setShowOverlay((v) => !v)}>
              Hat layer
            </button>
            <button type="button" className={chip(overlayInflated)} onClick={() => setOverlayInflated((v) => !v)}>
              Inflated overlay
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Arms</span>
            {(["auto", "classic", "slim"] as const).map((option) => (
              <button key={option} type="button" className={chip(slimMode === option)} onClick={() => setSlimMode(option)}>
                {option === "auto" ? "Auto" : option === "classic" ? "Steve" : "Alex"}
              </button>
            ))}
          </div>
          {isChibi && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Outline</span>
              {BORDERS.map((value) => (
                <button key={value} type="button" className={chip(border === value)} onClick={() => setBorder(value)}>
                  {value === 0 ? "None" : `${value}px`}
                </button>
              ))}
              {BORDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBorderColor(color)}
                  className={cn("h-6 w-6 chamfer border", borderColor === color ? "border-primary" : "border-border")}
                  style={{ background: color }}
                  aria-label={`Outline colour ${color}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className={groupLabel}>Frame</div>
          <div className="flex flex-wrap gap-1.5">
            {FRAMES.map((entry) => (
              <button key={entry.id} type="button" className={chip(frame === entry.id)} onClick={() => setFrame(entry.id)}>
                {entry.label}
              </button>
            ))}
            <button type="button" className={chip(round)} onClick={() => setRound((v) => !v)}>
              Round avatar
            </button>
          </div>
        </div>

        <Button type="button" onClick={download} disabled={!skin} className="w-full">
          <IconDownload className="mr-2 h-4 w-4" /> Download PNG
        </Button>
        <p className="text-xs text-muted-foreground">
          Rendered in your browser. Your skin never leaves your computer.
        </p>
      </div>

      <div className="chamfer flex min-h-[440px] items-center justify-center border border-border p-6" style={CHECKER}>
        <canvas
          ref={canvasRef}
          className={cn("max-h-[70vh] max-w-full", !skin && "hidden")}
          style={{ imageRendering: "pixelated" }}
        />
        {!skin && (
          <p className="max-w-[260px] text-center text-sm text-muted-foreground">
            Load a skin (username or upload) to render it.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChibiTool;
