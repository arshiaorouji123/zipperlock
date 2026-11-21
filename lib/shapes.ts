/**
 * Reusable vector shapes as Path2D objects, centred on (x, y) with size s (≈ radius).
 * Shared by the zipper pullers/teeth and the procedural artwork.
 */

export function heart(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.moveTo(x, y + s * 0.95);
  p.bezierCurveTo(x - s * 1.25, y + s * 0.1, x - s * 1.05, y - s * 1.0, x, y - s * 0.4);
  p.bezierCurveTo(x + s * 1.05, y - s * 1.0, x + s * 1.25, y + s * 0.1, x, y + s * 0.95);
  p.closePath();
  return p;
}

export function star(x: number, y: number, R: number, r = R * 0.45, n = 5, rot = -Math.PI / 2): Path2D {
  const p = new Path2D();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n;
    const rr = i % 2 === 0 ? R : r;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) p.moveTo(px, py);
    else p.lineTo(px, py);
  }
  p.closePath();
  return p;
}

export function circle(x: number, y: number, r: number): Path2D {
  const p = new Path2D();
  p.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
  return p;
}

export function ellipse(x: number, y: number, rx: number, ry: number, rot = 0): Path2D {
  const p = new Path2D();
  p.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2);
  return p;
}

export function paw(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.ellipse(x, y + s * 0.35, s * 0.55, s * 0.45, 0, 0, Math.PI * 2);
  const toes: [number, number, number][] = [
    [-0.62, -0.2, 0],
    [-0.24, -0.6, 0],
    [0.24, -0.6, 0],
    [0.62, -0.2, 0],
  ];
  for (const [dx, dy] of toes) {
    p.moveTo(x + dx * s + s * 0.22, y + dy * s);
    p.ellipse(x + dx * s, y + dy * s, s * 0.22, s * 0.27, 0, 0, Math.PI * 2);
  }
  return p;
}

export function crown(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  const w = s * 1.1;
  p.moveTo(x - w, y + s * 0.6);
  p.lineTo(x - w, y - s * 0.3);
  p.lineTo(x - w * 0.5, y + s * 0.15);
  p.lineTo(x, y - s * 0.75);
  p.lineTo(x + w * 0.5, y + s * 0.15);
  p.lineTo(x + w, y - s * 0.3);
  p.lineTo(x + w, y + s * 0.6);
  p.closePath();
  return p;
}

export function gem(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.moveTo(x - s * 0.55, y - s * 0.65);
  p.lineTo(x + s * 0.55, y - s * 0.65);
  p.lineTo(x + s, y - s * 0.15);
  p.lineTo(x, y + s);
  p.lineTo(x - s, y - s * 0.15);
  p.closePath();
  return p;
}

export function bolt(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.moveTo(x + s * 0.2, y - s);
  p.lineTo(x - s * 0.55, y + s * 0.1);
  p.lineTo(x - s * 0.05, y + s * 0.1);
  p.lineTo(x - s * 0.25, y + s);
  p.lineTo(x + s * 0.55, y - s * 0.15);
  p.lineTo(x + s * 0.05, y - s * 0.15);
  p.closePath();
  return p;
}

export function flower(x: number, y: number, s: number, petals = 5, round = 0.55): Path2D {
  const p = new Path2D();
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(a) * s * 0.55;
    const py = y + Math.sin(a) * s * 0.55;
    p.moveTo(px + s * round * 0.8, py);
    p.ellipse(px, py, s * round * 0.8, s * round * 0.55, a, 0, Math.PI * 2);
  }
  return p;
}

export function skull(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.moveTo(x - s * 0.85, y);
  p.bezierCurveTo(x - s * 0.95, y - s * 1.2, x + s * 0.95, y - s * 1.2, x + s * 0.85, y);
  p.lineTo(x + s * 0.55, y + s * 0.35);
  p.lineTo(x + s * 0.45, y + s * 0.85);
  p.lineTo(x - s * 0.45, y + s * 0.85);
  p.lineTo(x - s * 0.55, y + s * 0.35);
  p.closePath();
  // eye sockets + nose (cut out with evenodd)
  p.moveTo(x - s * 0.08, y - s * 0.1);
  p.ellipse(x - s * 0.36, y - s * 0.12, s * 0.24, s * 0.26, 0, 0, Math.PI * 2);
  p.moveTo(x + s * 0.6, y - s * 0.1);
  p.ellipse(x + s * 0.36, y - s * 0.12, s * 0.24, s * 0.26, 0, 0, Math.PI * 2);
  p.moveTo(x, y + s * 0.22);
  p.lineTo(x - s * 0.1, y + s * 0.42);
  p.lineTo(x + s * 0.1, y + s * 0.42);
  p.closePath();
  return p;
}

export function moon(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.arc(x, y, s, Math.PI * 0.3, Math.PI * 1.7, false);
  p.arc(x + s * 0.45, y - s * 0.1, s * 0.8, Math.PI * 1.55, Math.PI * 0.45, true);
  p.closePath();
  return p;
}

export function roundRect(x: number, y: number, w: number, h: number, r: number): Path2D {
  const p = new Path2D();
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  p.moveTo(x + rad, y);
  p.arcTo(x + w, y, x + w, y + h, rad);
  p.arcTo(x + w, y + h, x, y + h, rad);
  p.arcTo(x, y + h, x, y, rad);
  p.arcTo(x, y, x + w, y, rad);
  p.closePath();
  return p;
}

/** Soccer ball pattern pieces (central pentagon + partial ones) inside radius s. */
export function soccerPatches(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  const pent = (cx: number, cy: number, r: number, rot: number) => {
    for (let i = 0; i < 5; i++) {
      const a = rot + (i * 2 * Math.PI) / 5;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) p.moveTo(px, py);
      else p.lineTo(px, py);
    }
    p.closePath();
  };
  pent(x, y, s * 0.3, -Math.PI / 2);
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + Math.PI / 5 + (i * 2 * Math.PI) / 5;
    pent(x + Math.cos(a) * s * 0.92, y + Math.sin(a) * s * 0.92, s * 0.26, a + Math.PI);
  }
  return p;
}

export function butterfly(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.moveTo(x, y - s * 0.1);
  p.bezierCurveTo(x - s * 0.4, y - s * 0.8, x - s * 1.2, y - s * 0.9, x - s * 1.05, y - s * 0.2);
  p.bezierCurveTo(x - s * 0.9, y + s * 0.2, x - s * 0.4, y + s * 0.15, x, y + s * 0.2);
  p.bezierCurveTo(x - s * 0.35, y + s * 0.3, x - s * 0.85, y + s * 0.55, x - s * 0.65, y + s * 0.95);
  p.bezierCurveTo(x - s * 0.35, y + s * 1.1, x - s * 0.1, y + s * 0.6, x, y + s * 0.4);
  p.bezierCurveTo(x + s * 0.1, y + s * 0.6, x + s * 0.35, y + s * 1.1, x + s * 0.65, y + s * 0.95);
  p.bezierCurveTo(x + s * 0.85, y + s * 0.55, x + s * 0.35, y + s * 0.3, x, y + s * 0.2);
  p.bezierCurveTo(x + s * 0.4, y + s * 0.15, x + s * 0.9, y + s * 0.2, x + s * 1.05, y - s * 0.2);
  p.bezierCurveTo(x + s * 1.2, y - s * 0.9, x + s * 0.4, y - s * 0.8, x, y - s * 0.1);
  p.closePath();
  return p;
}

export function diamond(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  const w = s * 1.15;
  p.moveTo(x - w * 0.55, y - s * 0.75);
  p.lineTo(x + w * 0.55, y - s * 0.75);
  p.lineTo(x + w, y - s * 0.2);
  p.lineTo(x, y + s);
  p.lineTo(x - w, y - s * 0.2);
  p.closePath();
  return p;
}

export function bow(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  const w = s * 1.15;
  p.moveTo(x - s * 0.2, y - s * 0.1);
  p.bezierCurveTo(x - w * 0.6, y - s * 0.8, x - w, y - s * 0.6, x - w, y - s * 0.05);
  p.bezierCurveTo(x - w, y + s * 0.5, x - w * 0.5, y + s * 0.4, x - s * 0.2, y + s * 0.15);
  p.lineTo(x - s * 0.65, y + s * 0.95);
  p.lineTo(x - s * 0.4, y + s * 0.8);
  p.lineTo(x - s * 0.1, y + s * 0.3);
  p.lineTo(x + s * 0.1, y + s * 0.3);
  p.lineTo(x + s * 0.4, y + s * 0.8);
  p.lineTo(x + s * 0.65, y + s * 0.95);
  p.lineTo(x + s * 0.2, y + s * 0.15);
  p.bezierCurveTo(x + w * 0.5, y + s * 0.4, x + w, y + s * 0.5, x + w, y - s * 0.05);
  p.bezierCurveTo(x + w, y - s * 0.6, x + w * 0.6, y - s * 0.8, x + s * 0.2, y - s * 0.1);
  p.closePath();
  p.moveTo(x + s * 0.24, y);
  p.arc(x, y, s * 0.24, 0, Math.PI * 2);
  return p;
}

export function heartLock(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.arc(x, y - s * 0.4, s * 0.38, Math.PI, 0, false);
  p.lineTo(x + s * 0.38, y - s * 0.1);
  p.arc(x, y - s * 0.4, s * 0.22, 0, Math.PI, true);
  p.closePath();
  p.addPath(heart(x, y + s * 0.15, s * 0.85));
  p.moveTo(x + s * 0.11, y + s * 0.08);
  p.arc(x, y + s * 0.08, s * 0.11, 0, Math.PI * 2);
  p.moveTo(x - s * 0.05, y + s * 0.08);
  p.lineTo(x + s * 0.05, y + s * 0.08);
  p.lineTo(x + s * 0.08, y + s * 0.32);
  p.lineTo(x - s * 0.08, y + s * 0.32);
  p.closePath();
  return p;
}

export function padlock(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  const bw = s * 0.92;
  const bh = s * 0.92;
  const by = y + s * 0.08;
  p.arc(x, by - bh * 0.36, s * 0.4, Math.PI, 0, false);
  p.lineTo(x + s * 0.4, by);
  p.lineTo(x + s * 0.22, by);
  p.arc(x, by - bh * 0.36, s * 0.22, 0, Math.PI, true);
  p.closePath();
  p.addPath(roundRect(x - bw / 2, by, bw, bh, s * 0.18));
  p.moveTo(x + s * 0.11, by + bh * 0.36);
  p.arc(x, by + bh * 0.36, s * 0.11, 0, Math.PI * 2);
  p.moveTo(x - s * 0.05, by + bh * 0.36);
  p.lineTo(x + s * 0.05, by + bh * 0.36);
  p.lineTo(x + s * 0.08, by + bh * 0.68);
  p.lineTo(x - s * 0.08, by + bh * 0.68);
  p.closePath();
  return p;
}

export function key(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.arc(x, y - s * 0.65, s * 0.4, 0, Math.PI * 2);
  p.moveTo(x + s * 0.22, y - s * 0.65);
  p.arc(x, y - s * 0.65, s * 0.22, 0, Math.PI * 2);
  p.moveTo(x - s * 0.09, y - s * 0.25);
  p.lineTo(x + s * 0.09, y - s * 0.25);
  p.lineTo(x + s * 0.09, y + s * 0.95);
  p.lineTo(x - s * 0.09, y + s * 0.95);
  p.closePath();
  p.moveTo(x + s * 0.09, y + s * 0.6);
  p.lineTo(x + s * 0.42, y + s * 0.6);
  p.lineTo(x + s * 0.42, y + s * 0.92);
  p.lineTo(x + s * 0.25, y + s * 0.92);
  p.lineTo(x + s * 0.25, y + s * 0.76);
  p.lineTo(x + s * 0.18, y + s * 0.76);
  p.lineTo(x + s * 0.18, y + s * 0.92);
  p.lineTo(x + s * 0.09, y + s * 0.92);
  p.closePath();
  return p;
}

export function clover(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  const r = s * 0.42;
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2;
    const px = x + Math.cos(ang) * s * 0.38;
    const py = y + Math.sin(ang) * s * 0.38;
    const m = new DOMMatrix().translate(px, py).rotate((ang * 180) / Math.PI + 90);
    p.addPath(heart(0, 0, r), m);
  }
  p.moveTo(x - s * 0.05, y + s * 0.32);
  p.quadraticCurveTo(x - s * 0.08, y + s * 0.75, x - s * 0.24, y + s * 0.98);
  p.lineTo(x - s * 0.14, y + s * 1.0);
  p.quadraticCurveTo(x, y + s * 0.75, x + s * 0.05, y + s * 0.32);
  p.closePath();
  return p;
}

export function cross(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  const w = s * 0.75;
  const h = s * 1.08;
  const th = s * 0.28;
  const f = s * 0.08;
  p.moveTo(x - th / 2, y - h);
  p.lineTo(x - th / 2 - f, y - h);
  p.lineTo(x - th / 2 - f, y - h * 0.85);
  p.lineTo(x - th / 2, y - s * 0.25);
  p.lineTo(x - w + f, y - s * 0.25);
  p.lineTo(x - w, y - s * 0.25 - f);
  p.lineTo(x - w, y + s * 0.25 + f);
  p.lineTo(x - w + f, y + s * 0.25);
  p.lineTo(x - th / 2, y + s * 0.25);
  p.lineTo(x - th / 2, y + h * 0.85);
  p.lineTo(x - th / 2 - f, y + h);
  p.lineTo(x + th / 2 + f, y + h);
  p.lineTo(x + th / 2, y + h * 0.85);
  p.lineTo(x + th / 2, y + s * 0.25);
  p.lineTo(x + w - f, y + s * 0.25);
  p.lineTo(x + w, y + s * 0.25 + f);
  p.lineTo(x + w, y - s * 0.25 - f);
  p.lineTo(x + w - f, y - s * 0.25);
  p.lineTo(x + th / 2, y - s * 0.25);
  p.lineTo(x + th / 2, y - h * 0.85);
  p.lineTo(x + th / 2 + f, y - h);
  p.closePath();
  return p;
}

export function teddy(x: number, y: number, s: number): Path2D {
  const p = new Path2D();
  p.arc(x - s * 0.65, y - s * 0.55, s * 0.35, 0, Math.PI * 2);
  p.arc(x + s * 0.65, y - s * 0.55, s * 0.35, 0, Math.PI * 2);
  p.moveTo(x + s * 0.85, y + s * 0.1);
  p.ellipse(x, y + s * 0.1, s * 0.85, s * 0.75, 0, 0, Math.PI * 2);
  p.moveTo(x + s * 0.38, y + s * 0.3);
  p.ellipse(x, y + s * 0.3, s * 0.38, s * 0.28, 0, 0, Math.PI * 2);
  return p;
}
