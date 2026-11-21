/**
 * Procedural artwork engine — original vector illustrations drawn on canvas.
 *
 * An ArtSpec = a background scene + up to 3 motif layers. Every colour, count, size
 * and layout is a parameter, so each design in the library stays fully customisable
 * in the Studio and renders sharply at any export resolution.
 */
import * as S from './shapes';

type Ctx = CanvasRenderingContext2D;
type Rnd = () => number;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type BgKind =
  | 'linear'
  | 'radial'
  | 'sunset'
  | 'night'
  | 'galaxy'
  | 'stadium'
  | 'grid'
  | 'stripes'
  | 'polka'
  | 'checker'
  | 'bokeh'
  | 'marble'
  | 'watercolor'
  | 'waves'
  | 'mountains'
  | 'meadow'
  | 'snow'
  | 'holo'
  | 'fire'
  | 'circuit'
  | 'halftone'
  | 'jersey';

export type LayoutId = 'scatter' | 'rain' | 'pattern' | 'border' | 'hero' | 'cluster' | 'bottom' | 'orbit' | 'trail' | 'float' | 'corner';

export interface ArtBg {
  kind: BgKind;
  c1: string;
  c2: string;
  c3: string;
  angle?: number;
}

export interface ArtLayer {
  motif: MotifId;
  layout: LayoutId;
  c1: string;
  c2: string;
  count: number;
  /** 0.4 – 3 */
  size: number;
  /** 0 – 1 glow amount */
  glow: number;
  opacity?: number;
}

export interface ArtSpec {
  bg: ArtBg;
  layers: ArtLayer[];
  seed: number;
}

/* ------------------------------------------------------------------ */
/* Utils                                                               */
/* ------------------------------------------------------------------ */
export function rng(seed: number): Rnd {
  let a = seed >>> 0 || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseHex(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m.slice(0, 6).padEnd(6, '0'), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Lighten (amt > 0) or darken (amt < 0) a hex colour. */
export function shade(hex: string, amt: number): string {
  const [r, g, b] = parseHex(hex);
  const f = (v: number) => Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
export function alpha(hex: string, a: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r},${g},${b},${a})`;
}
export function hexHsl(hex: string): [number, number, number] {
  const [R, G, B] = parseHex(hex).map((v) => v / 255);
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

/** Fill a path with a soft top-lit gradient of one colour. */
function fillShaded(ctx: Ctx, p: Path2D, c: string, s: number, flat = false) {
  if (flat) {
    ctx.fillStyle = c;
  } else {
    const g = ctx.createLinearGradient(0, -s, 0, s);
    g.addColorStop(0, shade(c, 0.35));
    g.addColorStop(0.55, c);
    g.addColorStop(1, shade(c, -0.3));
    ctx.fillStyle = g;
  }
  ctx.fill(p, 'evenodd');
}
function gloss(ctx: Ctx, x: number, y: number, rx: number, ry: number, a = 0.45) {
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.fill(S.ellipse(x, y, rx, ry, -0.5));
}
function line(ctx: Ctx, pts: number[], color: string, w: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
}
/** Cute face: eyes, blush, smile. */
function kawaii(ctx: Ctx, s: number, dy = 0, eye = '#1b1b22') {
  ctx.fillStyle = eye;
  ctx.fill(S.ellipse(-s * 0.32, dy, s * 0.09, s * 0.12));
  ctx.fill(S.ellipse(s * 0.32, dy, s * 0.09, s * 0.12));
  ctx.fillStyle = '#fff';
  ctx.fill(S.circle(-s * 0.29, dy - s * 0.05, s * 0.035));
  ctx.fill(S.circle(s * 0.35, dy - s * 0.05, s * 0.035));
  ctx.fillStyle = 'rgba(255,120,150,0.55)';
  ctx.fill(S.ellipse(-s * 0.5, dy + s * 0.18, s * 0.12, s * 0.07));
  ctx.fill(S.ellipse(s * 0.5, dy + s * 0.18, s * 0.12, s * 0.07));
  ctx.strokeStyle = eye;
  ctx.lineWidth = s * 0.05;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-s * 0.06, dy + s * 0.14, s * 0.07, 0.2, Math.PI - 0.2);
  ctx.arc(s * 0.06, dy + s * 0.14, s * 0.07, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* Motifs — drawn centred at (0,0) with size s (≈ radius)              */
/* ------------------------------------------------------------------ */
type Draw = (ctx: Ctx, s: number, c1: string, c2: string, r: Rnd) => void;
interface Motif {
  name: string;
  labels: [string, string];
  draw: Draw;
}

const M: Record<string, Motif> = {
  heart: {
    name: 'Heart',
    labels: ['Heart colour', 'Highlight'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.heart(0, 0, s), c1, s);
      gloss(ctx, -s * 0.42, -s * 0.35, s * 0.22, s * 0.12, 0.5);
      ctx.fillStyle = alpha(c2, 0.35);
      ctx.fill(S.heart(s * 0.08, s * 0.1, s * 0.45));
    },
  },
  heartOutline: {
    name: 'Heart outline',
    labels: ['Line colour', 'Inner heart'],
    draw: (ctx, s, c1, c2) => {
      ctx.strokeStyle = c1;
      ctx.lineWidth = s * 0.16;
      ctx.stroke(S.heart(0, 0, s));
      ctx.fillStyle = c2;
      ctx.fill(S.heart(0, s * 0.05, s * 0.35));
    },
  },
  rose: {
    name: 'Rose',
    labels: ['Petal colour', 'Leaf colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.ellipse(-s * 0.85, s * 0.55, s * 0.45, s * 0.2, -0.6), c2, s);
      fillShaded(ctx, S.ellipse(s * 0.85, s * 0.55, s * 0.45, s * 0.2, 0.6), c2, s);
      for (let i = 0; i < 3; i++) {
        const rr = s * (0.95 - i * 0.28);
        fillShaded(ctx, S.flower(0, 0, rr, 5, 0.62), shade(c1, -i * 0.12), rr);
      }
      ctx.strokeStyle = shade(c1, -0.45);
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.2) {
        const rr = s * 0.04 * a;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.stroke();
    },
  },
  tulip: {
    name: 'Tulip',
    labels: ['Flower colour', 'Stem colour'],
    draw: (ctx, s, c1, c2) => {
      line(ctx, [0, s * 0.2, 0, s * 1.6], c2, s * 0.1);
      fillShaded(ctx, S.ellipse(s * 0.35, s * 1.05, s * 0.35, s * 0.13, -0.8), c2, s);
      const p = new Path2D();
      p.moveTo(-s * 0.55, -s * 0.6);
      p.lineTo(-s * 0.2, -s * 0.2);
      p.lineTo(0, -s * 0.75);
      p.lineTo(s * 0.2, -s * 0.2);
      p.lineTo(s * 0.55, -s * 0.6);
      p.quadraticCurveTo(s * 0.65, s * 0.45, 0, s * 0.45);
      p.quadraticCurveTo(-s * 0.65, s * 0.45, -s * 0.55, -s * 0.6);
      fillShaded(ctx, p, c1, s);
    },
  },
  daisy: {
    name: 'Daisy',
    labels: ['Petal colour', 'Centre colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.flower(0, 0, s, 12, 0.42), c1, s);
      fillShaded(ctx, S.circle(0, 0, s * 0.3), c2, s * 0.3);
    },
  },
  sunflower: {
    name: 'Sunflower',
    labels: ['Petal colour', 'Seed colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.flower(0, 0, s * 1.05, 16, 0.4), c1, s);
      fillShaded(ctx, S.circle(0, 0, s * 0.45), c2, s * 0.45);
      ctx.fillStyle = shade(c2, -0.4);
      for (let i = 0; i < 24; i++) {
        const a = i * 2.39996;
        const rr = s * 0.4 * Math.sqrt(i / 24);
        ctx.fill(S.circle(Math.cos(a) * rr, Math.sin(a) * rr, s * 0.035));
      }
    },
  },
  sakura: {
    name: 'Cherry blossom',
    labels: ['Petal colour', 'Centre colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const m = new DOMMatrix().rotate((a * 180) / Math.PI + 90);
        const pt = new Path2D();
        pt.moveTo(0, 0);
        pt.bezierCurveTo(-s * 0.55, -s * 0.35, -s * 0.4, -s * 1.0, -s * 0.08, -s * 0.95);
        pt.lineTo(0, -s * 0.8);
        pt.lineTo(s * 0.08, -s * 0.95);
        pt.bezierCurveTo(s * 0.4, -s * 1.0, s * 0.55, -s * 0.35, 0, 0);
        p.addPath(pt, m);
      }
      fillShaded(ctx, p, c1, s);
      ctx.fillStyle = c2;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.fill(S.circle(Math.cos(a) * s * 0.22, Math.sin(a) * s * 0.22, s * 0.06));
      }
    },
  },
  lotus: {
    name: 'Lotus',
    labels: ['Petal colour', 'Water colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.ellipse(0, s * 0.55, s * 1.1, s * 0.22), c2, s * 0.3);
      for (const [a, k] of [
        [-0.9, 0.85],
        [0.9, 0.85],
        [-0.45, 1],
        [0.45, 1],
        [0, 1.1],
      ] as [number, number][]) {
        const p = new Path2D();
        p.ellipse(Math.sin(a) * s * 0.35, -s * 0.1, s * 0.28 * k, s * 0.62 * k, a, 0, Math.PI * 2);
        fillShaded(ctx, p, shade(c1, Math.abs(a) * -0.15), s);
      }
    },
  },
  leaf: {
    name: 'Leaf',
    labels: ['Leaf colour', 'Vein colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(0, -s);
      p.quadraticCurveTo(s * 0.8, 0, 0, s);
      p.quadraticCurveTo(-s * 0.8, 0, 0, -s);
      fillShaded(ctx, p, c1, s);
      line(ctx, [0, -s * 0.85, 0, s * 0.95], c2, s * 0.05);
    },
  },
  butterfly: {
    name: 'Butterfly',
    labels: ['Wing colour', 'Pattern colour'],
    draw: (ctx, s, c1, c2) => {
      for (const sx of [-1, 1]) {
        fillShaded(ctx, S.ellipse(sx * s * 0.5, -s * 0.3, s * 0.55, s * 0.45, sx * 0.5), c1, s);
        fillShaded(ctx, S.ellipse(sx * s * 0.38, s * 0.42, s * 0.36, s * 0.3, -sx * 0.4), shade(c1, -0.15), s);
        ctx.fillStyle = c2;
        ctx.fill(S.circle(sx * s * 0.55, -s * 0.32, s * 0.16));
        ctx.fill(S.circle(sx * s * 0.38, s * 0.45, s * 0.1));
      }
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.ellipse(0, 0, s * 0.08, s * 0.6));
      line(ctx, [0, -s * 0.55, -s * 0.25, -s * 0.95], '#1b1b22', s * 0.04);
      line(ctx, [0, -s * 0.55, s * 0.25, -s * 0.95], '#1b1b22', s * 0.04);
    },
  },
  star: {
    name: 'Star',
    labels: ['Star colour', 'Glow'],
    draw: (ctx, s, c1) => {
      fillShaded(ctx, S.star(0, 0, s, s * 0.45), c1, s);
      gloss(ctx, -s * 0.15, -s * 0.3, s * 0.15, s * 0.08, 0.5);
    },
  },
  sparkle: {
    name: 'Sparkle',
    labels: ['Sparkle colour', 'Core'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = c1;
      ctx.fill(S.star(0, 0, s, s * 0.16, 4, 0));
      ctx.fillStyle = c2;
      ctx.fill(S.circle(0, 0, s * 0.12));
    },
  },
  moon: {
    name: 'Moon',
    labels: ['Moon colour', 'Crater colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.moon(0, 0, s), c1, s);
      ctx.fillStyle = alpha(c2, 0.35);
      ctx.fill(S.circle(-s * 0.55, s * 0.2, s * 0.12));
      ctx.fill(S.circle(-s * 0.35, -s * 0.45, s * 0.08));
    },
  },
  planet: {
    name: 'Planet',
    labels: ['Planet colour', 'Ring colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.strokeStyle = c2;
      ctx.lineWidth = s * 0.12;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.35, s * 0.35, -0.35, Math.PI, Math.PI * 2);
      ctx.stroke();
      const g = ctx.createRadialGradient(-s * 0.3, -s * 0.3, s * 0.1, 0, 0, s);
      g.addColorStop(0, shade(c1, 0.4));
      g.addColorStop(1, shade(c1, -0.35));
      ctx.fillStyle = g;
      ctx.fill(S.circle(0, 0, s * 0.8));
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.35, s * 0.35, -0.35, 0, Math.PI);
      ctx.stroke();
    },
  },
  rocket: {
    name: 'Rocket',
    labels: ['Body colour', 'Flame colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.ellipse(0, s * 1.05, s * 0.2, s * 0.45), c2, s);
      const p = new Path2D();
      p.moveTo(0, -s);
      p.quadraticCurveTo(s * 0.5, -s * 0.4, s * 0.35, s * 0.65);
      p.lineTo(-s * 0.35, s * 0.65);
      p.quadraticCurveTo(-s * 0.5, -s * 0.4, 0, -s);
      fillShaded(ctx, p, c1, s);
      ctx.fillStyle = shade(c1, -0.35);
      ctx.fill(S.gem(-s * 0.42, s * 0.55, s * 0.25));
      ctx.fill(S.gem(s * 0.42, s * 0.55, s * 0.25));
      ctx.fillStyle = '#9EF0FF';
      ctx.fill(S.circle(0, -s * 0.2, s * 0.17));
    },
  },
  cloud: {
    name: 'Cloud',
    labels: ['Cloud colour', 'Shadow'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.addPath(S.circle(-s * 0.5, s * 0.1, s * 0.4));
      p.addPath(S.circle(0, -s * 0.15, s * 0.55));
      p.addPath(S.circle(s * 0.55, s * 0.1, s * 0.4));
      p.addPath(S.roundRect(-s * 0.9, s * 0.05, s * 1.8, s * 0.45, s * 0.22));
      ctx.fillStyle = alpha(c2, 0.5);
      ctx.save();
      ctx.translate(0, s * 0.08);
      ctx.fill(p, 'nonzero');
      ctx.restore();
      ctx.fillStyle = c1;
      ctx.fill(p, 'nonzero');
    },
  },
  snowflake: {
    name: 'Snowflake',
    labels: ['Snow colour', 'Sparkle'],
    draw: (ctx, s, c1) => {
      ctx.strokeStyle = c1;
      ctx.lineWidth = s * 0.09;
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -s);
        ctx.moveTo(0, -s * 0.55);
        ctx.lineTo(-s * 0.25, -s * 0.8);
        ctx.moveTo(0, -s * 0.55);
        ctx.lineTo(s * 0.25, -s * 0.8);
        ctx.stroke();
        ctx.restore();
      }
    },
  },
  paw: {
    name: 'Paw print',
    labels: ['Paw colour', 'Pad colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.paw(0, 0, s), c1, s);
      ctx.fillStyle = alpha(c2, 0.6);
      ctx.fill(S.ellipse(0, s * 0.38, s * 0.3, s * 0.22));
    },
  },
  cat: {
    name: 'Cat face',
    labels: ['Fur colour', 'Inner ear'],
    draw: (ctx, s, c1, c2) => {
      const ears = new Path2D();
      ears.moveTo(-s * 0.85, -s * 0.15);
      ears.lineTo(-s * 0.75, -s * 1.0);
      ears.lineTo(-s * 0.25, -s * 0.6);
      ears.moveTo(s * 0.85, -s * 0.15);
      ears.lineTo(s * 0.75, -s * 1.0);
      ears.lineTo(s * 0.25, -s * 0.6);
      fillShaded(ctx, ears, c1, s);
      fillShaded(ctx, S.ellipse(0, 0, s * 0.92, s * 0.78), c1, s);
      ctx.fillStyle = c2;
      const inner = new Path2D();
      inner.moveTo(-s * 0.72, -s * 0.35);
      inner.lineTo(-s * 0.68, -s * 0.82);
      inner.lineTo(-s * 0.38, -s * 0.58);
      inner.moveTo(s * 0.72, -s * 0.35);
      inner.lineTo(s * 0.68, -s * 0.82);
      inner.lineTo(s * 0.38, -s * 0.58);
      ctx.fill(inner);
      kawaii(ctx, s, 0);
      ctx.fillStyle = '#ff8fab';
      ctx.fill(S.heart(0, s * 0.06, s * 0.07));
      ctx.strokeStyle = 'rgba(30,30,40,0.6)';
      ctx.lineWidth = s * 0.025;
      for (const sx of [-1, 1])
        for (const dy of [0.08, 0.2]) {
          ctx.beginPath();
          ctx.moveTo(sx * s * 0.62, s * dy);
          ctx.lineTo(sx * s * 1.05, s * (dy - 0.05));
          ctx.stroke();
        }
    },
  },
  catSit: {
    name: 'Sitting cat',
    labels: ['Cat colour', 'Eye colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.ellipse(0, s * 0.45, s * 0.6, s * 0.65, 0, 0, Math.PI * 2);
      p.moveTo(s * 0.4, -s * 0.35);
      p.ellipse(0, -s * 0.35, s * 0.4, s * 0.36, 0, 0, Math.PI * 2);
      p.moveTo(-s * 0.38, -s * 0.5);
      p.lineTo(-s * 0.32, -s * 0.95);
      p.lineTo(-s * 0.08, -s * 0.66);
      p.moveTo(s * 0.38, -s * 0.5);
      p.lineTo(s * 0.32, -s * 0.95);
      p.lineTo(s * 0.08, -s * 0.66);
      ctx.fillStyle = c1;
      ctx.fill(p, 'nonzero');
      ctx.strokeStyle = c1;
      ctx.lineWidth = s * 0.16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s * 0.5, s * 0.95);
      ctx.quadraticCurveTo(s * 1.2, s * 0.9, s * 0.95, s * 0.2);
      ctx.stroke();
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(-s * 0.15, -s * 0.38, s * 0.07, s * 0.09));
      ctx.fill(S.ellipse(s * 0.15, -s * 0.38, s * 0.07, s * 0.09));
    },
  },
  dog: {
    name: 'Dog face',
    labels: ['Fur colour', 'Ear colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.ellipse(-s * 0.8, s * 0.05, s * 0.3, s * 0.6, 0.35), c2, s);
      fillShaded(ctx, S.ellipse(s * 0.8, s * 0.05, s * 0.3, s * 0.6, -0.35), c2, s);
      fillShaded(ctx, S.ellipse(0, 0, s * 0.82, s * 0.8), c1, s);
      ctx.fillStyle = shade(c1, 0.45);
      ctx.fill(S.ellipse(0, s * 0.35, s * 0.42, s * 0.32));
      kawaii(ctx, s, -s * 0.05);
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.ellipse(0, s * 0.22, s * 0.13, s * 0.09));
      ctx.fillStyle = '#ff7a99';
      ctx.fill(S.ellipse(0, s * 0.48, s * 0.08, s * 0.1));
    },
  },
  bunny: {
    name: 'Bunny',
    labels: ['Fur colour', 'Inner ear'],
    draw: (ctx, s, c1, c2) => {
      for (const sx of [-1, 1]) {
        fillShaded(ctx, S.ellipse(sx * s * 0.32, -s * 0.95, s * 0.2, s * 0.55, sx * 0.15), c1, s);
        ctx.fillStyle = c2;
        ctx.fill(S.ellipse(sx * s * 0.32, -s * 0.92, s * 0.09, s * 0.38, sx * 0.15));
      }
      fillShaded(ctx, S.ellipse(0, 0, s * 0.75, s * 0.68), c1, s);
      kawaii(ctx, s * 0.85, 0);
    },
  },
  panda: {
    name: 'Panda',
    labels: ['Face colour', 'Patch colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = c2;
      ctx.fill(S.circle(-s * 0.62, -s * 0.62, s * 0.28));
      ctx.fill(S.circle(s * 0.62, -s * 0.62, s * 0.28));
      fillShaded(ctx, S.ellipse(0, 0, s * 0.88, s * 0.8), c1, s);
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(-s * 0.32, -s * 0.05, s * 0.2, s * 0.26, 0.5));
      ctx.fill(S.ellipse(s * 0.32, -s * 0.05, s * 0.2, s * 0.26, -0.5));
      ctx.fillStyle = '#fff';
      ctx.fill(S.circle(-s * 0.3, -s * 0.08, s * 0.06));
      ctx.fill(S.circle(s * 0.3, -s * 0.08, s * 0.06));
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.ellipse(0, s * 0.22, s * 0.1, s * 0.07));
    },
  },
  fox: {
    name: 'Fox',
    labels: ['Fur colour', 'Cheek colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(-s, -s * 0.9);
      p.lineTo(-s * 0.35, -s * 0.45);
      p.lineTo(s * 0.35, -s * 0.45);
      p.lineTo(s, -s * 0.9);
      p.lineTo(s * 0.85, s * 0.05);
      p.lineTo(0, s * 0.85);
      p.lineTo(-s * 0.85, s * 0.05);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      const ch = new Path2D();
      ch.moveTo(-s * 0.85, s * 0.05);
      ch.quadraticCurveTo(-s * 0.3, s * 0.05, 0, s * 0.85);
      ch.quadraticCurveTo(s * 0.3, s * 0.05, s * 0.85, s * 0.05);
      ch.lineTo(0, s * 0.85);
      ch.closePath();
      ctx.fillStyle = c2;
      ctx.fill(ch);
      kawaii(ctx, s * 0.9, -s * 0.12);
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.circle(0, s * 0.7, s * 0.09));
    },
  },
  lion: {
    name: 'Lion',
    labels: ['Face colour', 'Mane colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.flower(0, 0, s * 1.15, 12, 0.5), c2, s);
      fillShaded(ctx, S.circle(0, 0, s * 0.68), c1, s);
      kawaii(ctx, s * 0.75, -s * 0.05);
      ctx.fillStyle = '#5a3a1a';
      ctx.fill(S.ellipse(0, s * 0.15, s * 0.1, s * 0.07));
    },
  },
  bear: {
    name: 'Bear',
    labels: ['Fur colour', 'Muzzle colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.circle(-s * 0.65, -s * 0.6, s * 0.28), c1, s);
      fillShaded(ctx, S.circle(s * 0.65, -s * 0.6, s * 0.28), c1, s);
      fillShaded(ctx, S.ellipse(0, 0, s * 0.85, s * 0.78), c1, s);
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(0, s * 0.3, s * 0.36, s * 0.26));
      kawaii(ctx, s * 0.9, -s * 0.08);
    },
  },
  unicorn: {
    name: 'Unicorn',
    labels: ['Face colour', 'Mane colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.flower(-s * 0.45, -s * 0.2, s * 0.75, 6, 0.55), c2, s);
      const horn = new Path2D();
      horn.moveTo(-s * 0.15, -s * 0.6);
      horn.lineTo(0, -s * 1.35);
      horn.lineTo(s * 0.15, -s * 0.6);
      horn.closePath();
      fillShaded(ctx, horn, '#FFD966', s);
      fillShaded(ctx, S.ellipse(0, 0, s * 0.75, s * 0.7), c1, s);
      kawaii(ctx, s * 0.85, 0);
    },
  },
  bird: {
    name: 'Bird',
    labels: ['Body colour', 'Wing colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.ellipse(0, 0, s * 0.75, s * 0.55), c1, s);
      fillShaded(ctx, S.ellipse(-s * 0.05, -s * 0.05, s * 0.45, s * 0.28, -0.4), c2, s);
      const beak = new Path2D();
      beak.moveTo(s * 0.7, -s * 0.15);
      beak.lineTo(s * 1.05, -s * 0.05);
      beak.lineTo(s * 0.7, s * 0.05);
      ctx.fillStyle = '#FFB020';
      ctx.fill(beak);
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.circle(s * 0.45, -s * 0.18, s * 0.07));
      const tail = new Path2D();
      tail.moveTo(-s * 0.7, -s * 0.05);
      tail.lineTo(-s * 1.15, -s * 0.35);
      tail.lineTo(-s * 1.05, s * 0.15);
      ctx.fillStyle = c2;
      ctx.fill(tail);
    },
  },
  flyingBird: {
    name: 'Flying bird',
    labels: ['Bird colour', 'Accent'],
    draw: (ctx, s, c1) => {
      ctx.strokeStyle = c1;
      ctx.lineWidth = s * 0.14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.2);
      ctx.quadraticCurveTo(-s * 0.45, -s * 0.6, 0, 0);
      ctx.quadraticCurveTo(s * 0.45, -s * 0.6, s, -s * 0.2);
      ctx.stroke();
    },
  },
  owl: {
    name: 'Owl',
    labels: ['Feather colour', 'Belly colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(-s * 0.7, -s * 0.9);
      p.lineTo(-s * 0.35, -s * 0.6);
      p.lineTo(s * 0.35, -s * 0.6);
      p.lineTo(s * 0.7, -s * 0.9);
      p.lineTo(s * 0.8, s * 0.4);
      p.quadraticCurveTo(0, s * 1.25, -s * 0.8, s * 0.4);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(0, s * 0.45, s * 0.45, s * 0.4));
      for (const sx of [-1, 1]) {
        ctx.fillStyle = '#fff';
        ctx.fill(S.circle(sx * s * 0.32, -s * 0.25, s * 0.26));
        ctx.fillStyle = '#1b1b22';
        ctx.fill(S.circle(sx * s * 0.32, -s * 0.25, s * 0.13));
      }
      const beak = new Path2D();
      beak.moveTo(-s * 0.1, -s * 0.05);
      beak.lineTo(s * 0.1, -s * 0.05);
      beak.lineTo(0, s * 0.15);
      ctx.fillStyle = '#FFB020';
      ctx.fill(beak);
    },
  },
  penguin: {
    name: 'Penguin',
    labels: ['Body colour', 'Belly colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.ellipse(0, 0, s * 0.7, s * 0.95), c1, s);
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(0, s * 0.2, s * 0.48, s * 0.7));
      kawaii(ctx, s * 0.7, -s * 0.35);
      ctx.fillStyle = '#FFB020';
      ctx.fill(S.ellipse(-s * 0.25, s * 0.95, s * 0.2, s * 0.08));
      ctx.fill(S.ellipse(s * 0.25, s * 0.95, s * 0.2, s * 0.08));
    },
  },
  fish: {
    name: 'Fish',
    labels: ['Body colour', 'Fin colour'],
    draw: (ctx, s, c1, c2) => {
      const tail = new Path2D();
      tail.moveTo(-s * 0.55, 0);
      tail.lineTo(-s * 1.1, -s * 0.45);
      tail.lineTo(-s * 1.1, s * 0.45);
      tail.closePath();
      fillShaded(ctx, tail, c2, s);
      fillShaded(ctx, S.ellipse(0, 0, s * 0.75, s * 0.48), c1, s);
      ctx.strokeStyle = alpha(c2, 0.7);
      ctx.lineWidth = s * 0.07;
      ctx.beginPath();
      ctx.arc(-s * 0.05, 0, s * 0.35, -1, 1);
      ctx.stroke();
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.circle(s * 0.4, -s * 0.1, s * 0.08));
    },
  },
  whale: {
    name: 'Whale',
    labels: ['Body colour', 'Belly colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(-s, -s * 0.05);
      p.quadraticCurveTo(-s * 0.2, -s * 0.85, s, -s * 0.05);
      p.quadraticCurveTo(s * 0.9, s * 0.55, -s * 0.2, s * 0.5);
      p.quadraticCurveTo(-s * 0.85, s * 0.45, -s, -s * 0.05);
      fillShaded(ctx, p, c1, s);
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(s * 0.15, s * 0.35, s * 0.55, s * 0.13));
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.circle(s * 0.6, s * 0.05, s * 0.06));
      ctx.fillStyle = alpha('#9EF0FF', 0.8);
      ctx.fill(S.circle(-s * 0.05, -s * 0.85, s * 0.08));
      ctx.fill(S.circle(s * 0.1, -s * 1.0, s * 0.06));
    },
  },
  dino: {
    name: 'Dinosaur',
    labels: ['Body colour', 'Spike colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = c2;
      for (let i = 0; i < 4; i++) ctx.fill(S.star(-s * 0.55 + i * s * 0.32, -s * 0.38 - Math.sin(i) * s * 0.08, s * 0.16, s * 0.07, 3));
      const p = new Path2D();
      p.ellipse(-s * 0.1, s * 0.15, s * 0.75, s * 0.5, 0, 0, Math.PI * 2);
      p.moveTo(s * 0.95, -s * 0.45);
      p.ellipse(s * 0.65, -s * 0.45, s * 0.38, s * 0.3, 0, 0, Math.PI * 2);
      fillShaded(ctx, p, c1, s);
      ctx.fillStyle = c1;
      ctx.fill(S.roundRect(-s * 0.5, s * 0.45, s * 0.22, s * 0.4, s * 0.08));
      ctx.fill(S.roundRect(s * 0.15, s * 0.45, s * 0.22, s * 0.4, s * 0.08));
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.circle(s * 0.75, -s * 0.52, s * 0.06));
    },
  },
  bee: {
    name: 'Bee',
    labels: ['Body colour', 'Stripe colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = 'rgba(220,240,255,0.75)';
      ctx.fill(S.ellipse(-s * 0.3, -s * 0.6, s * 0.35, s * 0.25, -0.5));
      ctx.fill(S.ellipse(s * 0.3, -s * 0.6, s * 0.35, s * 0.25, 0.5));
      const body = S.ellipse(0, 0, s * 0.75, s * 0.55);
      fillShaded(ctx, body, c1, s);
      ctx.save();
      ctx.clip(body);
      ctx.fillStyle = c2;
      for (const x of [-0.35, 0.05, 0.45]) ctx.fillRect(x * s - s * 0.1, -s, s * 0.18, s * 2);
      ctx.restore();
      kawaii(ctx, s * 0.5, -s * 0.05);
    },
  },
  ladybug: {
    name: 'Ladybug',
    labels: ['Shell colour', 'Spot colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.circle(0, -s * 0.65, s * 0.35));
      fillShaded(ctx, S.circle(0, s * 0.05, s * 0.8), c1, s);
      line(ctx, [0, -s * 0.75, 0, s * 0.85], '#1b1b22', s * 0.05);
      ctx.fillStyle = c2;
      for (const [x, y] of [
        [-0.4, -0.2],
        [0.4, -0.2],
        [-0.45, 0.35],
        [0.45, 0.35],
        [-0.15, 0.6],
        [0.15, 0.6],
      ])
        ctx.fill(S.circle(x * s, y * s, s * 0.13));
    },
  },
  soccer: {
    name: 'Football',
    labels: ['Ball colour', 'Patch colour'],
    draw: (ctx, s, c1, c2) => {
      const ball = S.circle(0, 0, s);
      const g = ctx.createRadialGradient(-s * 0.35, -s * 0.4, s * 0.1, 0, 0, s);
      g.addColorStop(0, shade(c1, 0.3));
      g.addColorStop(1, shade(c1, -0.35));
      ctx.fillStyle = g;
      ctx.fill(ball);
      ctx.save();
      ctx.clip(ball);
      ctx.fillStyle = c2;
      ctx.fill(S.soccerPatches(0, 0, s));
      ctx.restore();
      gloss(ctx, -s * 0.35, -s * 0.45, s * 0.25, s * 0.12, 0.45);
    },
  },
  basketball: {
    name: 'Basketball',
    labels: ['Ball colour', 'Seam colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.circle(0, 0, s), c1, s);
      ctx.strokeStyle = c2;
      ctx.lineWidth = s * 0.07;
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(s, 0);
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s);
      ctx.moveTo(-s * 0.7, -s * 0.7);
      ctx.quadraticCurveTo(-s * 0.15, 0, -s * 0.7, s * 0.7);
      ctx.moveTo(s * 0.7, -s * 0.7);
      ctx.quadraticCurveTo(s * 0.15, 0, s * 0.7, s * 0.7);
      ctx.stroke();
    },
  },
  tennis: {
    name: 'Tennis ball',
    labels: ['Ball colour', 'Seam colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.circle(0, 0, s), c1, s);
      ctx.strokeStyle = c2;
      ctx.lineWidth = s * 0.1;
      ctx.beginPath();
      ctx.arc(-s * 1.15, 0, s * 0.85, -0.9, 0.9);
      ctx.moveTo(s * 1.15 - s * 0.85 * Math.cos(0.9), -s * 0.85 * Math.sin(0.9));
      ctx.arc(s * 1.15, 0, s * 0.85, Math.PI + 0.9, Math.PI - 0.9, true);
      ctx.stroke();
    },
  },
  volleyball: {
    name: 'Volleyball',
    labels: ['Panel colour', 'Panel accent'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.circle(0, 0, s), '#F4F4F6', s);
      ctx.save();
      ctx.clip(S.circle(0, 0, s));
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 3);
        ctx.fillStyle = i === 1 ? c2 : c1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(s * 0.6, -s * 0.3, s * 0.4, -s * 1.1);
        ctx.lineTo(s * 0.1, -s * 1.1);
        ctx.quadraticCurveTo(s * 0.3, -s * 0.4, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    },
  },
  jersey: {
    name: 'Jersey',
    labels: ['Jersey colour', 'Stripe / number colour'],
    draw: (ctx, s, c1, c2, r) => {
      const p = new Path2D();
      p.moveTo(-s * 0.35, -s * 0.95);
      p.quadraticCurveTo(0, -s * 0.75, s * 0.35, -s * 0.95);
      p.lineTo(s * 1.0, -s * 0.55);
      p.lineTo(s * 0.75, -s * 0.15);
      p.lineTo(s * 0.55, -s * 0.3);
      p.lineTo(s * 0.55, s);
      p.lineTo(-s * 0.55, s);
      p.lineTo(-s * 0.55, -s * 0.3);
      p.lineTo(-s * 0.75, -s * 0.15);
      p.lineTo(-s, -s * 0.55);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      ctx.save();
      ctx.clip(p);
      ctx.fillStyle = alpha(c2, 0.9);
      ctx.fillRect(-s, -s * 0.62, s * 2, s * 0.08);
      ctx.restore();
      ctx.fillStyle = c2;
      ctx.font = `800 ${s * 0.8}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(1 + Math.floor(r() * 23)), 0, s * 0.25);
    },
  },
  trophy: {
    name: 'Trophy',
    labels: ['Cup colour', 'Base colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.strokeStyle = c1;
      ctx.lineWidth = s * 0.12;
      ctx.beginPath();
      ctx.arc(-s * 0.55, -s * 0.45, s * 0.28, Math.PI * 0.5, Math.PI * 1.5);
      ctx.moveTo(s * 0.55, -s * 0.73);
      ctx.arc(s * 0.55, -s * 0.45, s * 0.28, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
      const cup = new Path2D();
      cup.moveTo(-s * 0.6, -s * 0.85);
      cup.lineTo(s * 0.6, -s * 0.85);
      cup.quadraticCurveTo(s * 0.6, s * 0.05, 0, s * 0.15);
      cup.quadraticCurveTo(-s * 0.6, s * 0.05, -s * 0.6, -s * 0.85);
      fillShaded(ctx, cup, c1, s);
      ctx.fillStyle = c1;
      ctx.fillRect(-s * 0.1, s * 0.1, s * 0.2, s * 0.45);
      fillShaded(ctx, S.roundRect(-s * 0.45, s * 0.55, s * 0.9, s * 0.35, s * 0.06), c2, s);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill(S.star(0, -s * 0.4, s * 0.22, s * 0.1));
    },
  },
  car: {
    name: 'Sports car',
    labels: ['Paint colour', 'Wheel colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(-s * 1.2, s * 0.25);
      p.lineTo(-s * 1.15, -s * 0.05);
      p.quadraticCurveTo(-s * 0.7, -s * 0.15, -s * 0.4, -s * 0.45);
      p.quadraticCurveTo(0, -s * 0.6, s * 0.4, -s * 0.4);
      p.quadraticCurveTo(s * 0.8, -s * 0.15, s * 1.2, -s * 0.05);
      p.lineTo(s * 1.2, s * 0.25);
      p.closePath();
      fillShaded(ctx, p, c1, s * 0.6);
      ctx.fillStyle = 'rgba(150,220,255,0.75)';
      const w = new Path2D();
      w.moveTo(-s * 0.35, -s * 0.38);
      w.quadraticCurveTo(0, -s * 0.5, s * 0.35, -s * 0.33);
      w.lineTo(s * 0.25, -s * 0.12);
      w.lineTo(-s * 0.4, -s * 0.12);
      w.closePath();
      ctx.fill(w);
      for (const x of [-0.7, 0.72]) {
        ctx.fillStyle = '#16161c';
        ctx.fill(S.circle(x * s, s * 0.28, s * 0.25));
        ctx.fillStyle = c2;
        ctx.fill(S.circle(x * s, s * 0.28, s * 0.12));
      }
      ctx.fillStyle = '#FFE48A';
      ctx.fill(S.ellipse(s * 1.12, s * 0.05, s * 0.07, s * 0.05));
    },
  },
  motorbike: {
    name: 'Motorbike',
    labels: ['Body colour', 'Wheel colour'],
    draw: (ctx, s, c1, c2) => {
      for (const x of [-0.7, 0.7]) {
        ctx.strokeStyle = '#16161c';
        ctx.lineWidth = s * 0.14;
        ctx.beginPath();
        ctx.arc(x * s, s * 0.35, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = c2;
        ctx.fill(S.circle(x * s, s * 0.35, s * 0.1));
      }
      const p = new Path2D();
      p.moveTo(-s * 0.7, s * 0.35);
      p.lineTo(-s * 0.3, -s * 0.15);
      p.lineTo(s * 0.35, -s * 0.2);
      p.lineTo(s * 0.7, s * 0.35);
      p.lineTo(s * 0.2, s * 0.15);
      p.closePath();
      fillShaded(ctx, p, c1, s * 0.5);
      line(ctx, [s * 0.35, -s * 0.2, s * 0.55, -s * 0.5, s * 0.75, -s * 0.5], '#2a2a33', s * 0.08);
    },
  },
  plane: {
    name: 'Airplane',
    labels: ['Body colour', 'Wing colour'],
    draw: (ctx, s, c1, c2) => {
      const wing = new Path2D();
      wing.moveTo(-s * 0.1, -s * 0.1);
      wing.lineTo(-s * 0.45, -s * 0.85);
      wing.lineTo(-s * 0.25, -s * 0.85);
      wing.lineTo(s * 0.35, -s * 0.1);
      wing.moveTo(-s * 0.1, s * 0.1);
      wing.lineTo(-s * 0.45, s * 0.85);
      wing.lineTo(-s * 0.25, s * 0.85);
      wing.lineTo(s * 0.35, s * 0.1);
      ctx.fillStyle = c2;
      ctx.fill(wing);
      fillShaded(ctx, S.ellipse(0, 0, s, s * 0.16), c1, s * 0.3);
      ctx.fillStyle = c2;
      ctx.fill(S.gem(-s * 0.85, 0, s * 0.22));
    },
  },
  note: {
    name: 'Music note',
    labels: ['Note colour', 'Accent'],
    draw: (ctx, s, c1) => {
      ctx.fillStyle = c1;
      ctx.fill(S.ellipse(-s * 0.45, s * 0.55, s * 0.32, s * 0.24, -0.4));
      ctx.fill(S.ellipse(s * 0.5, s * 0.35, s * 0.32, s * 0.24, -0.4));
      ctx.fillRect(-s * 0.2, -s * 0.85, s * 0.11, s * 1.4);
      ctx.fillRect(s * 0.75, -s * 1.05, s * 0.11, s * 1.4);
      const b = new Path2D();
      b.moveTo(-s * 0.2, -s * 0.85);
      b.lineTo(s * 0.86, -s * 1.05);
      b.lineTo(s * 0.86, -s * 0.75);
      b.lineTo(-s * 0.2, -s * 0.55);
      ctx.fill(b);
    },
  },
  headphones: {
    name: 'Headphones',
    labels: ['Band colour', 'Cushion colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.strokeStyle = c1;
      ctx.lineWidth = s * 0.16;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.8, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      for (const sx of [-1, 1]) {
        fillShaded(ctx, S.roundRect(sx * s * 0.82 - s * 0.22, -s * 0.1, s * 0.44, s * 0.75, s * 0.18), c1, s);
        ctx.fillStyle = c2;
        ctx.fill(S.roundRect(sx * s * 0.82 - (sx > 0 ? s * 0.24 : -s * 0.08) - s * 0.08, 0, s * 0.16, s * 0.55, s * 0.07));
      }
    },
  },
  gamepad: {
    name: 'Game controller',
    labels: ['Controller colour', 'Button colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(-s * 0.6, -s * 0.4);
      p.lineTo(s * 0.6, -s * 0.4);
      p.quadraticCurveTo(s * 1.15, -s * 0.4, s * 1.1, s * 0.4);
      p.quadraticCurveTo(s * 1.05, s * 0.75, s * 0.7, s * 0.55);
      p.lineTo(s * 0.4, s * 0.25);
      p.lineTo(-s * 0.4, s * 0.25);
      p.lineTo(-s * 0.7, s * 0.55);
      p.quadraticCurveTo(-s * 1.05, s * 0.75, -s * 1.1, s * 0.4);
      p.quadraticCurveTo(-s * 1.15, -s * 0.4, -s * 0.6, -s * 0.4);
      fillShaded(ctx, p, c1, s * 0.6);
      ctx.fillStyle = shade(c1, -0.5);
      ctx.fillRect(-s * 0.72, -s * 0.07, s * 0.36, s * 0.13);
      ctx.fillRect(-s * 0.6, -s * 0.2, s * 0.13, s * 0.36);
      ctx.fillStyle = c2;
      for (const [x, y] of [
        [0.55, -0.18],
        [0.75, 0],
        [0.55, 0.17],
        [0.35, 0],
      ])
        ctx.fill(S.circle(x * s, y * s, s * 0.08));
    },
  },
  pixelHeart: {
    name: 'Pixel heart',
    labels: ['Pixel colour', 'Shine'],
    draw: (ctx, s, c1, c2) => {
      const grid = ['01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000'];
      const u = (s * 2) / 8;
      grid.forEach((row, y) =>
        [...row].forEach((v, x) => {
          if (v !== '1') return;
          ctx.fillStyle = y < 2 && x < 3 ? c2 : c1;
          ctx.fillRect(-s + x * u, -s * 0.85 + y * u, u + 0.5, u + 0.5);
        }),
      );
    },
  },
  bolt: {
    name: 'Lightning',
    labels: ['Bolt colour', 'Edge'],
    draw: (ctx, s, c1) => {
      fillShaded(ctx, S.bolt(0, 0, s), c1, s);
    },
  },
  flame: {
    name: 'Flame',
    labels: ['Outer flame', 'Inner flame'],
    draw: (ctx, s, c1, c2) => {
      const f = (k: number) => {
        const p = new Path2D();
        p.moveTo(0, -s * k);
        p.bezierCurveTo(s * 0.55 * k, -s * 0.35 * k, s * 0.75 * k, s * 0.2 * k, s * 0.45 * k, s * 0.65 * k);
        p.quadraticCurveTo(0, s * k, -s * 0.45 * k, s * 0.65 * k);
        p.bezierCurveTo(-s * 0.75 * k, s * 0.2 * k, -s * 0.2 * k, -s * 0.2 * k, 0, -s * k);
        return p;
      };
      fillShaded(ctx, f(1), c1, s, true);
      ctx.save();
      ctx.translate(0, s * 0.25);
      ctx.fillStyle = c2;
      ctx.fill(f(0.55));
      ctx.restore();
    },
  },
  skull: {
    name: 'Skull',
    labels: ['Bone colour', 'Shadow'],
    draw: (ctx, s, c1) => {
      fillShaded(ctx, S.skull(0, 0, s), c1, s);
    },
  },
  crown: {
    name: 'Crown',
    labels: ['Gold colour', 'Jewel colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.crown(0, 0, s), c1, s);
      ctx.fillStyle = c2;
      ctx.fill(S.gem(0, s * 0.2, s * 0.2));
      ctx.fill(S.circle(-s * 0.6, s * 0.3, s * 0.11));
      ctx.fill(S.circle(s * 0.6, s * 0.3, s * 0.11));
    },
  },
  diamond: {
    name: 'Diamond',
    labels: ['Gem colour', 'Facet light'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.gem(0, 0, s), c1, s);
      ctx.strokeStyle = alpha(c2, 0.7);
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.15);
      ctx.lineTo(s, -s * 0.15);
      ctx.moveTo(-s * 0.55, -s * 0.65);
      ctx.lineTo(-s * 0.25, -s * 0.15);
      ctx.lineTo(0, s);
      ctx.lineTo(s * 0.25, -s * 0.15);
      ctx.lineTo(s * 0.55, -s * 0.65);
      ctx.stroke();
      ctx.fillStyle = alpha(c2, 0.45);
      ctx.fill(S.star(s * 0.3, -s * 0.4, s * 0.25, s * 0.04, 4, 0));
    },
  },
  pearl: {
    name: 'Pearl',
    labels: ['Pearl colour', 'Shine'],
    draw: (ctx, s, c1, c2) => {
      const g = ctx.createRadialGradient(-s * 0.35, -s * 0.35, s * 0.05, 0, 0, s);
      g.addColorStop(0, c2);
      g.addColorStop(0.45, c1);
      g.addColorStop(1, shade(c1, -0.35));
      ctx.fillStyle = g;
      ctx.fill(S.circle(0, 0, s));
    },
  },
  coffee: {
    name: 'Coffee cup',
    labels: ['Cup colour', 'Coffee colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.strokeStyle = c1;
      ctx.lineWidth = s * 0.14;
      ctx.beginPath();
      ctx.arc(s * 0.7, 0, s * 0.28, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      const p = new Path2D();
      p.moveTo(-s * 0.7, -s * 0.4);
      p.lineTo(s * 0.7, -s * 0.4);
      p.lineTo(s * 0.55, s * 0.6);
      p.quadraticCurveTo(0, s * 0.85, -s * 0.55, s * 0.6);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(0, -s * 0.4, s * 0.68, s * 0.12));
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = s * 0.06;
      for (const x of [-0.25, 0.15]) {
        ctx.beginPath();
        ctx.moveTo(x * s, -s * 0.6);
        ctx.bezierCurveTo(x * s - s * 0.15, -s * 0.8, x * s + s * 0.15, -s * 0.9, x * s, -s * 1.1);
        ctx.stroke();
      }
    },
  },
  iceCream: {
    name: 'Ice cream',
    labels: ['Scoop colour', 'Cone colour'],
    draw: (ctx, s, c1, c2) => {
      const cone = new Path2D();
      cone.moveTo(-s * 0.5, -s * 0.05);
      cone.lineTo(s * 0.5, -s * 0.05);
      cone.lineTo(0, s * 1.05);
      cone.closePath();
      fillShaded(ctx, cone, c2, s);
      ctx.save();
      ctx.clip(cone);
      ctx.strokeStyle = shade(c2, -0.3);
      ctx.lineWidth = s * 0.04;
      for (let i = -3; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.25 - s, -s * 0.1);
        ctx.lineTo(i * s * 0.25 + s, s * 1.5);
        ctx.moveTo(i * s * 0.25 + s, -s * 0.1);
        ctx.lineTo(i * s * 0.25 - s, s * 1.5);
        ctx.stroke();
      }
      ctx.restore();
      fillShaded(ctx, S.circle(0, -s * 0.35, s * 0.55), c1, s);
      ctx.fillStyle = '#E8283C';
      ctx.fill(S.circle(s * 0.05, -s * 0.95, s * 0.12));
    },
  },
  pizza: {
    name: 'Pizza slice',
    labels: ['Cheese colour', 'Topping colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(0, s);
      p.lineTo(-s * 0.75, -s * 0.7);
      p.quadraticCurveTo(0, -s * 1.0, s * 0.75, -s * 0.7);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      ctx.strokeStyle = '#C98A3D';
      ctx.lineWidth = s * 0.16;
      ctx.beginPath();
      ctx.moveTo(-s * 0.75, -s * 0.7);
      ctx.quadraticCurveTo(0, -s * 1.0, s * 0.75, -s * 0.7);
      ctx.stroke();
      ctx.fillStyle = c2;
      for (const [x, y] of [
        [-0.25, -0.4],
        [0.25, -0.35],
        [0, 0.15],
      ])
        ctx.fill(S.circle(x * s, y * s, s * 0.14));
    },
  },
  cupcake: {
    name: 'Cupcake',
    labels: ['Frosting colour', 'Cup colour'],
    draw: (ctx, s, c1, c2) => {
      const cup = new Path2D();
      cup.moveTo(-s * 0.6, 0);
      cup.lineTo(s * 0.6, 0);
      cup.lineTo(s * 0.45, s * 0.9);
      cup.lineTo(-s * 0.45, s * 0.9);
      cup.closePath();
      fillShaded(ctx, cup, c2, s);
      const f = new Path2D();
      f.addPath(S.circle(-s * 0.35, -s * 0.1, s * 0.35));
      f.addPath(S.circle(s * 0.35, -s * 0.1, s * 0.35));
      f.addPath(S.circle(0, -s * 0.45, s * 0.42));
      ctx.fillStyle = c1;
      ctx.fill(f, 'nonzero');
      ctx.fillStyle = '#E8283C';
      ctx.fill(S.circle(0, -s * 0.95, s * 0.13));
    },
  },
  donut: {
    name: 'Donut',
    labels: ['Icing colour', 'Sprinkle colour'],
    draw: (ctx, s, c1, c2, r) => {
      const ring = new Path2D();
      ring.arc(0, 0, s, 0, Math.PI * 2);
      ring.arc(0, 0, s * 0.35, 0, Math.PI * 2, true);
      fillShaded(ctx, ring, '#D9A066', s);
      const ic = new Path2D();
      ic.arc(0, 0, s * 0.88, 0, Math.PI * 2);
      ic.arc(0, 0, s * 0.42, 0, Math.PI * 2, true);
      fillShaded(ctx, ic, c1, s);
      ctx.fillStyle = c2;
      for (let i = 0; i < 14; i++) {
        const a = r() * Math.PI * 2;
        const d = s * (0.5 + r() * 0.32);
        ctx.save();
        ctx.translate(Math.cos(a) * d, Math.sin(a) * d);
        ctx.rotate(r() * 3);
        ctx.fillRect(-s * 0.07, -s * 0.02, s * 0.14, s * 0.04);
        ctx.restore();
      }
    },
  },
  balloon: {
    name: 'Balloon',
    labels: ['Balloon colour', 'String colour'],
    draw: (ctx, s, c1, c2) => {
      line(ctx, [0, s * 0.85, s * 0.1, s * 1.3, -s * 0.05, s * 1.8], c2, s * 0.03);
      fillShaded(ctx, S.ellipse(0, 0, s * 0.7, s * 0.85), c1, s);
      gloss(ctx, -s * 0.28, -s * 0.38, s * 0.14, s * 0.24, 0.5);
    },
  },
  gift: {
    name: 'Gift box',
    labels: ['Box colour', 'Ribbon colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.roundRect(-s * 0.75, -s * 0.3, s * 1.5, s * 1.1, s * 0.06), c1, s);
      fillShaded(ctx, S.roundRect(-s * 0.85, -s * 0.5, s * 1.7, s * 0.3, s * 0.05), shade(c1, 0.1), s);
      ctx.fillStyle = c2;
      ctx.fillRect(-s * 0.1, -s * 0.5, s * 0.2, s * 1.3);
      ctx.fill(S.ellipse(-s * 0.25, -s * 0.65, s * 0.25, s * 0.14, 0.4));
      ctx.fill(S.ellipse(s * 0.25, -s * 0.65, s * 0.25, s * 0.14, -0.4));
    },
  },
  pumpkin: {
    name: 'Pumpkin',
    labels: ['Pumpkin colour', 'Face glow'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = '#3F7A2E';
      ctx.fillRect(-s * 0.08, -s * 0.95, s * 0.16, s * 0.3);
      for (const [x, k] of [
        [-0.45, 0.55],
        [0.45, 0.55],
        [0, 0.65],
      ] as [number, number][])
        fillShaded(ctx, S.ellipse(x * s, 0, s * k, s * 0.75), x === 0 ? c1 : shade(c1, -0.12), s);
      ctx.fillStyle = c2;
      const tri = (x: number, y: number) => {
        const p = new Path2D();
        p.moveTo(x - s * 0.14, y + s * 0.1);
        p.lineTo(x, y - s * 0.12);
        p.lineTo(x + s * 0.14, y + s * 0.1);
        p.closePath();
        ctx.fill(p);
      };
      tri(-s * 0.3, -s * 0.15);
      tri(s * 0.3, -s * 0.15);
      const m = new Path2D();
      m.moveTo(-s * 0.45, s * 0.2);
      m.quadraticCurveTo(0, s * 0.7, s * 0.45, s * 0.2);
      m.quadraticCurveTo(0, s * 0.45, -s * 0.45, s * 0.2);
      ctx.fill(m);
    },
  },
  ghost: {
    name: 'Ghost',
    labels: ['Ghost colour', 'Eye colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(-s * 0.7, s * 0.9);
      p.lineTo(-s * 0.7, -s * 0.2);
      p.arc(0, -s * 0.2, s * 0.7, Math.PI, 0);
      p.lineTo(s * 0.7, s * 0.9);
      for (let i = 0; i < 4; i++) p.quadraticCurveTo(s * (0.7 - 0.35 * i - 0.175), s * 0.65, s * (0.7 - 0.35 * (i + 1)), s * 0.9);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(-s * 0.25, -s * 0.2, s * 0.1, s * 0.15));
      ctx.fill(S.ellipse(s * 0.25, -s * 0.2, s * 0.1, s * 0.15));
      ctx.fill(S.ellipse(0, s * 0.15, s * 0.12, s * 0.15));
    },
  },
  bat: {
    name: 'Bat',
    labels: ['Bat colour', 'Eye colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(0, -s * 0.2);
      p.quadraticCurveTo(s * 0.5, -s * 0.6, s * 1.1, -s * 0.35);
      p.quadraticCurveTo(s * 0.9, -s * 0.1, s * 0.95, s * 0.2);
      p.quadraticCurveTo(s * 0.7, 0, s * 0.5, s * 0.25);
      p.quadraticCurveTo(s * 0.3, 0.05 * s, 0, s * 0.35);
      p.quadraticCurveTo(-s * 0.3, 0.05 * s, -s * 0.5, s * 0.25);
      p.quadraticCurveTo(-s * 0.7, 0, -s * 0.95, s * 0.2);
      p.quadraticCurveTo(-s * 0.9, -s * 0.1, -s * 1.1, -s * 0.35);
      p.quadraticCurveTo(-s * 0.5, -s * 0.6, 0, -s * 0.2);
      ctx.fillStyle = c1;
      ctx.fill(p);
      ctx.fillStyle = c2;
      ctx.fill(S.circle(-s * 0.08, -s * 0.05, s * 0.05));
      ctx.fill(S.circle(s * 0.08, -s * 0.05, s * 0.05));
    },
  },
  xmasTree: {
    name: 'Christmas tree',
    labels: ['Tree colour', 'Ornament colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = '#6B3F1F';
      ctx.fillRect(-s * 0.12, s * 0.75, s * 0.24, s * 0.3);
      for (let i = 0; i < 3; i++) {
        const p = new Path2D();
        const y = -s * 0.85 + i * s * 0.5;
        p.moveTo(0, y);
        p.lineTo(s * (0.45 + i * 0.2), y + s * 0.75);
        p.lineTo(-s * (0.45 + i * 0.2), y + s * 0.75);
        p.closePath();
        fillShaded(ctx, p, shade(c1, -i * 0.08), s);
      }
      ctx.fillStyle = c2;
      for (const [x, y] of [
        [-0.25, -0.05],
        [0.3, 0.2],
        [-0.4, 0.55],
        [0.15, 0.6],
        [0.05, -0.35],
      ])
        ctx.fill(S.circle(x * s, y * s, s * 0.08));
      ctx.fillStyle = '#FFD84D';
      ctx.fill(S.star(0, -s * 0.95, s * 0.2, s * 0.09));
    },
  },
  candy: {
    name: 'Candy cane',
    labels: ['Stripe colour', 'Base colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(s * 0.1, s);
      p.lineTo(s * 0.1, -s * 0.35);
      p.arc(-s * 0.25, -s * 0.35, s * 0.35, 0, Math.PI, true);
      ctx.lineCap = 'round';
      ctx.strokeStyle = c2;
      ctx.lineWidth = s * 0.25;
      ctx.stroke(p);
      ctx.setLineDash([s * 0.15, s * 0.15]);
      ctx.strokeStyle = c1;
      ctx.stroke(p);
      ctx.setLineDash([]);
    },
  },
  lantern: {
    name: 'Paper lantern',
    labels: ['Lantern colour', 'Tassel colour'],
    draw: (ctx, s, c1, c2) => {
      line(ctx, [0, -s * 1.2, 0, -s * 0.8], '#3a2a1a', s * 0.04);
      line(ctx, [0, s * 0.75, 0, s * 1.15], c2, s * 0.07);
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(-s * 0.35, -s * 0.85, s * 0.7, s * 0.12);
      ctx.fillRect(-s * 0.35, s * 0.65, s * 0.7, s * 0.12);
      const body = S.ellipse(0, -s * 0.05, s * 0.75, s * 0.72);
      const g = ctx.createRadialGradient(0, 0, s * 0.1, 0, 0, s * 0.8);
      g.addColorStop(0, shade(c1, 0.5));
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.fill(body);
      ctx.strokeStyle = shade(c1, -0.3);
      ctx.lineWidth = s * 0.03;
      for (const k of [0.3, 0.6]) {
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.05, s * 0.75 * k, s * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },
  fan: {
    name: 'Folding fan',
    labels: ['Paper colour', 'Pattern colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(0, s * 0.6);
      p.arc(0, s * 0.6, s * 1.2, Math.PI * 1.15, Math.PI * 1.85);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      ctx.strokeStyle = c2;
      ctx.lineWidth = s * 0.03;
      for (let i = 0; i <= 8; i++) {
        const a = Math.PI * (1.15 + (0.7 * i) / 8);
        ctx.beginPath();
        ctx.moveTo(0, s * 0.6);
        ctx.lineTo(Math.cos(a) * s * 1.2, s * 0.6 + Math.sin(a) * s * 1.2);
        ctx.stroke();
      }
      ctx.fillStyle = c2;
      ctx.fill(S.circle(-s * 0.3, -s * 0.2, s * 0.12));
      ctx.fill(S.circle(s * 0.25, -s * 0.3, s * 0.08));
    },
  },
  bamboo: {
    name: 'Bamboo',
    labels: ['Stem colour', 'Leaf colour'],
    draw: (ctx, s, c1, c2) => {
      for (let i = 0; i < 3; i++) fillShaded(ctx, S.roundRect(-s * 0.12, -s * 1.1 + i * s * 0.75, s * 0.24, s * 0.7, s * 0.05), c1, s);
      fillShaded(ctx, S.ellipse(s * 0.45, -s * 0.5, s * 0.4, s * 0.1, -0.5), c2, s);
      fillShaded(ctx, S.ellipse(-s * 0.4, s * 0.1, s * 0.4, s * 0.1, 0.5), c2, s);
    },
  },
  palm: {
    name: 'Palm tree',
    labels: ['Leaf colour', 'Trunk colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.strokeStyle = c2;
      ctx.lineWidth = s * 0.18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, s * 1.3);
      ctx.quadraticCurveTo(s * 0.2, s * 0.3, 0, -s * 0.4);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.55;
        ctx.save();
        ctx.translate(0, -s * 0.4);
        ctx.rotate(a + Math.PI / 2);
        fillShaded(ctx, S.ellipse(0, -s * 0.55, s * 0.16, s * 0.6), c1, s);
        ctx.restore();
      }
    },
  },
  sun: {
    name: 'Sun',
    labels: ['Sun colour', 'Ray colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = c2;
      ctx.fill(S.star(0, 0, s, s * 0.7, 12));
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.65);
      g.addColorStop(0, shade(c1, 0.5));
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.fill(S.circle(0, 0, s * 0.62));
    },
  },
  rainbow: {
    name: 'Rainbow',
    labels: ['Cloud colour', 'Accent'],
    draw: (ctx, s, c1) => {
      const cols = ['#FF5A5F', '#FF9F43', '#FFD93D', '#6BCB77', '#4D96FF', '#9B5DE5'];
      ctx.lineWidth = s * 0.13;
      cols.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.arc(0, s * 0.4, s * (1 - i * 0.13), Math.PI, 0);
        ctx.stroke();
      });
      ctx.fillStyle = c1;
      for (const sx of [-1, 1]) {
        ctx.fill(S.circle(sx * s * 0.85, s * 0.45, s * 0.22));
        ctx.fill(S.circle(sx * s * 0.62, s * 0.5, s * 0.18));
      }
    },
  },
  cherry: {
    name: 'Cherries',
    labels: ['Fruit colour', 'Stem colour'],
    draw: (ctx, s, c1, c2) => {
      line(ctx, [-s * 0.4, s * 0.3, 0, -s * 0.9, s * 0.4, s * 0.3], c2, s * 0.06);
      fillShaded(ctx, S.circle(-s * 0.4, s * 0.45, s * 0.4), c1, s * 0.4);
      fillShaded(ctx, S.circle(s * 0.4, s * 0.45, s * 0.4), c1, s * 0.4);
      gloss(ctx, -s * 0.5, s * 0.3, s * 0.08, s * 0.05);
      gloss(ctx, s * 0.3, s * 0.3, s * 0.08, s * 0.05);
    },
  },
  robot: {
    name: 'Robot',
    labels: ['Metal colour', 'Light colour'],
    draw: (ctx, s, c1, c2) => {
      line(ctx, [0, -s * 0.75, 0, -s * 1.05], c1, s * 0.06);
      ctx.fillStyle = c2;
      ctx.fill(S.circle(0, -s * 1.1, s * 0.1));
      fillShaded(ctx, S.roundRect(-s * 0.75, -s * 0.75, s * 1.5, s * 1.25, s * 0.25), c1, s);
      ctx.fillStyle = '#16161c';
      ctx.fill(S.roundRect(-s * 0.58, -s * 0.5, s * 1.16, s * 0.6, s * 0.18));
      ctx.fillStyle = c2;
      ctx.fill(S.circle(-s * 0.25, -s * 0.2, s * 0.12));
      ctx.fill(S.circle(s * 0.25, -s * 0.2, s * 0.12));
      ctx.fillRect(-s * 0.3, s * 0.25, s * 0.6, s * 0.08);
    },
  },
  kawaiiGirl: {
    name: 'Cute girl',
    labels: ['Hair colour', 'Bow colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.circle(0, -s * 0.05, s * 0.95), c1, s);
      ctx.fillStyle = c1;
      ctx.fill(S.ellipse(-s * 0.85, s * 0.45, s * 0.25, s * 0.55));
      ctx.fill(S.ellipse(s * 0.85, s * 0.45, s * 0.25, s * 0.55));
      fillShaded(ctx, S.ellipse(0, s * 0.15, s * 0.7, s * 0.65), '#FFE3D3', s * 0.7);
      const bangs = new Path2D();
      bangs.moveTo(-s * 0.75, s * 0.05);
      bangs.quadraticCurveTo(-s * 0.55, -s * 0.6, 0, -s * 0.55);
      bangs.quadraticCurveTo(s * 0.55, -s * 0.6, s * 0.75, s * 0.05);
      bangs.quadraticCurveTo(s * 0.35, -s * 0.2, 0, -s * 0.1);
      bangs.quadraticCurveTo(-s * 0.35, -s * 0.2, -s * 0.75, s * 0.05);
      ctx.fillStyle = c1;
      ctx.fill(bangs);
      kawaii(ctx, s * 0.75, s * 0.22);
      ctx.fillStyle = c2;
      ctx.fill(S.ellipse(s * 0.5, -s * 0.75, s * 0.25, s * 0.15, 0.5));
      ctx.fill(S.ellipse(s * 0.8, -s * 0.6, s * 0.25, s * 0.15, 0.9));
      ctx.fill(S.circle(s * 0.65, -s * 0.68, s * 0.09));
    },
  },
  kawaiiBoy: {
    name: 'Cute boy',
    labels: ['Hair colour', 'Cap colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.ellipse(0, s * 0.15, s * 0.75, s * 0.7), '#FFE3D3', s * 0.7);
      const hair = new Path2D();
      hair.moveTo(-s * 0.8, s * 0.1);
      hair.quadraticCurveTo(-s * 0.85, -s * 0.75, 0, -s * 0.7);
      hair.quadraticCurveTo(s * 0.85, -s * 0.75, s * 0.8, s * 0.1);
      hair.lineTo(s * 0.5, -s * 0.15);
      hair.lineTo(s * 0.25, s * 0.0);
      hair.lineTo(0, -s * 0.2);
      hair.lineTo(-s * 0.3, 0);
      hair.lineTo(-s * 0.5, -s * 0.15);
      hair.closePath();
      fillShaded(ctx, hair, c1, s);
      fillShaded(ctx, S.ellipse(0, -s * 0.62, s * 0.78, s * 0.3), c2, s * 0.3);
      ctx.fillStyle = shade(c2, -0.2);
      ctx.fill(S.ellipse(s * 0.55, -s * 0.45, s * 0.5, s * 0.1, 0.1));
      kawaii(ctx, s * 0.75, s * 0.22);
    },
  },
  monster: {
    name: 'Cute monster',
    labels: ['Body colour', 'Horn colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = c2;
      ctx.fill(S.gem(-s * 0.45, -s * 0.85, s * 0.25));
      ctx.fill(S.gem(s * 0.45, -s * 0.85, s * 0.25));
      const p = new Path2D();
      p.moveTo(-s * 0.85, s * 0.9);
      p.lineTo(-s * 0.85, -s * 0.1);
      p.arc(0, -s * 0.1, s * 0.85, Math.PI, 0);
      p.lineTo(s * 0.85, s * 0.9);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      ctx.fillStyle = '#fff';
      ctx.fill(S.circle(0, -s * 0.15, s * 0.32));
      ctx.fillStyle = '#1b1b22';
      ctx.fill(S.circle(0, -s * 0.12, s * 0.15));
      ctx.fillStyle = '#fff';
      const t = new Path2D();
      t.moveTo(-s * 0.35, s * 0.35);
      t.lineTo(s * 0.35, s * 0.35);
      t.lineTo(s * 0.2, s * 0.5);
      t.lineTo(s * 0.05, s * 0.35);
      t.lineTo(-s * 0.1, s * 0.5);
      t.lineTo(-s * 0.25, s * 0.35);
      ctx.fill(t);
    },
  },
  dragon: {
    name: 'Dragon',
    labels: ['Scale colour', 'Wing colour'],
    draw: (ctx, s, c1, c2) => {
      const wing = new Path2D();
      wing.moveTo(-s * 0.1, -s * 0.2);
      wing.lineTo(-s * 1.1, -s * 0.9);
      wing.lineTo(-s * 0.85, -s * 0.3);
      wing.lineTo(-s * 1.0, -s * 0.05);
      wing.lineTo(-s * 0.3, s * 0.1);
      fillShaded(ctx, wing, c2, s);
      const body = new Path2D();
      body.moveTo(s * 0.9, -s * 0.75);
      body.quadraticCurveTo(s * 0.4, -s * 0.9, s * 0.35, -s * 0.4);
      body.quadraticCurveTo(-s * 0.4, -s * 0.1, -s * 0.3, s * 0.5);
      body.quadraticCurveTo(-s * 0.2, s * 0.95, s * 0.6, s * 0.85);
      body.quadraticCurveTo(0, s * 0.7, s * 0.15, s * 0.3);
      body.quadraticCurveTo(s * 0.35, -s * 0.05, s * 0.65, -s * 0.45);
      body.lineTo(s * 1.05, -s * 0.5);
      body.closePath();
      fillShaded(ctx, body, c1, s);
      ctx.fillStyle = '#FFD84D';
      ctx.fill(S.circle(s * 0.62, -s * 0.66, s * 0.06));
    },
  },
  mermaid: {
    name: 'Mermaid tail',
    labels: ['Scale colour', 'Fin colour'],
    draw: (ctx, s, c1, c2) => {
      const p = new Path2D();
      p.moveTo(-s * 0.35, -s);
      p.quadraticCurveTo(-s * 0.45, 0, -s * 0.05, s * 0.6);
      p.lineTo(s * 0.05, s * 0.6);
      p.quadraticCurveTo(s * 0.45, 0, s * 0.35, -s);
      p.closePath();
      fillShaded(ctx, p, c1, s);
      ctx.save();
      ctx.clip(p);
      ctx.strokeStyle = alpha('#ffffff', 0.35);
      ctx.lineWidth = s * 0.03;
      for (let y = -s; y < s * 0.6; y += s * 0.16)
        for (let x = -s * 0.4; x < s * 0.4; x += s * 0.16) {
          ctx.beginPath();
          ctx.arc(x + ((y / (s * 0.16)) % 2) * s * 0.08, y, s * 0.08, 0, Math.PI);
          ctx.stroke();
        }
      ctx.restore();
      const fin = new Path2D();
      fin.moveTo(0, s * 0.55);
      fin.quadraticCurveTo(-s * 0.7, s * 0.6, -s * 0.75, s * 1.05);
      fin.quadraticCurveTo(-s * 0.3, s * 0.85, 0, s * 0.75);
      fin.quadraticCurveTo(s * 0.3, s * 0.85, s * 0.75, s * 1.05);
      fin.quadraticCurveTo(s * 0.7, s * 0.6, 0, s * 0.55);
      fillShaded(ctx, fin, c2, s);
    },
  },
  guitar: {
    name: 'Guitar',
    labels: ['Body colour', 'Neck colour'],
    draw: (ctx, s, c1, c2) => {
      ctx.fillStyle = c2;
      ctx.fillRect(-s * 0.07, -s * 1.15, s * 0.14, s * 1.1);
      ctx.fillRect(-s * 0.12, -s * 1.3, s * 0.24, s * 0.2);
      const b = new Path2D();
      b.addPath(S.circle(0, s * 0.05, s * 0.38));
      b.addPath(S.circle(0, s * 0.55, s * 0.5));
      fillShaded(ctx, b, c1, s);
      ctx.fillStyle = '#16161c';
      ctx.fill(S.circle(0, s * 0.18, s * 0.13));
      ctx.fillRect(-s * 0.2, s * 0.6, s * 0.4, s * 0.07);
    },
  },
  camera: {
    name: 'Camera',
    labels: ['Body colour', 'Lens colour'],
    draw: (ctx, s, c1, c2) => {
      fillShaded(ctx, S.roundRect(-s * 0.95, -s * 0.5, s * 1.9, s * 1.15, s * 0.2), c1, s);
      fillShaded(ctx, S.roundRect(-s * 0.4, -s * 0.72, s * 0.6, s * 0.3, s * 0.06), c1, s);
      ctx.fillStyle = '#16161c';
      ctx.fill(S.circle(0, s * 0.07, s * 0.45));
      const g = ctx.createRadialGradient(-s * 0.1, -s * 0.05, s * 0.02, 0, s * 0.07, s * 0.33);
      g.addColorStop(0, shade(c2, 0.6));
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
      ctx.fill(S.circle(0, s * 0.07, s * 0.32));
    },
  },
  book: {
    name: 'Book',
    labels: ['Cover colour', 'Page colour'],
    draw: (ctx, s, c1, c2) => {
      for (const sx of [-1, 1]) {
        const p = new Path2D();
        p.moveTo(0, -s * 0.5);
        p.quadraticCurveTo(sx * s * 0.5, -s * 0.75, sx * s, -s * 0.55);
        p.lineTo(sx * s, s * 0.65);
        p.quadraticCurveTo(sx * s * 0.5, s * 0.45, 0, s * 0.7);
        p.closePath();
        ctx.fillStyle = c1;
        ctx.save();
        ctx.translate(0, s * 0.08);
        ctx.fill(p);
        ctx.restore();
        ctx.fillStyle = c2;
        ctx.fill(p);
      }
      ctx.strokeStyle = alpha('#000000', 0.2);
      ctx.lineWidth = s * 0.03;
      for (const y of [-0.25, -0.05, 0.15])
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(sx * s * 0.2, y * s);
          ctx.lineTo(sx * s * 0.8, y * s - s * 0.05);
          ctx.stroke();
        }
    },
  },
  wave: {
    name: 'Wave pattern',
    labels: ['Wave colour', 'Line colour'],
    draw: (ctx, s, c1, c2) => {
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? c2 : c1;
        ctx.fill(S.circle(0, 0, s * (1 - i * 0.24)));
      }
    },
  },
  bubble: {
    name: 'Bubble',
    labels: ['Bubble tint', 'Shine'],
    draw: (ctx, s, c1, c2) => {
      const g = ctx.createRadialGradient(-s * 0.3, -s * 0.3, s * 0.05, 0, 0, s);
      g.addColorStop(0, alpha(c2, 0.5));
      g.addColorStop(0.7, alpha(c1, 0.1));
      g.addColorStop(1, alpha(c1, 0.55));
      ctx.fillStyle = g;
      ctx.fill(S.circle(0, 0, s));
      gloss(ctx, -s * 0.35, -s * 0.4, s * 0.2, s * 0.1, 0.7);
    },
  },
  dot: {
    name: 'Glow dot',
    labels: ['Dot colour', 'Core'],
    draw: (ctx, s, c1) => {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      g.addColorStop(0, alpha(c1, 0.9));
      g.addColorStop(1, alpha(c1, 0));
      ctx.fillStyle = g;
      ctx.fill(S.circle(0, 0, s));
    },
  },
};

export type MotifId = keyof typeof M;
export const MOTIFS = M as Record<string, Motif>;
export const MOTIF_IDS = Object.keys(M) as MotifId[];

/* ------------------------------------------------------------------ */
/* Layouts                                                             */
/* ------------------------------------------------------------------ */
interface Placement {
  x: number;
  y: number;
  s: number;
  rot: number;
}

export const LAYOUTS: Record<LayoutId, string> = {
  scatter: 'Scattered',
  rain: 'Falling',
  pattern: 'Pattern',
  border: 'Frame',
  hero: 'Big centrepiece',
  cluster: 'Bottom bouquet',
  bottom: 'Along the bottom',
  orbit: 'Circle',
  trail: 'Flowing trail',
  float: 'Rising',
  corner: 'Top corners',
};

function place(layout: LayoutId, W: number, H: number, count: number, size: number, r: Rnd): Placement[] {
  const base = W * 0.065 * size;
  const out: Placement[] = [];
  const n = Math.max(1, Math.round(count));
  switch (layout) {
    case 'pattern': {
      const cols = Math.max(2, Math.round(Math.sqrt((n * W) / H)));
      const cw = W / cols;
      const rows = Math.ceil(H / cw) + 1;
      for (let y = 0; y < rows; y++)
        for (let x = 0; x <= cols; x++) out.push({ x: x * cw + (y % 2 ? cw / 2 : 0), y: y * cw + cw / 2, s: base * 0.8, rot: 0 });
      break;
    }
    case 'border': {
      const per = 2 * (W + H);
      for (let i = 0; i < n; i++) {
        let d = (i / n) * per;
        let x: number, y: number;
        if (d < W) [x, y] = [d, 0];
        else if ((d -= W) < H) [x, y] = [W, d];
        else if ((d -= H) < W) [x, y] = [W - d, H];
        else [x, y] = [0, H - (d - W)];
        out.push({ x, y, s: base * (0.8 + r() * 0.5), rot: (r() - 0.5) * 0.8 });
      }
      break;
    }
    case 'hero': {
      const spots: [number, number][] = [
        [0.27, 0.62],
        [0.75, 0.42],
        [0.3, 0.86],
        [0.78, 0.8],
      ];
      for (let i = 0; i < Math.min(n, 4); i++)
        out.push({ x: W * spots[i][0], y: H * spots[i][1], s: base * (i === 0 ? 3.6 : 2.2 - i * 0.3), rot: (r() - 0.5) * 0.35 });
      break;
    }
    case 'cluster': {
      for (let i = 0; i < n; i++) {
        const left = i % 2 === 0;
        const a = r() * Math.PI * 0.5;
        const d = Math.sqrt(r()) * W * 0.42;
        out.push({ x: left ? Math.cos(a) * d : W - Math.cos(a) * d, y: H - Math.sin(a) * d * 1.3, s: base * (0.8 + r() * 0.9), rot: (r() - 0.5) * 0.8 });
      }
      break;
    }
    case 'bottom':
      for (let i = 0; i < n; i++)
        out.push({ x: (W * (i + 0.5)) / n + (r() - 0.5) * (W / n) * 0.6, y: H * (0.84 + r() * 0.12), s: base * (0.9 + r() * 0.5), rot: (r() - 0.5) * 0.3 });
      break;
    case 'orbit':
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        out.push({ x: W / 2 + Math.cos(a) * W * 0.36, y: H * 0.58 + Math.sin(a) * W * 0.36, s: base * 0.9, rot: a + Math.PI / 2 });
      }
      break;
    case 'trail':
      for (let i = 0; i < n; i++) {
        const t = i / Math.max(1, n - 1);
        out.push({ x: W * (0.1 + t * 0.8) + Math.sin(t * 9) * W * 0.12, y: H * (0.3 + t * 0.65), s: base * (0.6 + t * 0.8), rot: (r() - 0.5) * 0.6 });
      }
      break;
    case 'float':
      for (let i = 0; i < n; i++) out.push({ x: r() * W, y: H * (1 - Math.pow(r(), 1.8)), s: base * (0.4 + r() * 0.9), rot: 0 });
      break;
    case 'corner':
      for (let i = 0; i < n; i++) {
        const left = i % 2 === 0;
        const a = r() * Math.PI * 0.5;
        const d = Math.sqrt(r()) * W * 0.38;
        out.push({ x: left ? Math.cos(a) * d : W - Math.cos(a) * d, y: Math.sin(a) * d, s: base * (0.6 + r() * 0.7), rot: (r() - 0.5) });
      }
      break;
    case 'rain':
      for (let i = 0; i < n; i++) out.push({ x: r() * W, y: r() * H, s: base * (0.35 + r() * 0.65), rot: 0.25 + (r() - 0.5) * 0.3 });
      break;
    default:
      for (let i = 0; i < n; i++) out.push({ x: r() * W, y: r() * H, s: base * (0.55 + r() * 0.8), rot: (r() - 0.5) * 0.9 });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Backgrounds                                                         */
/* ------------------------------------------------------------------ */
export const BG_KINDS: Record<BgKind, string> = {
  linear: 'Gradient',
  radial: 'Glow',
  sunset: 'Sunset sky',
  night: 'Night sky',
  galaxy: 'Galaxy',
  stadium: 'Stadium',
  grid: 'Neon grid',
  stripes: 'Stripes',
  polka: 'Polka dots',
  checker: 'Checker',
  bokeh: 'Bokeh lights',
  marble: 'Marble',
  watercolor: 'Watercolour',
  waves: 'Ocean waves',
  mountains: 'Mountains',
  meadow: 'Meadow',
  snow: 'Snowy night',
  holo: 'Holographic',
  fire: 'Fire',
  circuit: 'Circuit board',
  halftone: 'Halftone',
  jersey: 'Jersey fabric',
};

function radialBlob(ctx: Ctx, x: number, y: number, r: number, c: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, alpha(c, a));
  g.addColorStop(1, alpha(c, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawBg(ctx: Ctx, W: number, H: number, b: ArtBg, r: Rnd) {
  const { c1, c2, c3 } = b;
  const lin = (stops: string[], angle = b.angle ?? 90) => {
    const a = (angle * Math.PI) / 180;
    const L = Math.hypot(W, H) / 2;
    const g = ctx.createLinearGradient(W / 2 - Math.cos(a) * L, H / 2 - Math.sin(a) * L, W / 2 + Math.cos(a) * L, H / 2 + Math.sin(a) * L);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  const stars = (n: number, maxR: number) => {
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`;
      ctx.fill(S.circle(r() * W, r() * H, (r() * r() * maxR + 0.4) * (W / 600)));
    }
  };
  switch (b.kind) {
    case 'linear':
      lin([c1, c2, c3]);
      break;
    case 'radial': {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      radialBlob(ctx, W * 0.5, H * 0.55, H * 0.6, c2, 0.85);
      radialBlob(ctx, W * 0.8, H * 0.15, H * 0.3, c3, 0.5);
      break;
    }
    case 'sunset': {
      lin([c1, c2, c3], 90);
      radialBlob(ctx, W * 0.5, H * 0.72, W * 0.5, '#FFF1B8', 0.75);
      ctx.fillStyle = alpha('#FFE58A', 0.9);
      ctx.fill(S.circle(W * 0.5, H * 0.72, W * 0.16));
      ctx.fillStyle = alpha('#000000', 0.25);
      ctx.fillRect(0, H * 0.78, W, H * 0.22);
      break;
    }
    case 'night':
      lin([c1, c2, c3], 90);
      stars(Math.round(W * H * 0.00025) + 60, 2.2);
      radialBlob(ctx, W * 0.8, H * 0.15, W * 0.35, '#FFFFFF', 0.12);
      break;
    case 'galaxy': {
      ctx.fillStyle = '#06060c';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 14; i++) radialBlob(ctx, r() * W, r() * H, (0.15 + r() * 0.35) * H, [c1, c2, c3][i % 3], 0.35 + r() * 0.3);
      stars(Math.round(W * H * 0.0004) + 80, 2.6);
      break;
    }
    case 'stadium': {
      lin(['#05080f', '#0d1830', shade(c1, -0.4)], 90);
      for (const x of [0.12, 0.88]) {
        radialBlob(ctx, W * x, H * 0.08, W * 0.45, '#FFFFFF', 0.35);
        ctx.fillStyle = '#E8F1FF';
        for (let i = 0; i < 6; i++) ctx.fill(S.circle(W * x + (i - 2.5) * W * 0.02, H * 0.06, W * 0.008));
      }
      // crowd
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = alpha([c2, c3, '#FFFFFF'][i % 3], 0.35 + r() * 0.3);
        ctx.fill(S.circle(r() * W, H * (0.3 + r() * 0.16), W * 0.006));
      }
      // pitch in perspective
      const top = H * 0.48;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-W * 0.4, H);
      ctx.lineTo(W * 0.15, top);
      ctx.lineTo(W * 0.85, top);
      ctx.lineTo(W * 1.4, H);
      ctx.closePath();
      ctx.clip();
      for (let i = 0; i < 14; i++) {
        const y0 = top + (H - top) * Math.pow(i / 14, 1.4);
        const y1 = top + (H - top) * Math.pow((i + 1) / 14, 1.4);
        ctx.fillStyle = i % 2 ? c1 : shade(c1, -0.12);
        ctx.fillRect(-W, y0, W * 3, y1 - y0 + 1);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = W * 0.006;
      ctx.beginPath();
      ctx.moveTo(-W, H * 0.72);
      ctx.lineTo(W * 2, H * 0.72);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(W / 2, H * 0.72, W * 0.3, H * 0.06, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'grid': {
      lin([c1, shade(c1, -0.3), c1], 90);
      const hz = H * 0.62;
      radialBlob(ctx, W / 2, hz, W * 0.9, c2, 0.5);
      ctx.strokeStyle = alpha(c2, 0.85);
      ctx.lineWidth = W * 0.003;
      ctx.shadowColor = c2;
      ctx.shadowBlur = W * 0.02;
      for (let i = -12; i <= 12; i++) {
        ctx.beginPath();
        ctx.moveTo(W / 2, hz);
        ctx.lineTo(W / 2 + i * W * 0.18, H);
        ctx.stroke();
      }
      for (let i = 1; i < 12; i++) {
        const y = hz + (H - hz) * Math.pow(i / 12, 2);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = alpha(c3, 0.9);
      ctx.fill(S.circle(W / 2, hz - W * 0.18, W * 0.2));
      ctx.fillStyle = c1;
      for (let i = 0; i < 6; i++) ctx.fillRect(W * 0.28, hz - W * 0.12 + i * W * 0.03, W * 0.44, W * 0.008 + i * 0.002 * W);
      break;
    }
    case 'stripes': {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(((b.angle ?? 30) * Math.PI) / 180);
      const w = W * 0.07;
      for (let x = -H; x < H; x += w * 2) {
        ctx.fillStyle = Math.round(x / (w * 2)) % 2 ? c2 : c3;
        ctx.fillRect(x, -H, w, H * 2);
      }
      ctx.restore();
      break;
    }
    case 'polka': {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      const g = W / 7;
      for (let y = 0; y < H + g; y += g)
        for (let x = 0; x < W + g; x += g) {
          ctx.fillStyle = (x / g + y / g) % 2 ? c2 : c3;
          ctx.fill(S.circle(x + ((y / g) % 2 ? g / 2 : 0), y, g * 0.18));
        }
      break;
    }
    case 'checker': {
      const g = W / 8;
      for (let y = 0; y < H / g + 1; y++)
        for (let x = 0; x < 9; x++) {
          ctx.fillStyle = (x + y) % 2 ? c1 : c2;
          ctx.fillRect(x * g, y * g, g + 1, g + 1);
        }
      radialBlob(ctx, W / 2, H / 2, H * 0.7, c3, 0.3);
      break;
    }
    case 'bokeh': {
      lin([c1, shade(c1, -0.4)], 90);
      for (let i = 0; i < 40; i++) {
        const rad = (0.03 + r() * 0.12) * W;
        ctx.fillStyle = alpha(i % 2 ? c2 : c3, 0.08 + r() * 0.25);
        ctx.fill(S.circle(r() * W, r() * H, rad));
      }
      break;
    }
    case 'marble': {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = alpha(i % 3 === 0 ? c3 : c2, 0.25 + r() * 0.4);
        ctx.lineWidth = W * (0.002 + r() * 0.01);
        ctx.beginPath();
        let x = r() * W;
        let y = 0;
        ctx.moveTo(x, y);
        while (y < H) {
          x += (r() - 0.5) * W * 0.25;
          y += H * (0.03 + r() * 0.05);
          ctx.quadraticCurveTo(x + (r() - 0.5) * W * 0.2, y - H * 0.02, x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case 'watercolor': {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) radialBlob(ctx, r() * W, r() * H, (0.12 + r() * 0.3) * W, [c2, c3][i % 2], 0.25 + r() * 0.25);
      break;
    }
    case 'waves': {
      lin([c1, c2], 90);
      for (let i = 0; i < 9; i++) {
        const y0 = H * (0.35 + i * 0.075);
        ctx.fillStyle = alpha(i % 2 ? c3 : shade(c2, -0.2 - i * 0.05), 0.55);
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += W / 30) ctx.lineTo(x, y0 + Math.sin(x / W * Math.PI * 3 + i * 1.3) * H * 0.018);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'mountains': {
      lin([c1, c2], 90);
      radialBlob(ctx, W * 0.7, H * 0.3, W * 0.4, '#FFFFFF', 0.25);
      for (let l = 0; l < 4; l++) {
        ctx.fillStyle = shade(c3, -0.15 * l + 0.25);
        ctx.beginPath();
        ctx.moveTo(0, H);
        let y = H * (0.45 + l * 0.12);
        for (let x = 0; x <= W; x += W / 8) {
          y = H * (0.45 + l * 0.12) + (r() - 0.5) * H * 0.12;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'meadow': {
      lin([c1, c2], 90);
      radialBlob(ctx, W * 0.75, H * 0.18, W * 0.3, '#FFF6C9', 0.7);
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.7);
      ctx.quadraticCurveTo(W * 0.5, H * 0.6, W, H * 0.72);
      ctx.lineTo(W, H);
      ctx.fill();
      ctx.fillStyle = shade(c3, -0.15);
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.82);
      ctx.quadraticCurveTo(W * 0.6, H * 0.74, W, H * 0.85);
      ctx.lineTo(W, H);
      ctx.fill();
      break;
    }
    case 'snow': {
      lin([c1, c2], 90);
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.4 + r() * 0.6})`;
        ctx.fill(S.circle(r() * W, r() * H, W * (0.002 + r() * 0.006)));
      }
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.85);
      ctx.quadraticCurveTo(W * 0.4, H * 0.78, W, H * 0.86);
      ctx.lineTo(W, H);
      ctx.fill();
      break;
    }
    case 'holo': {
      const g = ctx.createConicGradient ? ctx.createConicGradient(r() * 6, W * 0.4, H * 0.45) : null;
      if (g) {
        ['#FFB3E6', '#B3E5FF', '#C9B3FF', '#B3FFD9', '#FFF0B3', '#FFB3E6'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      } else lin(['#FFB3E6', '#B3E5FF', '#C9B3FF']);
      radialBlob(ctx, W * 0.3, H * 0.3, W * 0.6, '#FFFFFF', 0.45);
      ctx.fillStyle = alpha(c1, 0.25);
      ctx.fillRect(0, 0, W, H);
      break;
    }
    case 'fire': {
      lin(['#0b0505', shade(c1, -0.5), c1], 90);
      for (let i = 0; i < 26; i++) radialBlob(ctx, r() * W, H * (0.65 + r() * 0.4), (0.1 + r() * 0.25) * W, i % 2 ? c2 : c3, 0.5);
      break;
    }
    case 'circuit': {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = alpha(c2, 0.7);
      ctx.lineWidth = W * 0.004;
      ctx.shadowColor = c2;
      ctx.shadowBlur = W * 0.01;
      for (let i = 0; i < 40; i++) {
        let x = Math.round((r() * W) / (W / 20)) * (W / 20);
        let y = r() * H;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 4; k++) {
          if (k % 2) x += (r() > 0.5 ? 1 : -1) * W * 0.1;
          else y += (r() > 0.5 ? 1 : -1) * H * 0.06;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = c3;
        ctx.fill(S.circle(x, y, W * 0.008));
      }
      ctx.shadowBlur = 0;
      break;
    }
    case 'halftone': {
      lin([c1, c2], 90);
      const g = W / 26;
      ctx.fillStyle = alpha(c3, 0.45);
      for (let y = 0; y < H; y += g)
        for (let x = 0; x < W; x += g) ctx.fill(S.circle(x + ((y / g) % 2 ? g / 2 : 0), y, g * 0.45 * (y / H)));
      break;
    }
    case 'jersey': {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      const w = W / 6;
      for (let x = 0; x < W; x += w * 2) {
        ctx.fillStyle = c2;
        ctx.fillRect(x, 0, w, H);
      }
      ctx.fillStyle = alpha('#000000', 0.08);
      for (let y = 0; y < H; y += W * 0.012) ctx.fillRect(0, y, W, W * 0.004);
      ctx.fillStyle = alpha(c3, 0.9);
      ctx.font = `900 ${W * 0.55}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(String(7 + Math.floor(r() * 3)), W / 2, H * 0.72);
      break;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Render                                                              */
/* ------------------------------------------------------------------ */
export function drawArt(ctx: Ctx, W: number, H: number, a: ArtSpec) {
  const r = rng(a.seed);
  ctx.save();
  drawBg(ctx, W, H, a.bg, rng(a.seed * 7 + 1));
  for (const L of a.layers) {
    const motif = M[L.motif];
    if (!motif) continue;
    const pts = place(L.layout, W, H, L.count, L.size, r);
    // draw the layer flat, then composite it once with its shadow/glow
    const lc = document.createElement('canvas');
    lc.width = W;
    lc.height = H;
    const lx = lc.getContext('2d')!;
    for (const p of pts) {
      lx.save();
      lx.translate(p.x, p.y);
      lx.rotate(p.rot);
      motif.draw(lx, p.s, L.c1, L.c2, r);
      lx.restore();
    }
    ctx.save();
    ctx.globalAlpha = L.opacity ?? 1;
    if (L.glow > 0) {
      ctx.shadowColor = alpha(L.c1, 0.9);
      ctx.shadowBlur = W * 0.04 * L.glow;
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = W * 0.014;
      ctx.shadowOffsetY = W * 0.007;
    }
    ctx.drawImage(lc, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}
