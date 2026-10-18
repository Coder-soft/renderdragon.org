import {
  renderAvatar,
  renderBigHead,
  renderHalfBody,
  renderSkinBack,
  renderSkinFront,
  renderSkinIsometric,
  renderSkinLeftSide,
  renderSkinRightSide,
} from "@daidr/minecraft-skin-renderer/canvas2d";
import type { TextureSource } from "@daidr/minecraft-skin-renderer/canvas2d";

export type RenderKind =
  | "bighead"
  | "front"
  | "back"
  | "left"
  | "right"
  | "isometric"
  | "halfbody"
  | "avatar";

export const RENDER_KINDS: { id: RenderKind; label: string; chibi?: boolean }[] = [
  { id: "bighead", label: "Chibi (big head)", chibi: true },
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "left", label: "Side left" },
  { id: "right", label: "Side right" },
  { id: "isometric", label: "Isometric" },
  { id: "halfbody", label: "Half body" },
  { id: "avatar", label: "Avatar" },
];

export interface RenderOptions {
  kind: RenderKind;
  scale: number;
  border: number;
  borderColor: string;
  showOverlay: boolean;
  overlayInflated: boolean;
  slim: boolean;
}

export async function drawRender(canvas: HTMLCanvasElement, skin: TextureSource, options: RenderOptions) {
  const base = {
    skin,
    scale: options.scale,
    slim: options.slim,
    showOverlay: options.showOverlay,
    overlayInflated: options.overlayInflated,
  };
  switch (options.kind) {
    case "bighead":
      return renderBigHead(canvas, { ...base, border: options.border, borderColor: options.borderColor });
    case "front":
      return renderSkinFront(canvas, base);
    case "back":
      return renderSkinBack(canvas, base);
    case "left":
      return renderSkinLeftSide(canvas, base);
    case "right":
      return renderSkinRightSide(canvas, base);
    case "isometric":
      return renderSkinIsometric(canvas, base);
    case "halfbody":
      return renderHalfBody(canvas, base);
    case "avatar":
      return renderAvatar(canvas, base);
    default:
      return renderBigHead(canvas, { ...base, border: options.border, borderColor: options.borderColor });
  }
}
