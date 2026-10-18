export type ChibiStyle = "classic" | "inked";

const INK = "#0b0b12";
const SPRITE_WIDTH = 20;
const SPRITE_HEIGHT = 30;

type Rect = readonly [number, number, number, number];

const HEAD_FRONT: Rect = [8, 8, 8, 8];
const HEAD_OVERLAY: Rect = [40, 8, 8, 8];
const BODY_FRONT: Rect = [20, 20, 8, 8];
const BODY_OVERLAY: Rect = [20, 36, 8, 8];
const ARM_RIGHT_FRONT: Rect = [44, 20, 4, 8];
const ARM_RIGHT_OVERLAY: Rect = [44, 36, 4, 8];
const ARM_LEFT_FRONT: Rect = [36, 52, 4, 8];
const ARM_LEFT_OVERLAY: Rect = [52, 52, 4, 8];
const LEG_RIGHT_FRONT: Rect = [4, 20, 4, 6];
const LEG_RIGHT_OVERLAY: Rect = [4, 36, 4, 6];
const LEG_LEFT_FRONT: Rect = [20, 52, 4, 6];
const LEG_LEFT_OVERLAY: Rect = [4, 52, 4, 6];

export interface SkinInfo {
  width: number;
  height: number;
  scale: number;
  legacy: boolean;
}

export const describeSkin = (skin: { width: number; height: number }): SkinInfo => ({
  width: skin.width,
  height: skin.height,
  scale: Math.max(1, Math.round(skin.width / 64)),
  legacy: skin.height * 2 === skin.width,
});

export const validateSkin = (skin: { width: number; height: number }): string | null => {
  const square = skin.width === skin.height && skin.width % 64 === 0;
  const legacy = skin.width === skin.height * 2 && skin.width % 64 === 0;
  if (!square && !legacy) {
    return "That doesn't look like a Minecraft skin (expected 64x64, 64x32, or an HD multiple).";
  }
  return null;
};

export const loadSkinBitmap = (source: Blob): Promise<ImageBitmap> => createImageBitmap(source);

export const fetchSkinByUsername = async (username: string): Promise<Blob> => {
  const res = await fetch(`https://mc-heads.net/skin/${encodeURIComponent(username)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`skin_request_failed_${res.status}`);
  return res.blob();
};

export function drawChibi(skin: ImageBitmap, style: ChibiStyle): HTMLCanvasElement {
  const { scale: unit, legacy } = describeSkin(skin);

  const parts = document.createElement("canvas");
  parts.width = SPRITE_WIDTH * unit;
  parts.height = SPRITE_HEIGHT * unit;
  const ctx = parts.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  const blit = (rect: Rect, dest: Rect, mirror = false) => {
    const [rx, ry, rw, rh] = rect;
    const [dx, dy, dw, dh] = dest;
    if (mirror) {
      ctx.save();
      ctx.translate((dx + dw) * unit, dy * unit);
      ctx.scale(-1, 1);
      ctx.drawImage(skin, rx * unit, ry * unit, rw * unit, rh * unit, 0, 0, dw * unit, dh * unit);
      ctx.restore();
      return;
    }
    ctx.drawImage(skin, rx * unit, ry * unit, rw * unit, rh * unit, dx * unit, dy * unit, dw * unit, dh * unit);
  };

  blit(HEAD_FRONT, [2, 0, 16, 16]);
  blit(BODY_FRONT, [6, 16, 8, 8]);
  blit(ARM_RIGHT_FRONT, [2, 16, 4, 8]);
  blit(legacy ? ARM_RIGHT_FRONT : ARM_LEFT_FRONT, [14, 16, 4, 8], legacy);
  blit(LEG_RIGHT_FRONT, [6, 24, 4, 6]);
  blit(legacy ? LEG_RIGHT_FRONT : LEG_LEFT_FRONT, [10, 24, 4, 6], legacy);

  blit(HEAD_OVERLAY, [2, 0, 16, 16]);
  if (!legacy) {
    blit(BODY_OVERLAY, [6, 16, 8, 8]);
    blit(ARM_RIGHT_OVERLAY, [2, 16, 4, 8]);
    blit(ARM_LEFT_OVERLAY, [14, 16, 4, 8]);
    blit(LEG_RIGHT_OVERLAY, [6, 24, 4, 6]);
    blit(LEG_LEFT_OVERLAY, [10, 24, 4, 6]);
  }

  if (style === "classic") return parts;

  const silhouette = document.createElement("canvas");
  silhouette.width = parts.width;
  silhouette.height = parts.height;
  const sctx = silhouette.getContext("2d")!;
  sctx.drawImage(parts, 0, 0);
  sctx.globalCompositeOperation = "source-in";
  sctx.fillStyle = INK;
  sctx.fillRect(0, 0, silhouette.width, silhouette.height);

  const outlined = document.createElement("canvas");
  outlined.width = (SPRITE_WIDTH + 2) * unit;
  outlined.height = (SPRITE_HEIGHT + 2) * unit;
  const octx = outlined.getContext("2d")!;
  octx.imageSmoothingEnabled = false;
  const offset = unit;
  const neighbours = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  for (const [nx, ny] of neighbours) {
    octx.drawImage(silhouette, offset + nx * unit, offset + ny * unit);
  }
  octx.drawImage(parts, offset, offset);
  return outlined;
}

export function exportCanvas(source: HTMLCanvasElement, factor: number): HTMLCanvasElement {
  if (factor <= 1) return source;
  const out = document.createElement("canvas");
  out.width = source.width * factor;
  out.height = source.height * factor;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0, out.width, out.height);
  return out;
}
