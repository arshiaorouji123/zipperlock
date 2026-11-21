/**
 * Zipper renderer — draws a realistic metallic zipper on a 2D canvas.
 *
 * Everything is resolution-independent: sizes are derived from the canvas
 * width, so the same options give the same look in the preview and in a
 * full-resolution export.
 *
 * Geometry is computed in a "frame" where the zipper always runs top → bottom.
 * Horizontal zippers are drawn by rotating that frame -90°.
 */

import * as S from './shapes';

export type MetalId =
  | 'gold'
  | 'silver'
  | 'rose'
  | 'black'
  | 'purple'
  | 'gunmetal'
  | 'white'
  | 'pink'
  | 'ruby'
  | 'emerald'
  | 'sapphire'
  | 'holo';
export type MetalChoice = MetalId | 'custom';
export type TeethId =
  | 'classic'
  | 'coil'
  | 'chunky'
  | 'minimal'
  | 'pixel'
  | 'pearl'
  | 'crystal'
  | 'heart'
  | 'star'
  | 'neon'
  | 'diamond'
  | 'chain'
  | 'bow'
  | 'clover'
  | 'wave'
  | 'flower'
  | 'bubble';
export type PullerId =
  | 'classic'
  | 'ring'
  | 'drop'
  | 'heart'
  | 'heartLock'
  | 'star'
  | 'paw'
  | 'ball'
  | 'crown'
  | 'gem'
  | 'diamond'
  | 'bolt'
  | 'flower'
  | 'skull'
  | 'butterfly'
  | 'bow'
  | 'padlock'
  | 'key'
  | 'moon'
  | 'teddy'
  | 'cross'
  | 'clover';
export type Orientation = 'vertical' | 'horizontal';

export interface ZipperOpts {
  metal: MetalChoice;
  /** base colour used when metal === 'custom' */
  customColor?: string;
  teeth: TeethId;
  puller: PullerId;
  /** 0.5 – 1.6, relative zipper size */
  size: number;
  /** 0.12 – 0.88, position across the screen */
  pos: number;
  /** 0.04 – 0.5, where the puller rests along the zipper */
  rest: number;
  orientation: Orientation;
  tape: boolean;
  tapeColor: string;
  /** 0.6 – 2, tape width relative to teeth */
  tapeWidth: number;
  /** 0 – 1.5, strength of drop shadows (default 1) */
  shadow?: number;
  /** 0 – 1.5, strength of metallic highlights (default 1) */
  gloss?: number;
  /** 0.6 – 1.6, puller scale (default 1) */
  pullerScale?: number;
  /** -35 – 35 degrees, puller swing (default 0) */
  swing?: number;
}

export interface Metal {
  name: string;
  /** highlight, light, base, dark */
  c: [string, string, string, string];
  edge: string;
}

export const METALS: Record<MetalId, Metal> = {
  gold: { name: 'Gold', c: ['#FFF4C4', '#EBCB63', '#D4AF37', '#7A5C0F'], edge: '#463409' },
  silver: { name: 'Silver', c: ['#FFFFFF', '#E1E1E6', '#C0C0C0', '#6A6A72'], edge: '#3E3E44' },
  rose: { name: 'Rose Gold', c: ['#FFE6DA', '#ECB39B', '#CB8A6E', '#784636'], edge: '#4A2A1F' },
  black: { name: 'Black Nickel', c: ['#9A9AA4', '#55555E', '#2E2E35', '#111115'], edge: '#050507' },
  purple: { name: 'Electric Purple', c: ['#ECE3FF', '#AF94FB', '#8B5CF6', '#46278F'], edge: '#26145A' },
  gunmetal: { name: 'Gunmetal', c: ['#D5DAE2', '#8A919C', '#5A606B', '#2A2E35'], edge: '#16181C' },
  white: { name: 'Pearl White', c: ['#FFFFFF', '#F7F5F0', '#E4E0D8', '#A7A29A'], edge: '#6F6B64' },
  pink: { name: 'Baby Pink', c: ['#FFF0F6', '#FFC2DD', '#F79AC0', '#B8577F'], edge: '#7A2F52' },
  ruby: { name: 'Ruby Red', c: ['#FFD3D3', '#F06A6A', '#C81D2E', '#6A0B14'], edge: '#3D050B' },
  emerald: { name: 'Emerald', c: ['#D6FFE9', '#5FD69A', '#14965A', '#08452A'], edge: '#032617' },
  sapphire: { name: 'Sapphire', c: ['#D9E8FF', '#6EA3F5', '#2563EB', '#0F2A6B'], edge: '#081638' },
  holo: { name: 'Holographic', c: ['#FFFFFF', '#9EF0FF', '#C7A2FF', '#FF8FD0'], edge: '#5E4E91' },
};

export const TEETH: Record<TeethId, { name: string; pitch: number; th: number; out: number; inn: number; r: number }> = {
  classic: { name: 'Classic metal', pitch: 0.6, th: 0.56, out: 0.82, inn: 0.24, r: 0.3 },
  coil: { name: 'Fine coil', pitch: 0.42, th: 0.64, out: 0.7, inn: 0.2, r: 0.5 },
  chunky: { name: 'Chunky', pitch: 0.74, th: 0.6, out: 0.88, inn: 0.27, r: 0.14 },
  minimal: { name: 'Minimal', pitch: 0.5, th: 0.32, out: 0.62, inn: 0.18, r: 0.5 },
  pixel: { name: 'Pixel', pitch: 0.7, th: 0.62, out: 0.8, inn: 0.26, r: 0 },
  pearl: { name: 'Pearl beads', pitch: 0.78, th: 0.9, out: 0.7, inn: 0.3, r: 0.5 },
  crystal: { name: 'Crystal', pitch: 0.82, th: 0.8, out: 0.86, inn: 0.3, r: 0 },
  heart: { name: 'Hearts', pitch: 0.95, th: 0.95, out: 0.8, inn: 0.35, r: 0 },
  star: { name: 'Stars', pitch: 0.95, th: 0.95, out: 0.8, inn: 0.35, r: 0 },
  neon: { name: 'Neon tube', pitch: 0.62, th: 0.5, out: 0.8, inn: 0.22, r: 0.5 },
  diamond: { name: 'Diamond gems', pitch: 0.86, th: 0.88, out: 0.84, inn: 0.32, r: 0 },
  chain: { name: 'Cuban chain', pitch: 0.8, th: 0.72, out: 0.85, inn: 0.28, r: 0.4 },
  bow: { name: 'Ribbon bows', pitch: 0.95, th: 0.9, out: 0.82, inn: 0.34, r: 0.2 },
  clover: { name: 'Four-leaf clovers', pitch: 0.95, th: 0.92, out: 0.82, inn: 0.35, r: 0 },
  wave: { name: 'Zigzag wave', pitch: 0.68, th: 0.65, out: 0.85, inn: 0.25, r: 0 },
  flower: { name: 'Floral petals', pitch: 0.92, th: 0.92, out: 0.82, inn: 0.34, r: 0 },
  bubble: { name: 'Bubble drops', pitch: 0.76, th: 0.86, out: 0.72, inn: 0.28, r: 0.5 },
};

export const PULLERS: Record<PullerId, string> = {
  classic: 'Classic tab',
  ring: 'Ring',
  drop: 'Teardrop',
  heart: 'Heart',
  heartLock: 'Heart Padlock',
  star: 'Star',
  paw: 'Paw',
  ball: 'Football',
  crown: 'Crown',
  gem: 'Gem',
  diamond: 'Diamond',
  bolt: 'Lightning',
  flower: 'Flower',
  skull: 'Skull',
  butterfly: 'Butterfly',
  bow: 'Ribbon Bow',
  padlock: 'Padlock',
  key: 'Vintage Key',
  moon: 'Crescent Moon',
  teddy: 'Teddy Bear',
  cross: 'Gothic Cross',
  clover: 'Lucky Clover',
};

export const DEFAULT_ZIPPER: ZipperOpts = {
  metal: 'gold',
  teeth: 'classic',
  puller: 'classic',
  size: 1,
  pos: 0.5,
  rest: 0.14,
  orientation: 'vertical',
  tape: true,
  tapeColor: '#15151C',
  tapeWidth: 1,
};

type Ctx = CanvasRenderingContext2D;

/* ------------------------------------------------------------------ */
/* Custom metals from any colour                                       */
/* ------------------------------------------------------------------ */
function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m.padEnd(6, '0').slice(0, 6), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}
const hsl = (h: number, s: number, l: number) => `hsl(${h.toFixed(1)} ${Math.max(0, Math.min(100, s)).toFixed(1)}% ${Math.max(0, Math.min(100, l)).toFixed(1)}%)`;

/** Build a metallic ramp (highlight → dark) from one base colour. */
export function metalFromColor(hex: string): Metal {
  const [h, s, l] = hexToHsl(hex);
  return {
    name: 'Custom',
    c: [hsl(h, s * 0.6, Math.min(96, l + 40)), hsl(h, s * 0.9, Math.min(85, l + 18)), hsl(h, s, l), hsl(h, s * 1.05, Math.max(8, l - 30))],
    edge: hsl(h, s, Math.max(4, l - 42)),
  };
}

export function getMetal(o: Pick<ZipperOpts, 'metal' | 'customColor'>): Metal {
  if (o.metal === 'custom') return metalFromColor(o.customColor ?? '#8B5CF6');
  return METALS[o.metal] ?? METALS.gold;
}
const metalKey = (o: Pick<ZipperOpts, 'metal' | 'customColor'>) => (o.metal === 'custom' ? `c${o.customColor}` : o.metal);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

/** Cylinder-like metallic gradient (dark edge → highlight → base → dark edge). */
function cylinder(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, m: Metal) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, m.c[3]);
  g.addColorStop(0.2, m.c[2]);
  g.addColorStop(0.4, m.c[0]);
  g.addColorStop(0.58, m.c[1]);
  g.addColorStop(0.82, m.c[2]);
  g.addColorStop(1, m.c[3]);
  return g;
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/** Base tooth width in px for a frame width. */
export function toothWidth(frameW: number, frameH: number, size: number) {
  return Math.min(frameW, frameH) * 0.062 * size;
}

/* ------------------------------------------------------------------ */
/* Tooth sprites (cached)                                              */
/* ------------------------------------------------------------------ */

const spriteCache = new Map<string, { c: HTMLCanvasElement; ox: number; oy: number }>();

function toothSprite(o: ZipperOpts, teeth: TeethId, tw: number, side: -1 | 1) {
  const key = `${metalKey(o)}|${teeth}|${tw.toFixed(2)}|${side}|${o.gloss ?? 1}|${o.shadow ?? 1}`;
  const hit = spriteCache.get(key);
  if (hit) return hit;
  if (spriteCache.size > 120) spriteCache.clear();

  const t = TEETH[teeth];
  const m = getMetal(o);
  const pitch = tw * t.pitch;
  const th = pitch * t.th;
  const out = tw * t.out;
  const inn = tw * t.inn;
  const pad = Math.ceil(tw * (teeth === 'neon' ? 0.7 : 0.35)) + 2;
  const c = makeCanvas(out + inn + pad * 2, th + pad * 2);
  const ctx = c.getContext('2d')!;
  // origin = point on the zipper centre line
  const ox = side === -1 ? pad + out : pad + inn;
  const oy = pad + th / 2;
  ctx.translate(ox, oy);
  if (side === 1) ctx.scale(-1, 1);

  const x = -out;
  const y = -th / 2;
  const w = out + inn;
  const r = th * t.r;

  drawToothShape(ctx, teeth, m, x, y, w, th, r, inn, o.gloss ?? 1, o.shadow ?? 1, tw);

  const entry = { c, ox, oy };
  spriteCache.set(key, entry);
  return entry;
}

function toothPath(teeth: TeethId, x: number, y: number, w: number, th: number, r: number, inn: number): Path2D {
  const headX = inn - th * 0.5;
  switch (teeth) {
    case 'pearl': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.12, w - th * 0.6, th * 0.24, th * 0.1));
      p.addPath(S.circle(inn - th * 0.5, 0, th * 0.5));
      return p;
    }
    case 'bubble': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.14, w - th * 0.55, th * 0.28, th * 0.1));
      p.addPath(S.circle(inn - th * 0.48, 0, th * 0.48));
      return p;
    }
    case 'heart': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.12, w - th * 0.6, th * 0.24, th * 0.1));
      // heart pointing toward the centre line
      const m = new DOMMatrix().translate(headX, 0).rotate(-90);
      p.addPath(S.heart(0, 0, th * 0.48), m);
      return p;
    }
    case 'diamond': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.12, w - th * 0.6, th * 0.24, th * 0.1));
      const m = new DOMMatrix().translate(headX, 0).rotate(-90);
      p.addPath(S.diamond(0, 0, th * 0.5), m);
      return p;
    }
    case 'chain': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.12, w - th * 0.5, th * 0.24, th * 0.1));
      p.addPath(S.ellipse(inn - th * 0.45, 0, th * 0.48, th * 0.38, Math.PI * 0.15));
      return p;
    }
    case 'bow': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.1, w - th * 0.6, th * 0.2, th * 0.1));
      const m = new DOMMatrix().translate(headX, 0).rotate(-90);
      p.addPath(S.bow(0, 0, th * 0.46), m);
      return p;
    }
    case 'clover': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.12, w - th * 0.6, th * 0.24, th * 0.1));
      p.addPath(S.clover(headX, 0, th * 0.46));
      return p;
    }
    case 'flower': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.12, w - th * 0.6, th * 0.24, th * 0.1));
      p.addPath(S.flower(headX, 0, th * 0.48, 5, 0.6));
      return p;
    }
    case 'wave': {
      const p = new Path2D();
      p.moveTo(x, -th * 0.45);
      p.lineTo(x + w * 0.4, -th * 0.45);
      p.lineTo(x + w, 0);
      p.lineTo(x + w * 0.4, th * 0.45);
      p.lineTo(x, th * 0.45);
      p.closePath();
      return p;
    }
    case 'star': {
      const p = new Path2D();
      p.addPath(S.roundRect(x, -th * 0.12, w - th * 0.6, th * 0.24, th * 0.1));
      p.addPath(S.star(headX, 0, th * 0.55, th * 0.24));
      return p;
    }
    case 'crystal': {
      const p = new Path2D();
      p.moveTo(x, -th * 0.22);
      p.lineTo(x + w * 0.55, -th * 0.5);
      p.lineTo(x + w, 0);
      p.lineTo(x + w * 0.55, th * 0.5);
      p.lineTo(x, th * 0.22);
      p.closePath();
      return p;
    }
    default:
      return S.roundRect(x, y, w, th, r);
  }
}

function drawToothShape(
  ctx: Ctx,
  teeth: TeethId,
  m: Metal,
  x: number,
  y: number,
  w: number,
  th: number,
  r: number,
  inn: number,
  gloss: number,
  shadow: number,
  tw: number,
) {
  const path = toothPath(teeth, x, y, w, th, r, inn);

  if (teeth === 'neon') {
    // glowing tube: coloured halo + bright core
    ctx.save();
    ctx.shadowColor = m.c[2];
    ctx.shadowBlur = tw * 0.65;
    ctx.fillStyle = m.c[1];
    ctx.fill(path);
    ctx.fill(path);
    ctx.restore();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill(S.roundRect(x + th * 0.2, -th * 0.1, w - th * 0.4, th * 0.2, th * 0.1));
    return;
  }

  // Natural subtle shadow under tooth
  if (shadow > 0) {
    ctx.save();
    ctx.translate(th * 0.03, th * 0.08);
    ctx.fillStyle = `rgba(0,0,0,${Math.min(0.4, 0.25 * shadow)})`;
    ctx.fill(path);
    ctx.restore();
  }

  if (teeth === 'pixel') {
    // flat stepped shading, no curves
    const steps = [m.c[0], m.c[1], m.c[2], m.c[3]];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = steps[i];
      ctx.fillRect(x, y + (th * i) / 4, w, th / 4 + 0.5);
    }
    ctx.strokeStyle = m.edge;
    ctx.lineWidth = Math.max(0.8, tw * 0.05);
    ctx.strokeRect(x, y, w, th);
    return;
  }

  const crystal = teeth === 'crystal' || teeth === 'diamond';
  const g = ctx.createLinearGradient(0, -th / 2, 0, th / 2);
  g.addColorStop(0, m.c[0]);
  g.addColorStop(0.28, m.c[1]);
  g.addColorStop(0.68, m.c[2]);
  g.addColorStop(1, m.c[3]);
  ctx.save();
  if (crystal) ctx.globalAlpha = 0.9;
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.restore();

  if (teeth === 'pearl' || teeth === 'bubble') {
    const cx = inn - th * 0.5;
    const rg = ctx.createRadialGradient(cx - th * 0.18, -th * 0.18, th * 0.04, cx, 0, th * 0.55);
    rg.addColorStop(0, `rgba(255,255,255,${0.95 * Math.min(1, gloss)})`);
    rg.addColorStop(0.45, 'rgba(255,255,255,0.18)');
    rg.addColorStop(0.8, 'rgba(0,0,0,0.1)');
    rg.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = rg;
    ctx.fill(S.circle(cx, 0, th * 0.5));
  } else if (crystal) {
    // faceted cut
    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${0.85 * Math.min(1.2, gloss)})`;
    ctx.lineWidth = Math.max(0.6, tw * 0.03);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.55, -th * 0.5);
    ctx.lineTo(x + w * 0.35, 0);
    ctx.lineTo(x + w * 0.55, th * 0.5);
    ctx.moveTo(x + w * 0.35, 0);
    ctx.lineTo(x + w, 0);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,255,255,${0.45 * gloss})`;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.55, -th * 0.5);
    ctx.lineTo(x + w, 0);
    ctx.lineTo(x + w * 0.35, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (teeth === 'chain') {
    const cx = inn - th * 0.45;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.ellipse(cx, 0, th * 0.24, th * 0.17, Math.PI * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = Math.max(0.5, tw * 0.025);
    ctx.stroke();
    ctx.restore();
  } else if (teeth === 'flower') {
    const cx = inn - th * 0.5;
    ctx.save();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(cx, 0, th * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // 3D depth toward the tape side
    const g2 = ctx.createLinearGradient(x, 0, x + w, 0);
    g2.addColorStop(0, 'rgba(0,0,0,0.42)');
    g2.addColorStop(0.38, 'rgba(0,0,0,0)');
    g2.addColorStop(0.85, 'rgba(255,255,255,0.14)');
    g2.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = g2;
    ctx.fill(path);
    if (teeth === 'classic' || teeth === 'chunky') {
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.beginPath();
      ctx.ellipse(inn * 0.05, th * 0.08, th * 0.32, th * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Specular top edge bevel
  if (gloss > 0) {
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.95, 0.65 * gloss)})`;
    const hx = x + Math.max(r, th * 0.15);
    ctx.beginPath();
    ctx.roundRect(hx, -th / 2 + th * 0.08, Math.max(1, w - (hx - x) * 1.8), th * 0.18, th * 0.08);
    ctx.fill();
    ctx.restore();
  }

  // 3D edge stroke
  ctx.save();
  ctx.strokeStyle = m.edge;
  ctx.globalAlpha = crystal ? 0.6 : 0.85;
  ctx.lineWidth = Math.max(0.7, tw * 0.03);
  ctx.stroke(path);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Opening curve                                                       */
/* ------------------------------------------------------------------ */

/** Half-spread at distance d above the slider. */
function spreadFn(d: number, L: number) {
  if (d <= 0) return 0;
  return (0.5 * d * d) / (d + L);
}
function spreadSlope(d: number, L: number) {
  if (d <= 0) return 0;
  return (0.5 * d * (d + 2 * L)) / ((d + L) * (d + L));
}

export interface Layout {
  FW: number;
  FH: number;
  cx: number;
  tw: number;
  restY: number;
  travel: number;
}

export function layout(W: number, H: number, o: ZipperOpts): Layout {
  const horiz = o.orientation === 'horizontal';
  const FW = horiz ? H : W;
  const FH = horiz ? W : H;
  const tw = toothWidth(FW, FH, o.size);
  // In horizontal mode, frame x maps to screen (H - y), so flip pos to keep "0 = top".
  const p = horiz ? 1 - o.pos : o.pos;
  const cx = FW * p;
  const restY = FH * o.rest;
  const travel = FH * 0.97 - restY;
  return { FW, FH, cx, tw, restY, travel };
}

/** Screen point → frame point. */
export function toFrame(W: number, H: number, o: ZipperOpts, x: number, y: number) {
  if (o.orientation === 'horizontal') return { fx: H - y, fy: x };
  return { fx: x, fy: y };
}

/** Is the screen point on the slider / puller? */
export function hitPuller(W: number, H: number, o: ZipperOpts, progress: number, x: number, y: number) {
  const L = layout(W, H, o);
  const { fx, fy } = toFrame(W, H, o, x, y);
  const sy = L.restY + progress * L.travel;
  const ps = o.pullerScale ?? 1;
  const reach = 2 + 5 * ps;
  return Math.abs(fx - L.cx) < L.tw * 2 * Math.max(1, ps) && fy > sy - L.tw * 2.2 && fy < sy + L.tw * reach;
}

/** Progress (0–1) for a frame y while dragging, given the grab offset. */
export function progressFromFrameY(W: number, H: number, o: ZipperOpts, fy: number, grab: number) {
  const L = layout(W, H, o);
  return Math.max(0, Math.min(1, (fy - grab - L.restY) / L.travel));
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

let rotScratchA: HTMLCanvasElement | null = null;
let rotScratchB: HTMLCanvasElement | null = null;

function toFrameCanvas(src: HTMLCanvasElement, W: number, H: number, which: 'a' | 'b') {
  let c = which === 'a' ? rotScratchA : rotScratchB;
  if (!c) {
    c = makeCanvas(H, W);
    if (which === 'a') rotScratchA = c;
    else rotScratchB = c;
  }
  if (c.width !== H || c.height !== W) {
    c.width = H;
    c.height = W;
  }
  const x = c.getContext('2d')!;
  x.setTransform(0, 1, -1, 0, H, 0);
  x.drawImage(src, 0, 0);
  x.setTransform(1, 0, 0, 1, 0, 0);
  return c;
}

/**
 * Draw the full zipper scene.
 * @param cover   the wallpaper (W×H) that the zipper "closes"
 * @param reveal  what is behind it (W×H) — shown when opened; may be null
 * @param progress 0 = closed at rest position, 1 = fully pulled
 */
export function drawScene(
  ctx: Ctx,
  W: number,
  H: number,
  cover: HTMLCanvasElement,
  o: ZipperOpts,
  progress: number,
  reveal: HTMLCanvasElement | null,
  alpha = 1,
) {
  const horiz = o.orientation === 'horizontal';
  const L = layout(W, H, o);
  const { FW, FH, cx, tw } = L;
  const coverF = horiz ? toFrameCanvas(cover, W, H, 'a') : cover;
  const revealF = reveal ? (horiz ? toFrameCanvas(reveal, W, H, 'b') : reveal) : null;

  ctx.save();
  if (horiz) {
    ctx.translate(0, H);
    ctx.rotate(-Math.PI / 2);
  }

  const sy = L.restY + progress * L.travel;
  const a = Math.min(1, (progress * L.travel) / (FH * 0.06)); // ease-in of opening
  const Lc = tw * 7;
  const sp = (y: number) => spreadFn(sy - y, Lc) * a;
  const slope = (y: number) => spreadSlope(sy - y, Lc) * a;
  const open = a > 0.001;

  const t = TEETH[o.teeth];
  const out = tw * t.out;
  const tapeW = tw * 1.15 * o.tapeWidth;

  /* --- background + cover halves --- */
  if (!open) {
    ctx.drawImage(coverF, 0, 0, FW, FH);
  } else {
    if (revealF) ctx.drawImage(revealF, 0, 0, FW, FH);
    else {
      ctx.fillStyle = '#0B0B0F';
      ctx.fillRect(0, 0, FW, FH);
    }
    const sx = coverF.width / FW;
    const syc = coverF.height / FH;
    const step = Math.max(2, Math.round(FH / 320));
    const leftW = cx;
    const rightW = FW - cx;
    for (let y = 0; y < FH; y += step) {
      const h = Math.min(step + 1, FH - y);
      const s = sp(y + step / 2);
      if (s <= 0.01) {
        ctx.drawImage(coverF, 0, y * syc, coverF.width, h * syc, 0, y, FW, h);
        continue;
      }
      if (leftW - s > 0)
        ctx.drawImage(coverF, s * sx, y * syc, (leftW - s) * sx, h * syc, 0, y, leftW - s, h);
      if (rightW - s > 0)
        ctx.drawImage(coverF, cx * sx, y * syc, (rightW - s) * sx, h * syc, cx + s, y, rightW - s, h);
    }
  }

  /* --- tapes --- */
  ctx.globalAlpha = alpha;
  const N = 90;
  const edgePts = (side: -1 | 1, offset: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const y = (FH * i) / N;
      pts.push([cx + side * (sp(y) + offset), y]);
    }
    return pts;
  };
  const drawTape = (side: -1 | 1) => {
    const inner = edgePts(side, out * 0.3);
    const outer = edgePts(side, out * 0.3 + tapeW);
    
    // 1. Clean subtle fabric shadow onto the wallpaper
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = tw * 0.35;
    ctx.shadowOffsetX = side * tw * 0.05;
    ctx.shadowOffsetY = tw * 0.03;
    ctx.beginPath();
    inner.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = outer.length - 1; i >= 0; i--) ctx.lineTo(outer[i][0], outer[i][1]);
    ctx.closePath();
    ctx.fillStyle = o.tapeColor;
    ctx.fill();
    ctx.restore();

    // 2. Realistic fabric micro-weave texture
    ctx.save();
    ctx.lineWidth = Math.max(0.6, tw * 0.035);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    edgePts(side, out * 0.3 + tapeW * 0.18).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    edgePts(side, out * 0.3 + tapeW * 0.42).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();

    // 3. Raised fabric piping bead (the 3D cord where teeth clamp)
    const cordPts = edgePts(side, out * 0.3 + tw * 0.08);
    ctx.lineWidth = Math.max(1.6, tw * 0.13);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; // shadow under bead
    ctx.beginPath();
    cordPts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.lineWidth = Math.max(0.8, tw * 0.07);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; // bead highlight
    ctx.beginPath();
    cordPts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();

    // 4. Outer edge fold
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = Math.max(0.8, tw * 0.04);
    ctx.beginPath();
    outer.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();

    // 5. Crisp thread stitching with thread shadow
    const stitchPts = edgePts(side, out * 0.3 + tapeW * 0.72);
    ctx.setLineDash([tw * 0.28, tw * 0.18]);
    ctx.lineWidth = Math.max(1.1, tw * 0.055);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    stitchPts.forEach(([x, y], i) => (i ? ctx.lineTo(x + 0.5, y + 0.5) : ctx.moveTo(x + 0.5, y + 0.5)));
    ctx.stroke();

    const stitchColor = o.metal === 'gold' ? '#FFE39B' : o.metal === 'rose' ? '#FFD4C2' : o.metal === 'pink' ? '#FFC0DD' : '#F5F5FA';
    ctx.strokeStyle = stitchColor;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    stitchPts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  if (o.tape) {
    drawTape(-1);
    drawTape(1);
  }

  /* --- teeth --- */
  const pitch = tw * t.pitch;
  const spL = toothSprite(o, o.teeth, tw, -1);
  const spR = toothSprite(o, o.teeth, tw, 1);
  const drawTooth = (spr: typeof spL, x: number, y: number, ang: number) => {
    if (ang === 0) {
      ctx.drawImage(spr.c, x - spr.ox, y - spr.oy);
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.drawImage(spr.c, -spr.ox, -spr.oy);
    ctx.restore();
  };
  const startY = -pitch + ((FH / 2) % pitch);
  for (let y = startY; y < FH + pitch; y += pitch) {
    const yl = y;
    const yr = y + pitch / 2;
    const sL = sp(yl);
    const sR = sp(yr);
    drawTooth(spL, cx - sL, yl, sL > 0 ? -Math.atan(slope(yl)) : 0);
    drawTooth(spR, cx + sR, yr, sR > 0 ? Math.atan(slope(yr)) : 0);
  }

  /* --- slider + puller --- */
  drawSlider(ctx, cx, sy, tw, o);

  ctx.restore();
}

function drawSlider(ctx: Ctx, cx: number, sy: number, tw: number, o: ZipperOpts) {
  const m = getMetal(o);
  const sw = tw * 2.6;
  const sh = tw * 3.1;
  const top = sy - sh * 0.55;
  const bot = sy + sh * 0.45;

  const sh0 = o.shadow ?? 1;
  ctx.save();
  // Clean natural slider shadow
  ctx.shadowColor = `rgba(0,0,0,${Math.min(0.45, 0.3 * sh0)})`;
  ctx.shadowBlur = tw * 0.45 * Math.max(0.2, sh0);
  ctx.shadowOffsetY = tw * 0.12 * sh0;

  // Realistic heavy slider body with contoured channel shoulders
  const body = new Path2D();
  const r = tw * 0.35;
  // Top left shoulder horn
  body.moveTo(cx - sw / 2 + r, top);
  body.lineTo(cx - sw * 0.15, top);
  body.lineTo(cx, top + sh * 0.08); // center groove notch
  body.lineTo(cx + sw * 0.15, top);
  body.lineTo(cx + sw / 2 - r, top);
  // Right side flange and waist
  body.quadraticCurveTo(cx + sw / 2, top, cx + sw / 2, top + r);
  body.lineTo(cx + sw * 0.38, bot - r * 1.2);
  body.quadraticCurveTo(cx + sw * 0.34, bot, cx + sw * 0.34 - r, bot);
  // Bottom exit
  body.lineTo(cx - sw * 0.34 + r, bot);
  body.quadraticCurveTo(cx - sw * 0.34, bot, cx - sw * 0.38, bot - r * 1.2);
  // Left side flange
  body.lineTo(cx - sw / 2, top + r);
  body.quadraticCurveTo(cx - sw / 2, top, cx - sw / 2 + r, top);
  body.closePath();

  ctx.fillStyle = cylinder(ctx, cx - sw / 2, 0, cx + sw / 2, 0, m);
  ctx.fill(body);
  ctx.restore();

  // Internal teeth guide channels (side indentations)
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(cx - sw * 0.46, top + sh * 0.2, sw * 0.12, sh * 0.42);
  ctx.fillRect(cx + sw * 0.34, top + sh * 0.2, sw * 0.12, sh * 0.42);
  ctx.restore();

  // Vertical light reflection and specular bevel
  ctx.save();
  const vg = ctx.createLinearGradient(0, top, 0, bot);
  vg.addColorStop(0, `rgba(255,255,255,${Math.min(0.85, 0.45 * (o.gloss ?? 1))})`);
  vg.addColorStop(0.2, 'rgba(255,255,255,0.08)');
  vg.addColorStop(0.5, 'rgba(0,0,0,0)');
  vg.addColorStop(0.8, 'rgba(255,255,255,0.12)');
  vg.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vg;
  ctx.fill(body);
  ctx.strokeStyle = m.edge;
  ctx.lineWidth = Math.max(0.8, tw * 0.04);
  ctx.stroke(body);
  ctx.restore();

  // Heavy 3D raised puller bridge (bail)
  const bridgeW = tw * 0.88;
  const bridgeH = tw * 1.25;
  const bridgeY = sy - bridgeH * 0.4;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = tw * 0.35;
  ctx.shadowOffsetY = tw * 0.15;
  ctx.fillStyle = cylinder(ctx, cx - bridgeW / 2, 0, cx + bridgeW / 2, 0, m);
  ctx.beginPath();
  rr(ctx, cx - bridgeW / 2, bridgeY, bridgeW, bridgeH, tw * 0.28);
  ctx.fill();
  ctx.restore();

  // Bridge highlight line & inner loop cutout
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = Math.max(0.6, tw * 0.035);
  ctx.beginPath();
  ctx.moveTo(cx - bridgeW * 0.35, bridgeY + tw * 0.15);
  ctx.lineTo(cx + bridgeW * 0.35, bridgeY + tw * 0.15);
  ctx.stroke();

  // Hole in bridge for the puller jump ring
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.beginPath();
  ctx.ellipse(cx, bridgeY + bridgeH * 0.58, tw * 0.22, tw * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Heavy metallic jump ring connecting bridge to puller tab
  const ringY = bridgeY + bridgeH * 0.65;
  ctx.save();
  ctx.lineWidth = Math.max(1.8, tw * 0.18);
  ctx.strokeStyle = cylinder(ctx, cx - tw * 0.35, 0, cx + tw * 0.35, 0, m);
  ctx.beginPath();
  ctx.ellipse(cx, ringY, tw * 0.26, tw * 0.32, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawPuller(ctx, cx, ringY + tw * 0.35, tw, o);
}

function drawPuller(ctx: Ctx, cx: number, py: number, tw: number, o: ZipperOpts) {
  const ps = o.pullerScale ?? 1;
  const sw = ((o.swing ?? 0) * Math.PI) / 180;
  ctx.save();
  ctx.translate(cx, py);
  ctx.rotate(sw);
  ctx.scale(ps, ps);
  ctx.translate(-cx, -py);
  drawPullerShape(ctx, cx, py, tw, o);
  ctx.restore();
}

function drawPullerShape(ctx: Ctx, cx: number, py: number, tw: number, o: ZipperOpts) {
  const m = getMetal(o);
  const shd = o.shadow ?? 1;
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${Math.min(0.45, 0.3 * shd)})`;
  ctx.shadowBlur = tw * 0.45 * Math.max(0.2, shd);
  ctx.shadowOffsetY = tw * 0.12 * shd;
  ctx.shadowOffsetX = 0;

  if (!['classic', 'ring', 'drop'].includes(o.puller)) {
    // connector link
    ctx.fillStyle = cylinder(ctx, cx - tw * 0.3, 0, cx + tw * 0.3, 0, m);
    ctx.beginPath();
    rr(ctx, cx - tw * 0.28, py - tw * 0.1, tw * 0.56, tw * 1.5, tw * 0.26);
    ctx.fill();
    ctx.restore();
    const R = tw * 1.55;
    const cy = py + tw * 1.25 + R;
    let path: Path2D;
    switch (o.puller) {
      case 'heart':
        path = S.heart(cx, cy - R * 0.1, R * 1.05);
        break;
      case 'heartLock':
        path = S.heartLock(cx, cy, R * 1.08);
        break;
      case 'butterfly':
        path = S.butterfly(cx, cy, R * 1.15);
        break;
      case 'diamond':
        path = S.diamond(cx, cy, R * 1.1);
        break;
      case 'bow':
        path = S.bow(cx, cy, R * 1.15);
        break;
      case 'padlock':
        path = S.padlock(cx, cy, R * 1.05);
        break;
      case 'key':
        path = S.key(cx, cy, R * 1.25);
        break;
      case 'moon':
        path = S.moon(cx, cy, R * 1.05);
        path.addPath(S.star(cx + R * 0.35, cy, R * 0.35, R * 0.16));
        break;
      case 'teddy':
        path = S.teddy(cx, cy, R * 1.05);
        break;
      case 'cross':
        path = S.cross(cx, cy, R * 1.15);
        break;
      case 'clover':
        path = S.clover(cx, cy, R * 1.08);
        break;
      case 'star':
        path = S.star(cx, cy, R * 1.1, R * 0.5);
        break;
      case 'paw':
        path = S.paw(cx, cy, R * 0.95);
        break;
      case 'crown':
        path = S.crown(cx, cy, R * 0.95);
        break;
      case 'gem':
        path = S.gem(cx, cy, R * 1.05);
        break;
      case 'bolt':
        path = S.bolt(cx, cy, R * 1.15);
        break;
      case 'flower':
        path = S.flower(cx, cy, R * 1.05, 6, 0.62);
        path.addPath(S.circle(cx, cy, R * 0.35));
        break;
      case 'skull':
        path = S.skull(cx, cy, R);
        break;
      default:
        path = S.circle(cx, cy, R);
    }
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${Math.min(0.45, 0.3 * shd)})`;
    ctx.shadowBlur = tw * 0.45 * Math.max(0.2, shd);
    ctx.shadowOffsetY = tw * 0.12 * shd;
    if (o.puller === 'ball') {
      const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.7, '#E6E6EA');
      g.addColorStop(1, '#9A9AA2');
      ctx.fillStyle = g;
      ctx.fill(path);
      ctx.restore();
      ctx.save();
      ctx.clip(path);
      ctx.fillStyle = '#16161C';
      ctx.fill(S.soccerPatches(cx, cy, R));
      ctx.restore();
    } else {
      ctx.fillStyle = cylinder(ctx, cx - R, 0, cx + R, 0, m);
      ctx.fill(path, 'evenodd');
      ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle = o.puller === 'ball' ? '#3a3a44' : m.edge;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = Math.max(0.8, tw * 0.045);
    ctx.stroke(path);
    // highlight
    ctx.globalAlpha = Math.min(0.8, 0.45 * (o.gloss ?? 1));
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(0.6, tw * 0.08);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.62, Math.PI * 1.12, Math.PI * 1.45);
    ctx.stroke();
    if (o.puller === 'crown') {
      ctx.globalAlpha = 1;
      // Velvet cap inside crown
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.arc(cx, cy + R * 0.15, R * 0.55, Math.PI, 0, false);
      ctx.fill();
      // Center ruby gem
      ctx.fillStyle = '#E11D48';
      ctx.fill(S.gem(cx, cy + R * 0.22, R * 0.25));
      // Sapphire side gems
      ctx.fillStyle = '#2563EB';
      ctx.fill(S.circle(cx - R * 0.55, cy + R * 0.26, R * 0.14));
      ctx.fill(S.circle(cx + R * 0.55, cy + R * 0.26, R * 0.14));
      // Pearl balls on crown peaks
      ctx.fillStyle = '#FFFFFF';
      ctx.fill(S.circle(cx, cy - R * 0.72, R * 0.1));
      ctx.fill(S.circle(cx - R * 0.98, cy - R * 0.28, R * 0.09));
      ctx.fill(S.circle(cx + R * 0.98, cy - R * 0.28, R * 0.09));
    } else if (o.puller === 'heartLock') {
      // Inset gemstone heart in center of heart padlock
      ctx.save();
      const hg = ctx.createRadialGradient(cx - R * 0.15, cy - R * 0.05, R * 0.05, cx, cy + R * 0.1, R * 0.55);
      hg.addColorStop(0, '#FF4B72');
      hg.addColorStop(0.6, '#BE123C');
      hg.addColorStop(1, '#67061C');
      ctx.fillStyle = hg;
      ctx.fill(S.heart(cx, cy + R * 0.15, R * 0.55));
      // Diamond pave sparkles around heart
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const px = cx + Math.cos(ang) * R * 0.72;
        const py = cy + R * 0.15 + Math.sin(ang) * R * 0.55;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, R * 0.05), 0, Math.PI * 2);
        ctx.fill();
      }
      // Keyhole
      ctx.fillStyle = '#0F0306';
      ctx.beginPath();
      ctx.arc(cx, cy + R * 0.12, R * 0.08, 0, Math.PI * 2);
      ctx.rect(cx - R * 0.04, cy + R * 0.12, R * 0.08, R * 0.16);
      ctx.fill();
      ctx.restore();
    } else if (o.puller === 'diamond') {
      ctx.save();
      // Internal facet fills with brilliance
      ctx.fillStyle = `rgba(255,255,255,${0.35 * (o.gloss ?? 1)})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - R * 0.75);
      ctx.lineTo(cx + R * 0.6, cy - R * 0.2);
      ctx.lineTo(cx, cy + R);
      ctx.closePath();
      ctx.fill();
      // Crisp facet lines
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * (o.gloss ?? 1)})`;
      ctx.lineWidth = Math.max(0.7, tw * 0.04);
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.6, cy - R * 0.2);
      ctx.lineTo(cx, cy + R);
      ctx.lineTo(cx + R * 0.6, cy - R * 0.2);
      ctx.moveTo(cx - R * 0.6, cy - R * 0.2);
      ctx.lineTo(cx + R * 0.6, cy - R * 0.2);
      ctx.moveTo(cx, cy - R * 0.75);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();
      // Sparkle star at facet apex
      ctx.fillStyle = '#FFFFFF';
      ctx.fill(S.star(cx - R * 0.2, cy - R * 0.2, R * 0.25, R * 0.08, 4));
      ctx.restore();
    } else if (o.puller === 'teddy') {
      ctx.save();
      // Muzzle
      ctx.fillStyle = m.c[0];
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 0.2, R * 0.35, R * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
      // Button eyes
      ctx.fillStyle = m.edge;
      ctx.beginPath();
      ctx.arc(cx - R * 0.28, cy - R * 0.05, R * 0.09, 0, Math.PI * 2);
      ctx.arc(cx + R * 0.28, cy - R * 0.05, R * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - R * 0.3, cy - R * 0.08, R * 0.03, 0, Math.PI * 2);
      ctx.arc(cx + R * 0.26, cy - R * 0.08, R * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.fillStyle = m.edge;
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 0.12, R * 0.12, R * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (o.puller === 'butterfly') {
      ctx.save();
      // Crystal wing inlays
      ctx.fillStyle = `rgba(255,255,255,${0.25 * (o.gloss ?? 1)})`;
      ctx.beginPath();
      ctx.ellipse(cx - R * 0.5, cy - R * 0.25, R * 0.35, R * 0.22, -0.3, 0, Math.PI * 2);
      ctx.ellipse(cx + R * 0.5, cy - R * 0.25, R * 0.35, R * 0.22, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${0.65 * (o.gloss ?? 1)})`;
      ctx.lineWidth = Math.max(0.6, tw * 0.035);
      ctx.stroke();
      // Center jewel body
      ctx.fillStyle = '#67E8F9';
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * 0.08, R * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (o.puller === 'skull') {
      ctx.save();
      // Deep dark eye sockets
      ctx.fillStyle = '#0A0A0F';
      ctx.beginPath();
      ctx.ellipse(cx - R * 0.34, cy - R * 0.1, R * 0.22, R * 0.26, 0.1, 0, Math.PI * 2);
      ctx.ellipse(cx + R * 0.34, cy - R * 0.1, R * 0.22, R * 0.26, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // Nasal cavity
      ctx.beginPath();
      ctx.moveTo(cx, cy + R * 0.18);
      ctx.lineTo(cx - R * 0.08, cy + R * 0.36);
      ctx.lineTo(cx + R * 0.08, cy + R * 0.36);
      ctx.closePath();
      ctx.fill();
      // Teeth lines
      ctx.strokeStyle = m.edge;
      ctx.lineWidth = Math.max(0.8, tw * 0.04);
      for (let t = -2; t <= 2; t++) {
        ctx.beginPath();
        ctx.moveTo(cx + t * R * 0.14, cy + R * 0.55);
        ctx.lineTo(cx + t * R * 0.14, cy + R * 0.82);
        ctx.stroke();
      }
      ctx.restore();
    } else if (o.puller === 'clover') {
      ctx.save();
      // Golden leaf veins
      ctx.strokeStyle = `rgba(255,255,255,${0.65 * (o.gloss ?? 1)})`;
      ctx.lineWidth = Math.max(0.6, tw * 0.035);
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.65, cy);
      ctx.lineTo(cx + R * 0.65, cy);
      ctx.moveTo(cx, cy - R * 0.65);
      ctx.lineTo(cx, cy + R * 0.65);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    return;
  }

  if (o.puller === 'classic') {
    const pw = tw * 1.55;
    const pl = tw * 5.4;
    const p = new Path2D();
    const r = tw * 0.4;
    const x0 = cx - pw / 2;
    p.moveTo(cx - pw * 0.36 + r, py);
    p.lineTo(cx + pw * 0.36 - r, py);
    p.quadraticCurveTo(cx + pw * 0.36, py, cx + pw * 0.38, py + r);
    p.lineTo(x0 + pw, py + pl - r * 1.6);
    p.quadraticCurveTo(x0 + pw, py + pl, x0 + pw - r * 1.6, py + pl);
    p.lineTo(x0 + r * 1.6, py + pl);
    p.quadraticCurveTo(x0, py + pl, x0, py + pl - r * 1.6);
    p.lineTo(cx - pw * 0.38, py + r);
    p.quadraticCurveTo(cx - pw * 0.36, py, cx - pw * 0.36 + r, py);
    p.closePath();
    // hole
    p.moveTo(cx - pw * 0.22, py + pl * 0.72);
    rrPath(p, cx - pw * 0.22, py + pl * 0.68, pw * 0.44, pl * 0.17, pw * 0.2);
    ctx.fillStyle = cylinder(ctx, x0, 0, x0 + pw, 0, m);
    ctx.fill(p, 'evenodd');
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = m.edge;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = Math.max(0.8, tw * 0.04);
    ctx.stroke(p);
    // embossed inner border
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(0.5, tw * 0.03);
    ctx.beginPath();
    rr(ctx, cx - pw * 0.3, py + pl * 0.1, pw * 0.6, pl * 0.5, pw * 0.15);
    ctx.stroke();
    ctx.restore();
  } else if (o.puller === 'ring') {
    const R = tw * 1.45;
    const ringY = py + tw * 1.3 + R;
    // connector
    ctx.fillStyle = cylinder(ctx, cx - tw * 0.35, 0, cx + tw * 0.35, 0, m);
    ctx.beginPath();
    rr(ctx, cx - tw * 0.32, py - tw * 0.1, tw * 0.64, tw * 1.6, tw * 0.3);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = tw * 0.45;
    ctx.shadowOffsetY = tw * 0.12;
    const ring = new Path2D();
    ring.arc(cx, ringY, R, 0, Math.PI * 2);
    ring.arc(cx, ringY, R * 0.62, 0, Math.PI * 2, true);
    const g = ctx.createLinearGradient(cx - R, ringY - R, cx + R, ringY + R);
    g.addColorStop(0, m.c[0]);
    g.addColorStop(0.3, m.c[1]);
    g.addColorStop(0.55, m.c[3]);
    g.addColorStop(0.8, m.c[2]);
    g.addColorStop(1, m.c[0]);
    ctx.fillStyle = g;
    ctx.fill(ring, 'evenodd');
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = m.edge;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = Math.max(0.8, tw * 0.04);
    ctx.stroke(ring);
    ctx.restore();
  } else {
    // teardrop
    const R = tw * 1.25;
    const tipY = py;
    const cY = py + tw * 4.1;
    const p = new Path2D();
    p.moveTo(cx, tipY);
    p.bezierCurveTo(cx + R * 0.35, tipY + tw * 1.2, cx + R * 1.05, cY - R * 1.1, cx + R, cY);
    p.arc(cx, cY, R, 0, Math.PI, false);
    p.bezierCurveTo(cx - R * 1.05, cY - R * 1.1, cx - R * 0.35, tipY + tw * 1.2, cx, tipY);
    p.closePath();
    p.moveTo(cx + R * 0.4, cY + R * 0.05);
    p.arc(cx, cY + R * 0.05, R * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = cylinder(ctx, cx - R, 0, cx + R, 0, m);
    ctx.fill(p, 'evenodd');
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = m.edge;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = Math.max(0.8, tw * 0.04);
    ctx.stroke(p);
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cY, R * 0.78, Math.PI * 1.1, Math.PI * 1.55);
    ctx.stroke();
    ctx.restore();
  }
}

function rrPath(p: Path2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  p.moveTo(x + rad, y);
  p.arcTo(x + w, y, x + w, y + h, rad);
  p.arcTo(x + w, y + h, x, y + h, rad);
  p.arcTo(x, y + h, x, y, rad);
  p.arcTo(x, y, x + w, y, rad);
  p.closePath();
}
