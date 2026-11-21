'use client';
import { useEffect, useRef, useState } from 'react';
import ToolUpload from './ToolUpload';
import { Group, Seg, Slider } from '../Controls';
import type { SourceImage } from '../../lib/design';
import { canvasToBlob, downloadBlob } from '../../lib/image';
import { setHandoff } from '../../lib/projects';

type Mode = 'edges' | 'everywhere';
const MAX = 1600;

/**
 * Colour-key background removal. Picks the background colour (from the corners or a click),
 * then clears matching pixels — either only those connected to the image edges (flood fill),
 * or everywhere. Soft edges come from a tolerance band + optional feathering.
 */
function removeBg(src: HTMLCanvasElement, key: [number, number, number], tol: number, soft: number, mode: Mode) {
  const W = src.width;
  const H = src.height;
  const ctx = src.getContext('2d')!;
  const d = ctx.getImageData(0, 0, W, H);
  const p = d.data;
  const t = (tol / 100) * 441;
  const s = Math.max(1, (soft / 100) * 120);
  const dist = (i: number) => Math.hypot(p[i] - key[0], p[i + 1] - key[1], p[i + 2] - key[2]);
  const alpha = new Float32Array(W * H).fill(1);
  if (mode === 'everywhere') {
    for (let k = 0; k < W * H; k++) {
      const dd = dist(k * 4);
      alpha[k] = dd <= t ? 0 : dd < t + s ? (dd - t) / s : 1;
    }
  } else {
    const seen = new Uint8Array(W * H);
    const stack: number[] = [];
    for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
    for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
    while (stack.length) {
      const k = stack.pop()!;
      if (seen[k]) continue;
      seen[k] = 1;
      const dd = dist(k * 4);
      if (dd > t + s) continue;
      alpha[k] = dd <= t ? 0 : (dd - t) / s;
      if (dd > t) continue; // soft edge pixels don't spread
      const x = k % W;
      const y = (k / W) | 0;
      if (x > 0) stack.push(k - 1);
      if (x < W - 1) stack.push(k + 1);
      if (y > 0) stack.push(k - W);
      if (y < H - 1) stack.push(k + W);
    }
  }
  for (let k = 0; k < W * H; k++) p[k * 4 + 3] = Math.round(p[k * 4 + 3] * alpha[k]);
  ctx.putImageData(d, 0, 0);
}

export default function BackgroundRemoval() {
  const [img, setImg] = useState<SourceImage | null>(null);
  const [name, setName] = useState('image');
  const [key, setKey] = useState<[number, number, number] | null>(null);
  const [tol, setTol] = useState(18);
  const [soft, setSoft] = useState(30);
  const [mode, setMode] = useState<Mode>('edges');
  const out = useRef<HTMLCanvasElement>(null);
  const base = useRef<HTMLCanvasElement | null>(null);

  // load into a working canvas and auto-pick the key colour from the corners
  useEffect(() => {
    if (!img) return;
    const sc = Math.min(1, MAX / Math.max(img.w, img.h));
    const c = document.createElement('canvas');
    c.width = Math.round(img.w * sc);
    c.height = Math.round(img.h * sc);
    const x = c.getContext('2d', { willReadFrequently: true })!;
    x.drawImage(img.src, 0, 0, c.width, c.height);
    base.current = c;
    const pts = [
      [2, 2],
      [c.width - 3, 2],
      [2, c.height - 3],
      [c.width - 3, c.height - 3],
    ];
    const acc = [0, 0, 0];
    pts.forEach(([px, py]) => {
      const v = x.getImageData(px, py, 1, 1).data;
      acc[0] += v[0];
      acc[1] += v[1];
      acc[2] += v[2];
    });
    setKey([acc[0] / 4, acc[1] / 4, acc[2] / 4]);
  }, [img]);

  useEffect(() => {
    const o = out.current;
    const b = base.current;
    if (!o || !b || !key) return;
    o.width = b.width;
    o.height = b.height;
    const x = o.getContext('2d', { willReadFrequently: true })!;
    x.clearRect(0, 0, o.width, o.height);
    x.drawImage(b, 0, 0);
    const id = setTimeout(() => removeBg(o, key, tol, soft, mode), 0);
    return () => clearTimeout(id);
  }, [key, tol, soft, mode]);

  const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const b = base.current;
    if (!b) return;
    const r = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const px = Math.floor(((e.clientX - r.left) / r.width) * b.width);
    const py = Math.floor(((e.clientY - r.top) / r.height) * b.height);
    const v = b.getContext('2d')!.getImageData(px, py, 1, 1).data;
    setKey([v[0], v[1], v[2]]);
  };

  return (
    <div className="tool-layout">
      <div className="tool-stage">
        <div className="checker">
          {img ? <canvas ref={out} onClick={pick} role="img" aria-label="Result — click the background to pick its colour" /> : <p className="muted">Upload a photo with a plain background</p>}
        </div>
        {img && <p className="stage-hint">Click on the background to pick the colour to remove.</p>}
      </div>
      <div className="studio-panel tool-panel">
        <div className="panel-body">
          <Group title="Image">
            <ToolUpload
              hasImage={!!img}
              onImage={(im, f) => {
                setImg(im);
                setName(f.name.replace(/\.[^.]+$/, ''));
              }}
            />
          </Group>
          <Group title="Removal">
            <div className="key-row">
              <span className="dot" style={{ background: key ? `rgb(${key.map(Math.round).join(',')})` : 'transparent' }} aria-hidden />
              <span className="small muted">Colour being removed</span>
            </div>
            <Seg<Mode>
              label="Remove"
              value={mode}
              options={[
                { value: 'edges', label: 'Connected to edges' },
                { value: 'everywhere', label: 'Everywhere' },
              ]}
              onChange={setMode}
            />
            <Slider label="Tolerance" value={tol} min={1} max={60} onChange={setTol} />
            <Slider label="Edge softness" value={soft} min={0} max={100} onChange={setSoft} />
          </Group>
          <Group title="Save">
            <button
              type="button"
              className="btn-primary block"
              disabled={!img}
              onClick={async () => downloadBlob(await canvasToBlob(out.current!, 'image/png'), `${name}-cutout.png`)}
            >
              Download PNG (transparent)
            </button>
            <button
              type="button"
              className="btn-ghost block"
              disabled={!img}
              onClick={async () => {
                await setHandoff(await canvasToBlob(out.current!, 'image/png'), `${name}-cutout.png`);
                location.href = '/studio/?handoff=1&tab=photo';
              }}
            >
              Place on a zipper background →
            </button>
            <p className="muted small">
              Works best on studio shots, logos and screenshots with a plain or near-plain background. Busy scenes need an AI cut-out tool.
            </p>
          </Group>
        </div>
      </div>
    </div>
  );
}
