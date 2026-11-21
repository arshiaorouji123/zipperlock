/**
 * Design model + wallpaper ("cover") renderer.
 * The cover is everything under the zipper: background/photo, dimming, clock & text.
 */
import { DEFAULT_ZIPPER, drawScene, METALS, type MetalId, type ZipperOpts } from './zipper';
import { drawArt, type ArtSpec } from './art';
import * as S from './shapes';

export type ClockColor = 'white' | 'gold' | 'silver' | 'purple' | 'custom';
export type FontId = 'modern' | 'thin' | 'bold' | 'elegant' | 'mono';

export interface Adjust {
  zoom: number;
  x: number;
  y: number;
  rotate: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  dim: number;
}

export interface ClockOpts {
  show: boolean;
  h24: boolean;
  font: FontId;
  color: ClockColor;
  custom: string;
  size: number;
  y: number;
  date: boolean;
  locale: 'en' | 'fa';
  text: string;
  align: 'left' | 'center' | 'right';
}

export interface Layers {
  photo: { visible: boolean; opacity: number };
  clock: { visible: boolean; opacity: number; above: boolean };
  zipper: { visible: boolean; opacity: number };
}

export interface Design {
  bg: string;
  /** procedural artwork; when set it replaces the preset background */
  art?: ArtSpec | null;
  /** id of the library design this was started from (for analytics/labels) */
  designId?: string;
  adj: Adjust;
  zipper: ZipperOpts;
  clock: ClockOpts;
  layers: Layers;
}

export const DEFAULT_LAYERS: Layers = {
  photo: { visible: true, opacity: 100 },
  clock: { visible: true, opacity: 100, above: false },
  zipper: { visible: true, opacity: 100 },
};

export const DEFAULT_ADJUST: Adjust = {
  zoom: 1,
  x: 0,
  y: 0,
  rotate: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  dim: 12,
};

export const DEFAULT_CLOCK: ClockOpts = {
  show: true,
  h24: false,
  font: 'thin',
  color: 'white',
  custom: '#D4AF37',
  size: 1,
  y: 0.2,
  date: true,
  locale: 'en',
  text: '',
  align: 'left',
};

export const DEFAULT_DESIGN: Design = {
  bg: 'midnight',
  adj: DEFAULT_ADJUST,
  zipper: DEFAULT_ZIPPER,
  clock: DEFAULT_CLOCK,
  layers: DEFAULT_LAYERS,
};

/** Fill in any fields missing from older saved designs. */
export function normalizeDesign(d: Partial<Design> | null | undefined): Design {
  const x = d ?? {};
  const L = (x.layers ?? {}) as Partial<Layers>;
  return {
    bg: typeof x.bg === 'string' ? x.bg : DEFAULT_DESIGN.bg,
    art: x.art && typeof x.art === 'object' && x.art.bg && Array.isArray(x.art.layers) ? x.art : null,
    designId: typeof x.designId === 'string' ? x.designId : undefined,
    adj: { ...DEFAULT_ADJUST, ...(x.adj ?? {}) },
    zipper: { ...DEFAULT_ZIPPER, ...(x.zipper ?? {}) },
    clock: { ...DEFAULT_CLOCK, ...(x.clock ?? {}) },
    layers: {
      photo: { ...DEFAULT_LAYERS.photo, ...(L.photo ?? {}) },
      clock: { ...DEFAULT_LAYERS.clock, ...(L.clock ?? {}) },
      zipper: { ...DEFAULT_LAYERS.zipper, ...(L.zipper ?? {}) },
    },
  };
}

export const FONTS: Record<FontId, { name: string; weight: number; family: string }> = {
  modern: { name: 'Modern', weight: 500, family: 'system-ui, -apple-system, "Segoe UI", Roboto, Tahoma, sans-serif' },
  thin: { name: 'Thin', weight: 200, family: 'system-ui, -apple-system, "Segoe UI", Roboto, Tahoma, sans-serif' },
  bold: { name: 'Bold', weight: 800, family: 'system-ui, -apple-system, "Segoe UI", Roboto, Tahoma, sans-serif' },
  elegant: { name: 'Elegant serif', weight: 400, family: 'Georgia, "Times New Roman", serif' },
  mono: { name: 'Digital mono', weight: 500, family: 'ui-monospace, Menlo, Consolas, "Courier New", monospace' },
};

/* ------------------------------------------------------------------ */
/* Seeded random                                                       */
/* ------------------------------------------------------------------ */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Ctx = CanvasRenderingContext2D;

/* ------------------------------------------------------------------ */
/* Procedural backgrounds & Wallpapers                                 */
/* ------------------------------------------------------------------ */
export interface Background {
  id: string;
  name: string;
  draw: (ctx: Ctx, W: number, H: number) => void;
  imageSrc?: string;
}

const bgImageCache = new Map<string, HTMLImageElement>();

export function getCachedBgImage(src: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  let img = bgImageCache.get(src);
  if (!img) {
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zipper-bg-loaded', { detail: { src } }));
      }
    };
    bgImageCache.set(src, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

export function drawWallpaper(
  ctx: Ctx,
  W: number,
  H: number,
  src?: string,
  c1 = '#121218',
  c2 = '#08080C',
  fallback?: (ctx: Ctx, W: number, H: number) => void
) {
  const img = src ? getCachedBgImage(src) : null;
  if (img) {
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    const sx = (W - sw) / 2;
    const sy = (H - sh) / 2;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh);
    return;
  }
  if (fallback) {
    fallback(ctx, W, H);
    return;
  }
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function radial(ctx: Ctx, x: number, y: number, r: number, color: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

export const BACKGROUNDS: Background[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#15151C');
      g.addColorStop(1, '#0B0B0F');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.95, H * 0.55, '#8B5CF6', 0.28);
      radial(ctx, W * 0.15, H * 0.1, H * 0.35, '#D4AF37', 0.1);
    },
  },
  {
    id: 'carbon',
    name: 'Carbon Fiber',
    draw: (ctx, W, H) => {
      ctx.fillStyle = '#0B0B0F';
      ctx.fillRect(0, 0, W, H);
      const s = Math.max(6, W / 36);
      for (let y = 0; y < H + s; y += s) {
        for (let x = 0; x < W + s; x += s) {
          const odd = (Math.floor(x / s) + Math.floor(y / s)) % 2 === 0;
          const g = odd ? ctx.createLinearGradient(x, y, x + s, y) : ctx.createLinearGradient(x, y, x, y + s);
          g.addColorStop(0, '#101016');
          g.addColorStop(0.5, '#262630');
          g.addColorStop(1, '#0E0E13');
          ctx.fillStyle = g;
          ctx.fillRect(x, y, s, s);
        }
      }
      const v = ctx.createLinearGradient(0, 0, W, H);
      v.addColorStop(0, 'rgba(255,255,255,0.06)');
      v.addColorStop(0.5, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
    },
  },
  {
    id: 'gold-silk',
    name: 'Gold Silk',
    draw: (ctx, W, H) => {
      ctx.fillStyle = '#0B0B0F';
      ctx.fillRect(0, 0, W, H);
      const lines = 46;
      for (let i = 0; i < lines; i++) {
        const t = i / lines;
        ctx.beginPath();
        for (let x = 0; x <= W; x += W / 60) {
          const y = H * (0.25 + t * 0.6) + Math.sin(x / W * Math.PI * 2 + t * 4) * H * 0.07 + Math.sin(x / W * 9 + t * 7) * H * 0.012;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(212,175,55,${0.08 + 0.4 * Math.sin(t * Math.PI) ** 3})`;
        ctx.lineWidth = Math.max(1, W / 540);
        ctx.stroke();
      }
      radial(ctx, W * 0.7, H * 0.5, H * 0.4, '#D4AF37', 0.12);
    },
  },
  {
    id: 'aurora',
    name: 'Purple Aurora',
    draw: (ctx, W, H) => {
      ctx.fillStyle = '#0B0B0F';
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.2, H * 0.3, H * 0.5, '#8B5CF6', 0.55);
      radial(ctx, W * 0.9, H * 0.65, H * 0.45, '#8B5CF6', 0.35);
      radial(ctx, W * 0.55, H * 0.85, H * 0.3, '#C0C0C0', 0.12);
      radial(ctx, W * 0.75, H * 0.15, H * 0.25, '#D4AF37', 0.15);
    },
  },
  {
    id: 'brushed',
    name: 'Brushed Steel',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#3A3A42');
      g.addColorStop(0.5, '#1E1E25');
      g.addColorStop(1, '#2C2C34');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const r = rng(7);
      const n = Math.round(H / 1.5);
      for (let i = 0; i < n; i++) {
        const y = r() * H;
        ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${r() * 0.07})` : `rgba(0,0,0,${r() * 0.12})`;
        ctx.fillRect(0, y, W, Math.max(1, H / 1600));
      }
      radial(ctx, W * 0.3, H * 0.25, H * 0.5, '#FFFFFF', 0.08);
    },
  },
  {
    id: 'velvet',
    name: 'Black Velvet',
    draw: (ctx, W, H) => {
      ctx.fillStyle = '#0B0B0F';
      ctx.fillRect(0, 0, W, H);
      const r = rng(3);
      for (let i = 0; i < 70; i++) {
        radial(ctx, r() * W, r() * H, (0.05 + r() * 0.25) * H, r() > 0.75 ? '#8B5CF6' : '#2A2A35', 0.25 + r() * 0.25);
      }
    },
  },
  {
    id: 'gold-dust',
    name: 'Gold Dust',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0B0B0F');
      g.addColorStop(1, '#1A160C');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const r = rng(11);
      const n = 900;
      for (let i = 0; i < n; i++) {
        const x = r() * W;
        const y = H * (0.35 + 0.65 * Math.pow(r(), 0.7));
        const s = (r() * r() * W) / 260 + W / 1600;
        ctx.fillStyle = r() > 0.85 ? `rgba(255,244,196,${0.4 + r() * 0.5})` : `rgba(212,175,55,${0.15 + r() * 0.55})`;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }
      radial(ctx, W * 0.5, H, H * 0.6, '#D4AF37', 0.2);
    },
  },
  {
    id: 'silver-wave',
    name: 'Silver Wave',
    draw: (ctx, W, H) => {
      ctx.fillStyle = '#0E0E13';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, 'rgba(192,192,192,0)');
        g.addColorStop(0.5, `rgba(220,220,228,${0.05 + t * 0.12})`);
        g.addColorStop(1, 'rgba(192,192,192,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += W / 40) {
          ctx.lineTo(x, H * (0.3 + t * 0.07) + Math.sin(x / W * 3 + i) * H * 0.06 + i * H * 0.05);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      }
    },
  },
  {
    id: 'romantic-hearts',
    name: 'Romantic Hearts',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1A0612');
      g.addColorStop(0.5, '#3B0A24');
      g.addColorStop(1, '#12020B');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.6, '#E11D48', 0.35);
      radial(ctx, W * 0.8, H * 0.2, H * 0.4, '#FB7185', 0.25);
      radial(ctx, W * 0.2, H * 0.8, H * 0.45, '#F43F5E', 0.2);
      const r = rng(101);
      for (let i = 0; i < 35; i++) {
        const bx = r() * W;
        const by = r() * H;
        const br = (0.02 + r() * 0.08) * W;
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bg.addColorStop(0, `rgba(251,113,133,${0.15 + r() * 0.25})`);
        bg.addColorStop(1, 'rgba(251,113,133,0)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 24; i++) {
        const hx = r() * W;
        const hy = r() * H;
        const hs = (0.015 + r() * 0.04) * W;
        const a = r() * 0.45 + 0.15;
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate((r() - 0.5) * 0.6);
        ctx.fillStyle = r() > 0.4 ? `rgba(255,200,220,${a})` : `rgba(244,63,94,${a})`;
        ctx.fill(S.heart(0, 0, hs));
        ctx.restore();
      }
    },
  },
  {
    id: 'diamond-luxury',
    name: 'Diamond Luxury',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#0A0F1D');
      g.addColorStop(0.5, '#152238');
      g.addColorStop(1, '#080C16');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.35, H * 0.5, '#38BDF8', 0.22);
      radial(ctx, W * 0.5, H * 0.7, H * 0.6, '#FFFFFF', 0.1);
      const r = rng(202);
      const pts: [number, number][] = [
        [W * 0.5, H * 0.1],
        [W * 0.15, H * 0.3],
        [W * 0.85, H * 0.3],
        [W * 0.5, H * 0.5],
        [W * 0.05, H * 0.65],
        [W * 0.95, H * 0.65],
        [W * 0.5, H * 0.9],
      ];
      for (let i = 0; i < pts.length - 2; i++) {
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
        ctx.lineTo(pts[i + 2][0], pts[i + 2][1]);
        ctx.closePath();
        ctx.fillStyle = `rgba(224,242,254,${0.03 + r() * 0.07})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = Math.max(0.6, W / 900);
        ctx.stroke();
      }
      for (let i = 0; i < 40; i++) {
        const sx = r() * W;
        const sy = r() * H;
        const sr = (0.008 + r() * 0.02) * W;
        ctx.fillStyle = r() > 0.3 ? `rgba(255,255,255,${0.4 + r() * 0.5})` : `rgba(186,230,253,${0.4 + r() * 0.5})`;
        ctx.fill(S.star(sx, sy, sr, sr * 0.2, 4));
      }
    },
  },
  {
    id: 'cyber-grid',
    name: 'Cyberpunk Grid',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#05030A');
      g.addColorStop(0.55, '#18072B');
      g.addColorStop(1, '#07000F');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const horizY = H * 0.58;
      radial(ctx, W * 0.5, horizY, H * 0.45, '#FF007F', 0.45);
      radial(ctx, W * 0.5, horizY, H * 0.28, '#00F0FF', 0.35);
      ctx.save();
      ctx.lineWidth = Math.max(1, W / 600);
      const rows = 18;
      for (let i = 1; i <= rows; i++) {
        const p = Math.pow(i / rows, 2.2);
        const y = horizY + (H - horizY) * p;
        ctx.strokeStyle = `rgba(0,240,255,${0.1 + p * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      const cols = 14;
      for (let i = -cols; i <= cols; i++) {
        const xAtBottom = W * 0.5 + i * (W / cols) * 1.4;
        ctx.strokeStyle = `rgba(255,0,128,${0.25 + 0.35 * (1 - Math.abs(i) / cols)})`;
        ctx.beginPath();
        ctx.moveTo(W * 0.5, horizY);
        ctx.lineTo(xAtBottom, H);
        ctx.stroke();
      }
      ctx.restore();
      const r = rng(303);
      for (let i = 0; i < 90; i++) {
        const sx = r() * W;
        const sy = r() * horizY;
        ctx.fillStyle = r() > 0.5 ? 'rgba(0,240,255,0.7)' : 'rgba(255,0,128,0.7)';
        ctx.fillRect(sx, sy, Math.max(1, W / 700), Math.max(1, W / 700));
      }
    },
  },
  {
    id: 'rose-marble',
    name: 'Rose Gold Marble',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#FAF7F5');
      g.addColorStop(0.5, '#ECE5E0');
      g.addColorStop(1, '#F5F0EB');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const r = rng(404);
      for (let i = 0; i < 18; i++) {
        radial(ctx, r() * W, r() * H, (0.2 + r() * 0.4) * H, '#D6CBC4', 0.18 + r() * 0.15);
      }
      const drawVein = (startX: number, startY: number, stroke: string, width: number) => {
        ctx.save();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.beginPath();
        let curX = startX;
        let curY = startY;
        ctx.moveTo(curX, curY);
        for (let j = 0; j < 9; j++) {
          const cpX = curX + (r() - 0.45) * W * 0.3;
          const cpY = curY + r() * H * 0.18;
          curX = curX + (r() - 0.5) * W * 0.25;
          curY = curY + r() * H * 0.15;
          ctx.quadraticCurveTo(cpX, cpY, curX, curY);
        }
        ctx.stroke();
        ctx.restore();
      };
      for (let i = 0; i < 6; i++) {
        drawVein(r() * W, -H * 0.05, 'rgba(203,138,110,0.65)', Math.max(1.2, W / 450));
        drawVein(r() * W, -H * 0.05, 'rgba(212,175,55,0.45)', Math.max(0.8, W / 650));
        drawVein(r() * W, -H * 0.05, 'rgba(160,110,95,0.25)', Math.max(0.5, W / 900));
      }
      for (let i = 0; i < 150; i++) {
        const sx = r() * W;
        const sy = r() * H;
        const sr = (r() * W) / 800 + W / 2000;
        ctx.fillStyle = r() > 0.5 ? 'rgba(236,179,155,0.7)' : 'rgba(212,175,55,0.6)';
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'galaxy-nebula',
    name: 'Cosmic Nebula',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#040209');
      g.addColorStop(0.5, '#0B0418');
      g.addColorStop(1, '#030107');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.25, H * 0.35, H * 0.5, '#8B5CF6', 0.42);
      radial(ctx, W * 0.75, H * 0.65, H * 0.45, '#EC4899', 0.35);
      radial(ctx, W * 0.5, H * 0.85, H * 0.4, '#06B6D4', 0.28);
      radial(ctx, W * 0.7, H * 0.2, H * 0.35, '#A855F7', 0.3);
      const r = rng(505);
      for (let i = 0; i < 280; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (r() * W) / 600 + W / 1800;
        ctx.fillStyle = r() > 0.8 ? 'rgba(255,255,255,0.9)' : r() > 0.5 ? 'rgba(216,180,254,0.7)' : 'rgba(165,243,252,0.6)';
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < 15; i++) {
        const tx = r() * W;
        const ty = r() * H;
        const tr = (0.01 + r() * 0.015) * W;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill(S.star(tx, ty, tr, tr * 0.2, 4));
      }
    },
  },
  {
    id: 'coquette-pink',
    name: 'Pastel Coquette',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#FFF5F8');
      g.addColorStop(0.5, '#FCE7F3');
      g.addColorStop(1, '#FBCFE8');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.2, H * 0.3, H * 0.45, '#FFFFFF', 0.6);
      radial(ctx, W * 0.8, H * 0.7, H * 0.5, '#F472B6', 0.25);
      radial(ctx, W * 0.5, H * 0.15, H * 0.35, '#E9D5FF', 0.3);
      const r = rng(606);
      for (let i = 0; i < 16; i++) {
        const bx = r() * W;
        const by = r() * H;
        const bs = (0.02 + r() * 0.035) * W;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate((r() - 0.5) * 0.5);
        ctx.fillStyle = r() > 0.5 ? 'rgba(244,114,182,0.35)' : 'rgba(251,146,60,0.22)';
        ctx.fill(i % 2 === 0 ? S.bow(0, 0, bs) : S.heart(0, 0, bs));
        ctx.restore();
      }
      for (let i = 0; i < 45; i++) {
        const sx = r() * W;
        const sy = r() * H;
        const sr = (0.008 + r() * 0.015) * W;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill(S.star(sx, sy, sr, sr * 0.25, 4));
      }
    },
  },
  {
    id: 'quilted-leather',
    name: 'Quilted Leather',
    draw: (ctx, W, H) => {
      ctx.fillStyle = '#111116';
      ctx.fillRect(0, 0, W, H);
      const s = Math.max(20, W / 7.5);
      for (let y = -s; y < H + s * 2; y += s) {
        for (let x = -s; x < W + s * 2; x += s) {
          const cx = x;
          const cy = y;
          const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.75);
          rg.addColorStop(0, '#262632');
          rg.addColorStop(0.65, '#16161D');
          rg.addColorStop(1, '#0B0B0F');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(cx, cy - s / 2);
          ctx.lineTo(cx + s / 2, cy);
          ctx.lineTo(cx, cy + s / 2);
          ctx.lineTo(cx - s / 2, cy);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.14)';
          ctx.lineWidth = Math.max(0.6, W / 800);
          ctx.stroke();
          ctx.fillStyle = '#8E8E98';
          ctx.beginPath();
          ctx.arc(cx, cy - s / 2, Math.max(1.2, W / 380), 0, Math.PI * 2);
          ctx.arc(cx + s / 2, cy, Math.max(1.2, W / 380), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      radial(ctx, W * 0.5, H * 0.5, H * 0.65, 'rgba(0,0,0,0.5)', 0.5);
    },
  },
  {
    id: 'emerald-abyss',
    name: 'Royal Emerald',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#02150D');
      g.addColorStop(0.5, '#073320');
      g.addColorStop(1, '#02120B');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.55, '#10B981', 0.4);
      radial(ctx, W * 0.75, H * 0.2, H * 0.4, '#34D399', 0.25);
      radial(ctx, W * 0.25, H * 0.8, H * 0.45, '#059669', 0.3);
      const r = rng(808);
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.moveTo(r() * W, r() * H);
        ctx.lineTo(r() * W, r() * H);
        ctx.lineTo(r() * W, r() * H);
        ctx.closePath();
        ctx.fillStyle = `rgba(110,231,183,${0.02 + r() * 0.06})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(167,243,208,0.12)';
        ctx.lineWidth = Math.max(0.5, W / 900);
        ctx.stroke();
      }
      for (let i = 0; i < 90; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (r() * W) / 600 + W / 1600;
        ctx.fillStyle = r() > 0.6 ? 'rgba(253,224,71,0.7)' : 'rgba(212,175,55,0.45)';
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'gothic-crimson',
    name: 'Gothic Crimson',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#080608');
      g.addColorStop(0.65, '#1E060A');
      g.addColorStop(1, '#050204');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.8, H * 0.55, '#DC2626', 0.48);
      radial(ctx, W * 0.3, H * 0.6, H * 0.4, '#991B1B', 0.35);
      const r = rng(909);
      for (let i = 0; i < 80; i++) {
        const ex = r() * W;
        const ey = H * (0.35 + r() * 0.65);
        const er = (0.005 + r() * 0.015) * W;
        ctx.fillStyle = r() > 0.5 ? `rgba(254,240,138,${0.5 + r() * 0.5})` : `rgba(239,68,68,${0.4 + r() * 0.5})`;
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();
      }
      radial(ctx, W * 0.5, H * 0.5, H * 0.7, 'rgba(0,0,0,0.6)', 0.6);
    },
  },
  {
    id: 'anime-sunset',
    name: 'Anime Sunset',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1E1B4B');
      g.addColorStop(0.3, '#4C1D95');
      g.addColorStop(0.55, '#BE185D');
      g.addColorStop(0.78, '#F97316');
      g.addColorStop(1, '#FDE047');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.75, H * 0.4, '#FEF08A', 0.45);
      ctx.fillStyle = 'rgba(76,29,149,0.35)';
      ctx.beginPath();
      ctx.ellipse(W * 0.25, H * 0.68, W * 0.35, H * 0.07, 0, 0, Math.PI * 2);
      ctx.ellipse(W * 0.75, H * 0.62, W * 0.4, H * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FEF9C3';
      ctx.fill(S.moon(W * 0.8, H * 0.18, W * 0.065));
      const r = rng(1010);
      for (let i = 0; i < 40; i++) {
        const sx = r() * W;
        const sy = r() * H * 0.45;
        const sr = (0.005 + r() * 0.012) * W;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill(S.star(sx, sy, sr, sr * 0.25, 4));
      }
    },
  },
// =====================================================================
  // Bespoke Themed Procedural Backgrounds (Clean, Rich, NO duplicate zippers)
  // =====================================================================
  {
    id: 'bg-cute-kitty',
    name: 'Cute Kitty Hat',
    imageSrc: '/wallpapers/cute-kitty-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/cute-kitty-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      // Soft pink & lilac quilted silk with floating sparkles & cherry blossoms
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#3A1428');
      g.addColorStop(0.4, '#561E3D');
      g.addColorStop(0.8, '#431430');
      g.addColorStop(1, '#200717');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.35, H * 0.45, '#F472B6', 0.32);
      radial(ctx, W * 0.2, H * 0.8, H * 0.4, '#EC4899', 0.22);
      // Quilted subtle diamond lattice
      const s = Math.max(24, W / 9);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = Math.max(0.6, W / 900);
      for (let y = -s; y < H + s * 2; y += s) {
        for (let x = -s; x < W + s * 2; x += s) {
          ctx.beginPath();
          ctx.moveTo(x, y - s / 2);
          ctx.lineTo(x + s / 2, y);
          ctx.lineTo(x, y + s / 2);
          ctx.lineTo(x - s / 2, y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
      // Floating sparkles & paw glows
      const r = rng(101);
      for (let i = 0; i < 45; i++) {
        const x = r() * W;
        const y = r() * H;
        const sr = (0.006 + r() * 0.014) * W;
        ctx.fillStyle = r() > 0.5 ? 'rgba(255,220,240,0.75)' : 'rgba(244,114,182,0.6)';
        ctx.fill(S.star(x, y, sr, sr * 0.35, 4));
      }
    
      });
    },
  },
  {
    id: 'bg-aesthetic-fawn',
    name: 'Aesthetic Fawn',
    draw: (ctx, W, H) => {
      // Split warm autumn amber (left) & forest sage green (right) with sunbeams
      const gL = ctx.createLinearGradient(0, 0, 0, H);
      gL.addColorStop(0, '#5A3825');
      gL.addColorStop(0.5, '#7C4A2D');
      gL.addColorStop(1, '#3B2214');
      ctx.fillStyle = gL;
      ctx.fillRect(0, 0, W * 0.5, H);

      const gR = ctx.createLinearGradient(0, 0, 0, H);
      gR.addColorStop(0, '#2D3E35');
      gR.addColorStop(0.5, '#445D4F');
      gR.addColorStop(1, '#1E2B24');
      ctx.fillStyle = gR;
      ctx.fillRect(W * 0.5, 0, W * 0.5, H);

      // Ambient center blend & sunbeams
      radial(ctx, W * 0.5, H * 0.25, H * 0.55, '#FDE68A', 0.25);
      radial(ctx, W * 0.2, H * 0.85, H * 0.4, '#D97706', 0.2);
      radial(ctx, W * 0.8, H * 0.75, H * 0.4, '#10B981', 0.18);
      const r = rng(202);
      for (let i = 0; i < 60; i++) {
        const x = r() * W;
        const y = r() * H;
        const sr = (0.008 + r() * 0.02) * W;
        ctx.fillStyle = `rgba(254,243,199,${0.15 + r() * 0.35})`;
        ctx.beginPath();
        ctx.arc(x, y, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'bg-ai-fantasy-boy',
    name: 'AI Fantasy Hero',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#101424');
      g.addColorStop(0.5, '#182038');
      g.addColorStop(1, '#0A0D18');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.4, H * 0.5, '#38BDF8', 0.3);
      radial(ctx, W * 0.8, H * 0.8, H * 0.45, '#818CF8', 0.25);
      // Perspective digital streaks
      ctx.save();
      ctx.strokeStyle = 'rgba(56,189,248,0.25)';
      ctx.lineWidth = Math.max(0.8, W / 700);
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(W * 0.5, H * 0.35);
        ctx.lineTo((i / 11) * W, H);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: 'bg-black-rose',
    name: 'Royal Black Rose',
    imageSrc: '/wallpapers/black-rose-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/black-rose-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      // Royal purple & velvet black drapes with golden leaves and dewdrops
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#140320');
      g.addColorStop(0.35, '#2B0A42');
      g.addColorStop(0.7, '#1C042D');
      g.addColorStop(1, '#0B0112');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.35, H * 0.55, '#A855F7', 0.35);
      radial(ctx, W * 0.85, H * 0.75, H * 0.45, '#C084FC', 0.22);
      radial(ctx, W * 0.15, H * 0.2, H * 0.4, '#E879F9', 0.2);

      // Flowing silk curve ripples
      const r = rng(303);
      ctx.save();
      for (let i = 0; i < 16; i++) {
        const y0 = H * (0.1 + (i / 16) * 0.85);
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.bezierCurveTo(W * 0.35, y0 - H * 0.08, W * 0.65, y0 + H * 0.08, W, y0);
        ctx.strokeStyle = `rgba(212,175,55,${0.08 + r() * 0.14})`;
        ctx.lineWidth = Math.max(1, W / 500);
        ctx.stroke();
      }
      ctx.restore();

      // Dewdrops & gold dust
      for (let i = 0; i < 70; i++) {
        const x = r() * W;
        const y = r() * H;
        const sr = (0.005 + r() * 0.015) * W;
        ctx.fillStyle = r() > 0.6 ? 'rgba(253,224,71,0.75)' : 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(x, y, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    
      });
    },
  },
  {
    id: 'bg-blue-fantasy',
    name: 'Blue Fantasy Dream',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#061325');
      g.addColorStop(0.5, '#0E2E55');
      g.addColorStop(1, '#030B17');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.55, '#38BDF8', 0.35);
      radial(ctx, W * 0.2, H * 0.2, H * 0.4, '#818CF8', 0.25);
      const r = rng(404);
      for (let i = 0; i < 80; i++) {
        const x = r() * W;
        const y = r() * H;
        const sr = (0.006 + r() * 0.015) * W;
        ctx.fillStyle = 'rgba(224,242,254,0.75)';
        ctx.fill(S.star(x, y, sr, sr * 0.35, 4));
      }
    },
  },
  {
    id: 'bg-bone-and-zip',
    name: 'Bone & Skull Zip',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#101014');
      g.addColorStop(0.5, '#1C1C24');
      g.addColorStop(1, '#0A0A0D');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.5, '#71717A', 0.22);
      radial(ctx, W * 0.5, H * 0.85, H * 0.4, '#DC2626', 0.15);
      // Gothic architectural arches
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = Math.max(1, W / 600);
      for (let i = 1; i <= 6; i++) {
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.5, (i / 6) * W * 0.45, Math.PI, 0, false);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: 'bg-candy-wonderland',
    name: 'Candy Wonderland',
    imageSrc: '/wallpapers/candy-wonderland.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/candy-wonderland.jpg', undefined, undefined, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#581C48');
      g.addColorStop(0.5, '#831843');
      g.addColorStop(1, '#3B0764');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.3, H * 0.3, H * 0.45, '#F472B6', 0.4);
      radial(ctx, W * 0.7, H * 0.7, H * 0.45, '#38BDF8', 0.3);
      radial(ctx, W * 0.5, H * 0.5, H * 0.35, '#FDE047', 0.25);
      const r = rng(505);
      for (let i = 0; i < 50; i++) {
        const x = r() * W;
        const y = r() * H;
        const sr = (0.012 + r() * 0.025) * W;
        ctx.fillStyle = r() > 0.6 ? 'rgba(253,224,71,0.65)' : r() > 0.3 ? 'rgba(244,114,182,0.65)' : 'rgba(56,189,248,0.65)';
        ctx.beginPath();
        ctx.arc(x, y, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    
      });
    },
  },
  {
    id: 'bg-cherry-blossom',
    name: 'Cherry Blossom Sakura',
    imageSrc: '/wallpapers/cherry-blossom-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/cherry-blossom-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#240B1A');
      g.addColorStop(0.5, '#451631');
      g.addColorStop(1, '#1A0612');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.8, H * 0.2, H * 0.35, '#FFF1F2', 0.45); // Moon glow
      radial(ctx, W * 0.5, H * 0.6, H * 0.55, '#FB7185', 0.3);
      const r = rng(606);
      for (let i = 0; i < 40; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (0.01 + r() * 0.018) * W;
        ctx.fillStyle = 'rgba(255,228,230,0.75)';
        ctx.fill(S.flower(x, y, s, 5, 0.6));
      }
    
      });
    },
  },
  {
    id: 'bg-cosmic-portal',
    name: 'Cosmic Portal Abyss',
    imageSrc: '/wallpapers/cosmic-portal-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/cosmic-portal-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#090514');
      g.addColorStop(0.5, '#140A2E');
      g.addColorStop(1, '#05020D');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.45, '#A855F7', 0.45);
      radial(ctx, W * 0.5, H * 0.5, H * 0.25, '#38BDF8', 0.4);
      // Accretion spiral swirls
      const r = rng(707);
      ctx.save();
      for (let i = 0; i < 200; i++) {
        const a = r() * Math.PI * 4;
        const dist = Math.pow(r(), 0.7) * W * 0.45;
        const x = W * 0.5 + Math.cos(a) * dist;
        const y = H * 0.5 + Math.sin(a) * dist * 0.7;
        ctx.fillStyle = r() > 0.5 ? 'rgba(168,85,247,0.8)' : 'rgba(56,189,248,0.8)';
        ctx.beginPath();
        ctx.arc(x, y, (0.003 + r() * 0.008) * W, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    
      });
    },
  },
  {
    id: 'bg-crimson-storm',
    name: 'Crimson Storm Rider',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#150204');
      g.addColorStop(0.5, '#2D060B');
      g.addColorStop(1, '#0C0102');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.5, '#EF4444', 0.4);
      radial(ctx, W * 0.2, H * 0.8, H * 0.4, '#F97316', 0.3);
      const r = rng(808);
      for (let i = 0; i < 50; i++) {
        const x = r() * W;
        const y = H * (0.3 + r() * 0.7);
        ctx.fillStyle = 'rgba(254,202,202,0.7)';
        ctx.beginPath();
        ctx.arc(x, y, (0.005 + r() * 0.012) * W, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'bg-crystal-butterfly-blue',
    name: 'Crystal Butterfly Cyan',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#03141F');
      g.addColorStop(0.5, '#082E47');
      g.addColorStop(1, '#020C14');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.55, '#06B6D4', 0.45);
      radial(ctx, W * 0.5, H * 0.45, H * 0.28, '#67E8F9', 0.35);
      const r = rng(909);
      for (let i = 0; i < 70; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (0.008 + r() * 0.018) * W;
        ctx.fillStyle = 'rgba(207,250,254,0.8)';
        ctx.fill(S.star(x, y, s, s * 0.3, 4));
      }
    },
  },
  {
    id: 'bg-crystal-butterfly-luxury',
    name: 'Crystal Butterfly Luxury',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#100A1F');
      g.addColorStop(0.5, '#1E1438');
      g.addColorStop(1, '#080512');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.4, H * 0.55, '#C084FC', 0.35);
      radial(ctx, W * 0.8, H * 0.8, H * 0.4, '#E2E8F0', 0.25);
      const r = rng(1010);
      for (let i = 0; i < 60; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.arc(x, y, (0.005 + r() * 0.014) * W, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'bg-crystal-dimension',
    name: 'Crystal Diamond Dimension',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#0D1B2A');
      g.addColorStop(0.5, '#1B263B');
      g.addColorStop(1, '#0B131E');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.5, '#38BDF8', 0.3);
      // Isometric facet geometric lines
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = Math.max(0.8, W / 650);
      const step = W / 6;
      for (let x = -W; x < W * 2; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + H * 0.57, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - H * 0.57, H);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: 'bg-cute-animals-gathering',
    name: 'Cute Animals Gathering',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#264228');
      g.addColorStop(0.5, '#3B683E');
      g.addColorStop(1, '#1E3320');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.3, H * 0.5, '#FDE047', 0.3);
      radial(ctx, W * 0.3, H * 0.8, H * 0.4, '#86EFAC', 0.25);
      const r = rng(1111);
      for (let i = 0; i < 40; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(254,240,138,0.7)';
        ctx.fill(S.circle(x, y, (0.008 + r() * 0.015) * W));
      }
    },
  },
  {
    id: 'bg-cute-baby-animal',
    name: 'Cute Baby Animal',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#421C2B');
      g.addColorStop(0.5, '#682C43');
      g.addColorStop(1, '#2B111B');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.4, H * 0.5, '#F472B6', 0.38);
      const r = rng(1212);
      for (let i = 0; i < 35; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(255,228,230,0.7)';
        ctx.fill(S.paw(x, y, (0.018 + r() * 0.025) * W));
      }
    },
  },
  {
    id: 'bg-cute-animal-duo',
    name: 'Cute Fluffy Animal Duo',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#362417');
      g.addColorStop(0.5, '#563A25');
      g.addColorStop(1, '#24170E');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.4, H * 0.5, '#FDE68A', 0.35);
      const r = rng(1313);
      for (let i = 0; i < 40; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(254,243,199,0.7)';
        ctx.fill(S.circle(x, y, (0.008 + r() * 0.016) * W));
      }
    },
  },
  {
    id: 'bg-dark-king',
    name: 'Dark King Royalty',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0E0C13');
      g.addColorStop(0.5, '#1B1724');
      g.addColorStop(1, '#08060B');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.35, H * 0.5, '#D4AF37', 0.28);
      radial(ctx, W * 0.5, H * 0.75, H * 0.45, '#7C3AED', 0.2);
      const r = rng(1414);
      for (let i = 0; i < 35; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(212,175,55,0.65)';
        ctx.fill(S.star(x, y, (0.006 + r() * 0.014) * W, (0.003 + r() * 0.007) * W, 4));
      }
    },
  },
  {
    id: 'bg-dark-romance',
    name: 'Dark Romance XOXO',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1E0409');
      g.addColorStop(0.5, '#3B0913');
      g.addColorStop(1, '#110104');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.5, '#E11D48', 0.42);
      radial(ctx, W * 0.8, H * 0.75, H * 0.4, '#BE123C', 0.28);
      const r = rng(1515);
      for (let i = 0; i < 24; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (0.02 + r() * 0.04) * W;
        ctx.fillStyle = `rgba(244,63,94,${0.25 + r() * 0.35})`;
        ctx.fill(S.heart(x, y, s));
      }
    },
  },
  {
    id: 'bg-dream-unicorn',
    name: 'Dream Unicorn Pastel',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#311042');
      g.addColorStop(0.4, '#4C1D6E');
      g.addColorStop(0.8, '#1E293B');
      g.addColorStop(1, '#0F172A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.3, H * 0.35, H * 0.45, '#F472B6', 0.4);
      radial(ctx, W * 0.7, H * 0.65, H * 0.45, '#38BDF8', 0.35);
      const r = rng(1616);
      for (let i = 0; i < 60; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (0.008 + r() * 0.016) * W;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fill(S.star(x, y, s, s * 0.35, 4));
      }
    },
  },
  {
    id: 'bg-electric-pulse',
    name: 'Electric Pulse Energy',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#090514');
      g.addColorStop(0.5, '#170A34');
      g.addColorStop(1, '#05020D');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.55, '#8B5CF6', 0.45);
      radial(ctx, W * 0.5, H * 0.5, H * 0.28, '#06B6D4', 0.35);
      const r = rng(1717);
      for (let i = 0; i < 20; i++) {
        const s = (0.03 + r() * 0.05) * W;
        ctx.fillStyle = 'rgba(196,181,253,0.7)';
        ctx.fill(S.bolt(r() * W, r() * H, s));
      }
    },
  },
  {
    id: 'bg-fantasy-nature-sunset',
    name: 'Fantasy Nature Blue Jay',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1E1528');
      g.addColorStop(0.4, '#3F223E');
      g.addColorStop(0.7, '#6E3C32');
      g.addColorStop(1, '#21100C');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.6, H * 0.5, '#F97316', 0.4);
      radial(ctx, W * 0.3, H * 0.3, H * 0.4, '#38BDF8', 0.25);
      const r = rng(1818);
      for (let i = 0; i < 50; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(254,215,170,0.7)';
        ctx.fill(S.circle(x, y, (0.007 + r() * 0.015) * W));
      }
    },
  },
  {
    id: 'bg-fire-wolf',
    name: 'Fire Wolf Flame',
    imageSrc: '/wallpapers/fire-wolf-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/fire-wolf-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      // Blazing fire magma & embers
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#170303');
      g.addColorStop(0.5, '#320606');
      g.addColorStop(1, '#0C0101');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.75, H * 0.6, '#DC2626', 0.55);
      radial(ctx, W * 0.5, H * 0.85, H * 0.35, '#F59E0B', 0.45);
      radial(ctx, W * 0.5, H * 0.95, H * 0.2, '#FEF08A', 0.5);

      // Rising sparks and fire particles
      const r = rng(1919);
      for (let i = 0; i < 85; i++) {
        const x = r() * W;
        const y = H * (0.2 + r() * 0.8);
        const sr = (0.006 + r() * 0.02) * W;
        ctx.fillStyle = r() > 0.6 ? 'rgba(254,240,138,0.85)' : r() > 0.3 ? 'rgba(249,115,22,0.8)' : 'rgba(239,68,68,0.75)';
        ctx.beginPath();
        ctx.arc(x, y, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    
      });
    },
  },
  {
    id: 'bg-galaxy-cookie-dreams',
    name: 'Galaxy Cookie Dreams',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#261233');
      g.addColorStop(0.5, '#411E56');
      g.addColorStop(1, '#150A1C');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.55, '#D946EF', 0.35);
      radial(ctx, W * 0.7, H * 0.75, H * 0.4, '#FDE047', 0.25);
      const r = rng(2020);
      for (let i = 0; i < 60; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(254,240,138,0.8)';
        ctx.fill(S.star(x, y, (0.007 + r() * 0.016) * W, (0.003 + r() * 0.007) * W, 5));
      }
    },
  },
  {
    id: 'bg-galaxy-portal',
    name: 'Galaxy Portal Starlight',
    imageSrc: '/wallpapers/galaxy-portal-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/galaxy-portal-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#060B1C');
      g.addColorStop(0.5, '#101B3E');
      g.addColorStop(1, '#030610');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.5, '#38BDF8', 0.45);
      radial(ctx, W * 0.5, H * 0.5, H * 0.3, '#A855F7', 0.4);
      const r = rng(2121);
      for (let i = 0; i < 90; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill(S.star(x, y, (0.005 + r() * 0.014) * W, (0.002 + r() * 0.006) * W, 4));
      }
    
      });
    },
  },
  {
    id: 'bg-gaming-setup',
    name: 'Cyber Gaming Station',
    imageSrc: '/wallpapers/gaming-zipperlock.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/gaming-zipperlock.jpg', undefined, undefined, (ctx, W, H) => {
      // Dark chassis with flowing RGB neon wave and honeycomb mesh
      ctx.fillStyle = '#0B0D14';
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.2, H * 0.3, H * 0.45, '#A855F7', 0.35);
      radial(ctx, W * 0.8, H * 0.7, H * 0.45, '#06B6D4', 0.35);
      radial(ctx, W * 0.5, H * 0.9, H * 0.4, '#10B981', 0.25);

      // Hexagonal honeycomb mesh
      const hs = Math.max(12, W / 24);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = Math.max(0.6, W / 800);
      for (let y = -hs; y < H + hs * 2; y += hs * 1.73) {
        for (let x = -hs * 2; x < W + hs * 2; x += hs * 3) {
          const cx = x + ((Math.floor(y / (hs * 1.73)) % 2) * hs * 1.5);
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3;
            const px = cx + Math.cos(a) * hs * 0.85;
            const py = y + Math.sin(a) * hs * 0.85;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
    
      });
    },
  },
  {
    id: 'bg-ice-tiger',
    name: 'Frost Ice Tiger',
    imageSrc: '/wallpapers/ice-tiger-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/ice-tiger-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#041624');
      g.addColorStop(0.5, '#0B2E4A');
      g.addColorStop(1, '#020C14');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.4, H * 0.55, '#38BDF8', 0.4);
      radial(ctx, W * 0.8, H * 0.8, H * 0.4, '#E0F2FE', 0.25);
      const r = rng(2222);
      for (let i = 0; i < 70; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (0.008 + r() * 0.018) * W;
        ctx.fillStyle = 'rgba(224,242,254,0.85)';
        ctx.fill(S.star(x, y, s, s * 0.35, 6));
      }
    
      });
    },
  },
  {
    id: 'bg-ice-wolf',
    name: 'Blizzard Ice Wolf',
    imageSrc: '/wallpapers/ice-wolf-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/ice-wolf-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#081726');
      g.addColorStop(0.5, '#132C44');
      g.addColorStop(1, '#050E17');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.35, H * 0.5, '#7DD3FC', 0.35);
      const r = rng(2323);
      for (let i = 0; i < 80; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.arc(x, y, (0.005 + r() * 0.015) * W, 0, Math.PI * 2);
        ctx.fill();
      }
    
      });
    },
  },
  {
    id: 'bg-liquid-chrome',
    name: 'Liquid Chrome Mercury',
    imageSrc: '/wallpapers/liquid-chrome-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/liquid-chrome-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      // Liquid chrome reflective mirror fluid
      ctx.fillStyle = '#101115';
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.65, '#E2E8F0', 0.3);
      radial(ctx, W * 0.2, H * 0.2, H * 0.45, '#FFFFFF', 0.35);
      const r = rng(2424);
      ctx.save();
      for (let i = 0; i < 18; i++) {
        const y0 = H * (0.05 + (i / 18) * 0.9);
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.bezierCurveTo(W * 0.3, y0 - H * 0.07, W * 0.7, y0 + H * 0.07, W, y0);
        ctx.strokeStyle = `rgba(255,255,255,${0.15 + r() * 0.25})`;
        ctx.lineWidth = Math.max(1.2, W / 400);
        ctx.stroke();
      }
      ctx.restore();
    
      });
    },
  },
  {
    id: 'bg-luxury-diamond',
    name: 'Luxury Diamond Solitaire',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0D1117');
      g.addColorStop(0.5, '#1A202C');
      g.addColorStop(1, '#070A0F');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.55, '#E2E8F0', 0.4);
      radial(ctx, W * 0.5, H * 0.45, H * 0.25, '#FFFFFF', 0.35);
      const r = rng(2525);
      for (let i = 0; i < 70; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (0.008 + r() * 0.02) * W;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill(S.star(x, y, s, s * 0.3, 4));
      }
    },
  },
  {
    id: 'bg-moonlight-water',
    name: 'Moonlight Night Waterfall',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#050E1E');
      g.addColorStop(0.5, '#0C1F3D');
      g.addColorStop(1, '#030812');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.8, H * 0.18, H * 0.35, '#E0F2FE', 0.5); // Moon
      radial(ctx, W * 0.5, H * 0.7, H * 0.5, '#38BDF8', 0.28);
      const r = rng(2626);
      for (let i = 0; i < 60; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(224,242,254,0.7)';
        ctx.fill(S.circle(x, y, (0.006 + r() * 0.015) * W));
      }
    },
  },
  {
    id: 'bg-neon-energy',
    name: 'Neon Laser Vortex',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#10051C');
      g.addColorStop(0.5, '#250B3E');
      g.addColorStop(1, '#0A0212');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.5, '#D946EF', 0.45);
      radial(ctx, W * 0.5, H * 0.5, H * 0.25, '#06B6D4', 0.35);
      const r = rng(2727);
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = 'rgba(217,70,239,0.7)';
        ctx.fill(S.bolt(r() * W, r() * H, (0.03 + r() * 0.05) * W));
      }
    },
  },
  {
    id: 'bg-neon-racing',
    name: 'Neon Highway Racing',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#090A14');
      g.addColorStop(0.5, '#131525');
      g.addColorStop(1, '#05060A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.3, H * 0.75, H * 0.5, '#EF4444', 0.45); // Red tail-light streaks
      radial(ctx, W * 0.7, H * 0.75, H * 0.5, '#38BDF8', 0.35); // Cyan head-light streaks
      // Speed streaks
      ctx.save();
      const r = rng(2828);
      for (let i = 0; i < 30; i++) {
        const y = H * (0.35 + r() * 0.65);
        ctx.strokeStyle = r() > 0.5 ? 'rgba(239,68,68,0.7)' : 'rgba(56,189,248,0.7)';
        ctx.lineWidth = Math.max(1, W / 450);
        ctx.beginPath();
        ctx.moveTo(r() * W * 0.3, y);
        ctx.lineTo(r() * W * 0.7 + W * 0.3, y);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: 'bg-panther-purple-eyes',
    name: 'Black Panther Purple Eyes',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0A0612');
      g.addColorStop(0.5, '#140A24');
      g.addColorStop(1, '#050309');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.35, H * 0.4, H * 0.35, '#A855F7', 0.55); // Left eye glow
      radial(ctx, W * 0.65, H * 0.4, H * 0.35, '#A855F7', 0.55); // Right eye glow
      radial(ctx, W * 0.35, H * 0.4, H * 0.12, '#E9D5FF', 0.7);
      radial(ctx, W * 0.65, H * 0.4, H * 0.12, '#E9D5FF', 0.7);
    },
  },
  {
    id: 'bg-pink-kitty',
    name: 'Pink Kitty Kawaii',
    imageSrc: '/wallpapers/pink-kitty-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/pink-kitty-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#381226');
      g.addColorStop(0.5, '#5C2140');
      g.addColorStop(1, '#230A17');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.38, H * 0.5, '#F472B6', 0.4);
      const r = rng(2929);
      for (let i = 0; i < 40; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(255,228,230,0.75)';
        ctx.fill(S.paw(x, y, (0.016 + r() * 0.024) * W));
      }
    
      });
    },
  },
  {
    id: 'bg-pink-moonlight-cherry',
    name: 'Pink Moonlight Sakura',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#260B1C');
      g.addColorStop(0.5, '#481735');
      g.addColorStop(1, '#1A0613');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.3, H * 0.45, '#FFF1F2', 0.45);
      radial(ctx, W * 0.5, H * 0.65, H * 0.5, '#FB7185', 0.3);
      const r = rng(3030);
      for (let i = 0; i < 45; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(255,228,230,0.8)';
        ctx.fill(S.flower(x, y, (0.01 + r() * 0.018) * W, 5, 0.6));
      }
    },
  },
  {
    id: 'bg-purple-butterfly',
    name: 'Purple Butterfly Starlight',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#120524');
      g.addColorStop(0.5, '#280E4B');
      g.addColorStop(1, '#0B0216');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.55, '#C084FC', 0.4);
      radial(ctx, W * 0.2, H * 0.7, H * 0.4, '#E879F9', 0.25);
      const r = rng(3131);
      for (let i = 0; i < 65; i++) {
        const x = r() * W;
        const y = r() * H;
        const s = (0.007 + r() * 0.016) * W;
        ctx.fillStyle = 'rgba(245,208,254,0.8)';
        ctx.fill(S.star(x, y, s, s * 0.35, 4));
      }
    },
  },
  {
    id: 'bg-royal-gold-crown',
    name: 'Royal Gold Crown',
    draw: (ctx, W, H) => {
      // Imperial black velvet with gold damask embroidery
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#100D06');
      g.addColorStop(0.5, '#1E180B');
      g.addColorStop(1, '#0A0803');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.35, H * 0.5, '#D4AF37', 0.35);
      radial(ctx, W * 0.5, H * 0.75, H * 0.45, '#F59E0B', 0.22);
      const r = rng(3232);
      for (let i = 0; i < 50; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(253,224,71,0.7)';
        ctx.fill(S.star(x, y, (0.007 + r() * 0.016) * W, (0.003 + r() * 0.008) * W, 4));
      }
    },
  },
  {
    id: 'bg-royal-queen',
    name: 'Royal Queen Emerald & Gold',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#04170E');
      g.addColorStop(0.5, '#0A3320');
      g.addColorStop(1, '#020F09');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.45, H * 0.55, '#10B981', 0.4);
      radial(ctx, W * 0.7, H * 0.25, H * 0.4, '#D4AF37', 0.3);
      const r = rng(3333);
      for (let i = 0; i < 60; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = r() > 0.5 ? 'rgba(253,224,71,0.75)' : 'rgba(167,243,208,0.75)';
        ctx.fill(S.circle(x, y, (0.006 + r() * 0.015) * W));
      }
    },
  },
  {
    id: 'bg-seam-of-the-dead',
    name: 'Seam of the Dead Gothic',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0E0C0F');
      g.addColorStop(0.5, '#19151D');
      g.addColorStop(1, '#08070A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.5, '#991B1B', 0.3);
      radial(ctx, W * 0.5, H * 0.85, H * 0.4, '#4B5563', 0.25);
    },
  },
  {
    id: 'bg-seam-of-the-wild',
    name: 'Seam of the Wild Safari',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#241408');
      g.addColorStop(0.5, '#45260F');
      g.addColorStop(1, '#1A0E05');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.65, H * 0.5, '#F59E0B', 0.45);
      radial(ctx, W * 0.5, H * 0.85, H * 0.35, '#DC2626', 0.3);
    },
  },
  {
    id: 'bg-split-fawn',
    name: 'Split Fawn Fairy Tale',
    draw: (ctx, W, H) => {
      const gL = ctx.createLinearGradient(0, 0, 0, H);
      gL.addColorStop(0, '#4E2F1B');
      gL.addColorStop(0.5, '#6E4327');
      gL.addColorStop(1, '#2F1B0F');
      ctx.fillStyle = gL;
      ctx.fillRect(0, 0, W * 0.5, H);

      const gR = ctx.createLinearGradient(0, 0, 0, H);
      gR.addColorStop(0, '#25352A');
      gR.addColorStop(0.5, '#3D5443');
      gR.addColorStop(1, '#18241C');
      ctx.fillStyle = gR;
      ctx.fillRect(W * 0.5, 0, W * 0.5, H);

      radial(ctx, W * 0.5, H * 0.3, H * 0.5, '#FEF08A', 0.3);
      const r = rng(3434);
      for (let i = 0; i < 50; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(254,243,199,0.5)';
        ctx.fill(S.circle(x, y, (0.007 + r() * 0.018) * W));
      }
    },
  },
  {
    id: 'bg-storm-rider',
    name: 'Thunder Storm Rider',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0B1220');
      g.addColorStop(0.5, '#15223C');
      g.addColorStop(1, '#060B14');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.4, H * 0.55, '#38BDF8', 0.45);
      radial(ctx, W * 0.8, H * 0.2, H * 0.35, '#FFFFFF', 0.3);
      const r = rng(3535);
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = 'rgba(224,242,254,0.7)';
        ctx.fill(S.bolt(r() * W, r() * H, (0.025 + r() * 0.05) * W));
      }
    },
  },
  {
    id: 'bg-supercar-gold',
    name: 'Gold Supercar Track',
    imageSrc: '/wallpapers/supercar-gold-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/supercar-gold-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      // Carbon fiber with gold velocity streaks
      ctx.fillStyle = '#0B0B0E';
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.75, H * 0.5, '#D4AF37', 0.4);
      radial(ctx, W * 0.5, H * 0.9, H * 0.3, '#F59E0B', 0.35);
      const r = rng(3636);
      ctx.save();
      for (let i = 0; i < 35; i++) {
        const y = H * (0.3 + r() * 0.7);
        ctx.strokeStyle = 'rgba(212,175,55,0.6)';
        ctx.lineWidth = Math.max(1, W / 450);
        ctx.beginPath();
        ctx.moveTo(r() * W * 0.25, y);
        ctx.lineTo(r() * W * 0.75 + W * 0.25, y);
        ctx.stroke();
      }
      ctx.restore();
    
      });
    },
  },
  {
    id: 'bg-supercar-red',
    name: 'Red Supercar Velocity',
    imageSrc: '/wallpapers/supercar-red-zipper.jpg',
    draw: (ctx, W, H) => {
      drawWallpaper(ctx, W, H, '/wallpapers/supercar-red-zipper.jpg', undefined, undefined, (ctx, W, H) => {
      // Rosso Corsa track with speed streaks
      ctx.fillStyle = '#0E0405';
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.75, H * 0.55, '#DC2626', 0.5);
      radial(ctx, W * 0.5, H * 0.9, H * 0.3, '#EF4444', 0.4);
      const r = rng(3737);
      ctx.save();
      for (let i = 0; i < 40; i++) {
        const y = H * (0.25 + r() * 0.75);
        ctx.strokeStyle = r() > 0.4 ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.7)';
        ctx.lineWidth = Math.max(1, W / 450);
        ctx.beginPath();
        ctx.moveTo(r() * W * 0.2, y);
        ctx.lineTo(r() * W * 0.8 + W * 0.2, y);
        ctx.stroke();
      }
      ctx.restore();
    
      });
    },
  },
  {
    id: 'bg-teddy-bear',
    name: 'Warm Teddy Bear Plush',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#362315');
      g.addColorStop(0.5, '#563822');
      g.addColorStop(1, '#24170E');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.4, H * 0.5, '#FDE68A', 0.35);
      const r = rng(3838);
      for (let i = 0; i < 45; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(254,243,199,0.7)';
        ctx.fill(S.star(x, y, (0.007 + r() * 0.015) * W, (0.003 + r() * 0.007) * W, 4));
      }
    },
  },
  {
    id: 'bg-pizza-surprise',
    name: 'Ultimate Pizza Surprise',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#2C160B');
      g.addColorStop(0.5, '#482412');
      g.addColorStop(1, '#1A0C06');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.5, H * 0.55, '#F59E0B', 0.45);
      radial(ctx, W * 0.5, H * 0.5, H * 0.3, '#DC2626', 0.3);
      const r = rng(3939);
      for (let i = 0; i < 50; i++) {
        const x = r() * W;
        const y = r() * H;
        ctx.fillStyle = 'rgba(254,240,138,0.7)';
        ctx.fill(S.circle(x, y, (0.008 + r() * 0.018) * W));
      }
    },
  },
  {
    id: 'bg-unzipped-wild',
    name: 'Unzipped Wild Safari',
    draw: (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#281508');
      g.addColorStop(0.5, '#4C2810');
      g.addColorStop(1, '#1A0D05');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      radial(ctx, W * 0.5, H * 0.65, H * 0.5, '#F59E0B', 0.45);
      radial(ctx, W * 0.5, H * 0.85, H * 0.35, '#DC2626', 0.3);
    },
  },
];

export function getBackground(id: string) {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}

/* ------------------------------------------------------------------ */
/* Image with adjustments                                              */
/* ------------------------------------------------------------------ */
let filterSupport: boolean | null = null;
function canvasFilterSupported() {
  if (filterSupport !== null) return filterSupport;
  try {
    const c = document.createElement('canvas').getContext('2d')!;
    c.filter = 'blur(2px)';
    filterSupport = c.filter === 'blur(2px)';
  } catch {
    filterSupport = false;
  }
  return filterSupport;
}

export interface SourceImage {
  src: CanvasImageSource;
  w: number;
  h: number;
}

export function drawTransformed(ctx: Ctx, W: number, H: number, img: SourceImage, a: Adjust) {
  const base = Math.max(W / img.w, H / img.h);
  ctx.save();
  ctx.translate(W / 2 + a.x * W, H / 2 + a.y * H);
  ctx.rotate((a.rotate * Math.PI) / 180);
  ctx.scale(base * a.zoom, base * a.zoom);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img.src, -img.w / 2, -img.h / 2, img.w, img.h);
  ctx.restore();
}

export function drawImageAdjusted(ctx: Ctx, W: number, H: number, img: SourceImage, a: Adjust) {
  const blurPx = (a.blur * W) / 1080;
  const neutral = a.brightness === 100 && a.contrast === 100 && a.saturation === 100 && a.blur === 0;
  if (neutral) {
    drawTransformed(ctx, W, H, img, a);
    return;
  }
  if (canvasFilterSupported()) {
    ctx.save();
    ctx.filter = `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturation}%)${blurPx > 0 ? ` blur(${blurPx.toFixed(2)}px)` : ''}`;
    if (blurPx > 0) {
      // over-draw slightly so blurred edges don't fade to the background
      ctx.translate(W / 2, H / 2);
      ctx.scale(1 + (blurPx * 4) / W, 1 + (blurPx * 4) / H);
      ctx.translate(-W / 2, -H / 2);
    }
    drawTransformed(ctx, W, H, img, a);
    ctx.restore();
    return;
  }
  // Fallback (e.g. older Safari): blur by down/up-scaling, then per-pixel colour math.
  const tmp = document.createElement('canvas');
  if (blurPx > 0) {
    const f = 1 / (1 + blurPx / 2);
    tmp.width = Math.max(1, Math.round(W * f));
    tmp.height = Math.max(1, Math.round(H * f));
    drawTransformed(tmp.getContext('2d')!, tmp.width, tmp.height, img, a);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tmp, 0, 0, W, H);
  } else {
    drawTransformed(ctx, W, H, img, a);
  }
  const d = ctx.getImageData(0, 0, W, H);
  const p = d.data;
  const b = a.brightness / 100;
  const c = a.contrast / 100;
  const s = a.saturation / 100;
  for (let i = 0; i < p.length; i += 4) {
    let r = p[i] * b;
    let g = p[i + 1] * b;
    let bl = p[i + 2] * b;
    r = (r - 128) * c + 128;
    g = (g - 128) * c + 128;
    bl = (bl - 128) * c + 128;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    p[i] = l + (r - l) * s;
    p[i + 1] = l + (g - l) * s;
    p[i + 2] = l + (bl - l) * s;
  }
  ctx.putImageData(d, 0, 0);
}

/* ------------------------------------------------------------------ */
/* Clock                                                               */
/* ------------------------------------------------------------------ */
function textFill(ctx: Ctx, c: ClockOpts, y0: number, y1: number): string | CanvasGradient {
  const metal = c.color === 'gold' ? 'gold' : c.color === 'silver' ? 'silver' : null;
  if (metal) {
    const m = METALS[metal as MetalId];
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, m.c[0]);
    g.addColorStop(0.45, m.c[1]);
    g.addColorStop(0.55, m.c[2]);
    g.addColorStop(1, m.c[0]);
    return g;
  }
  if (c.color === 'purple') return '#A98BFA';
  if (c.color === 'custom') return c.custom;
  return '#FFFFFF';
}

export function formatClock(c: ClockOpts, now: Date) {
  const loc = c.locale === 'fa' ? 'fa-IR' : 'en-US';
  let time = new Intl.DateTimeFormat(loc, { hour: c.h24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !c.h24 }).format(now);
  // Drop AM/PM — lock screen style.
  if (!c.h24) time = time.replace(/\s?(AM|PM|ق\.ظ\.|ب\.ظ\.)/gi, '').trim();
  const date = new Intl.DateTimeFormat(c.locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now);
  return { time, date };
}

function drawClock(ctx: Ctx, W: number, H: number, c: ClockOpts, now: Date) {
  const f = FONTS[c.font];
  const { time, date } = formatClock(c, now);
  const cx = c.align === 'left' ? W * 0.08 : c.align === 'right' ? W * 0.92 : W / 2;
  // Side-aligned clocks are fitted into ~38% of the width so they stay clear of a centred zipper.
  const maxW = c.align === 'center' ? W * 0.86 : W * 0.31;
  ctx.font = `${f.weight} ${W * 0.22 * c.size}px ${f.family}`;
  const fit = Math.min(1, maxW / Math.max(1, ctx.measureText(time).width));
  const ts = W * 0.22 * c.size * fit;
  const ty = H * c.y;
  ctx.save();
  ctx.textAlign = c.align;
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'ltr';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = W * 0.02;
  ctx.shadowOffsetY = W * 0.004;

  let y = ty;
  if (c.date) {
    let ds = W * 0.045 * Math.sqrt(c.size);
    ctx.font = `500 ${ds}px ${f.family}`;
    const dw = ctx.measureText(date).width;
    if (dw > maxW) ds *= maxW / dw;
    ctx.font = `500 ${ds}px ${f.family}`;
    ctx.fillStyle = c.color === 'white' ? 'rgba(255,255,255,0.88)' : textFill(ctx, c, y - W * 0.05, y);
    ctx.fillText(date, cx, y - ts * 0.92);
  }
  ctx.font = `${f.weight} ${ts}px ${f.family}`;
  ctx.fillStyle = textFill(ctx, c, y - ts * 0.8, y);
  ctx.fillText(time, cx, y);
  if (c.text.trim()) {
    y += ts * 0.42;
    let xs = W * 0.042 * Math.sqrt(c.size);
    ctx.font = `600 ${xs}px ${f.family}`;
    const xw = ctx.measureText(c.text.trim().slice(0, 40)).width;
    if (xw > maxW) xs *= maxW / xw;
    ctx.font = `600 ${xs}px ${f.family}`;
    ctx.fillStyle = textFill(ctx, c, y - W * 0.05, y);
    const fa = /[؀-ۿ]/.test(c.text);
    ctx.direction = fa ? 'rtl' : 'ltr';
    ctx.fillText(c.text.trim().slice(0, 40), cx, y);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Cover                                                               */
/* ------------------------------------------------------------------ */
export function renderCover(ctx: Ctx, W: number, H: number, d: Design, img: SourceImage | null, now: Date) {
  const L = d.layers ?? DEFAULT_LAYERS;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const usePhoto = img && L.photo.visible && L.photo.opacity > 0;
  // background is always drawn first so transparent photos / zoomed-out photos sit on it
  if (d.art) drawArt(ctx, W, H, d.art);
  else getBackground(d.bg).draw(ctx, W, H);
  if (usePhoto) {
    if (L.photo.opacity < 100) {
      const t = document.createElement('canvas');
      t.width = W;
      t.height = H;
      drawImageAdjusted(t.getContext('2d')!, W, H, img!, d.adj);
      ctx.globalAlpha = L.photo.opacity / 100;
      ctx.drawImage(t, 0, 0);
      ctx.globalAlpha = 1;
    } else drawImageAdjusted(ctx, W, H, img!, d.adj);
  }

  if (d.adj.dim > 0) {
    ctx.fillStyle = `rgba(0,0,0,${d.adj.dim / 100})`;
    ctx.fillRect(0, 0, W, H);
  }
  // gentle vignette for depth
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);

  if (!L.clock.above) drawClockLayer(ctx, W, H, d, now);
  ctx.restore();
}

function drawClockLayer(ctx: Ctx, W: number, H: number, d: Design, now: Date) {
  const L = d.layers ?? DEFAULT_LAYERS;
  if (!d.clock.show || !L.clock.visible || L.clock.opacity <= 0) return;
  ctx.save();
  ctx.globalAlpha = L.clock.opacity / 100;
  drawClock(ctx, W, H, d.clock, now);
  ctx.restore();
}

/**
 * Compose the final image: cover (already rendered) + zipper + any layers that sit above it.
 * Used by the live preview, thumbnails, simulator and export, so they always match.
 */
export function compose(
  ctx: Ctx,
  W: number,
  H: number,
  d: Design,
  cover: HTMLCanvasElement,
  progress: number,
  reveal: HTMLCanvasElement | null,
  now: Date,
) {
  const L = d.layers ?? DEFAULT_LAYERS;
  if (L.zipper.visible) drawScene(ctx, W, H, cover, d.zipper, progress, reveal, L.zipper.opacity / 100);
  else ctx.drawImage(cover, 0, 0, W, H);
  if (L.clock.above) drawClockLayer(ctx, W, H, d, now);
}

/** One-shot render of a design to a canvas of any size. */
export function renderDesign(out: HTMLCanvasElement, d: Design, img: SourceImage | null, now = new Date()) {
  const W = out.width;
  const H = out.height;
  const cover = document.createElement('canvas');
  cover.width = W;
  cover.height = H;
  renderCover(cover.getContext('2d')!, W, H, d, img, now);
  compose(out.getContext('2d')!, W, H, d, cover, 0, null, now);
}

/** Generic "unlocked" home screen shown behind the zipper in simulations. */
export function renderHomeScreen(ctx: Ctx, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#1C1830');
  g.addColorStop(0.55, '#15151C');
  g.addColorStop(1, '#0B0B0F');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  radial(ctx, W * 0.8, H * 0.15, H * 0.4, '#8B5CF6', 0.35);
  const cols = 4;
  const pad = W * 0.09;
  const cell = (W - pad * 2) / cols;
  const icon = cell * 0.64;
  const accents = ['#8B5CF6', '#D4AF37', '#C0C0C0', '#2A2A35'];
  const r = rng(5);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `600 ${W * 0.05}px system-ui, sans-serif`;
  ctx.fillText('Unlocked', W / 2, H * 0.12);
  ctx.font = `400 ${W * 0.032}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('Simulation only', W / 2, H * 0.12 + W * 0.055);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < cols; col++) {
      const x = pad + col * cell + (cell - icon) / 2;
      const y = H * 0.2 + row * cell * 1.15;
      const a = accents[Math.floor(r() * accents.length)];
      const gg = ctx.createLinearGradient(x, y, x + icon, y + icon);
      gg.addColorStop(0, a);
      gg.addColorStop(1, '#15151C');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.roundRect(x, y, icon, icon, icon * 0.26);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      if (r() > 0.5) ctx.arc(x + icon / 2, y + icon / 2, icon * 0.18, 0, Math.PI * 2);
      else ctx.roundRect(x + icon * 0.32, y + icon * 0.32, icon * 0.36, icon * 0.36, icon * 0.08);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(x + icon * 0.15, y + icon + cell * 0.08, icon * 0.7, W * 0.008);
    }
  }
  // dock
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.roundRect(pad * 0.6, H * 0.86, W - pad * 1.2, cell * 1.05, cell * 0.35);
  ctx.fill();
}
