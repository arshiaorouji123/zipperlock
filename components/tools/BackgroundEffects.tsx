'use client';
import { useEffect, useRef, useState } from 'react';
import { Group, Seg, Slider } from '../Controls';
import { DeviceSelect } from './Cropper';
import { DEVICES, getDevice } from '../../lib/presets';
import { canvasToBlob, downloadBlob } from '../../lib/image';
import { setHandoff } from '../../lib/projects';
import { usePixelSize } from '../../lib/hooks';

type Style = 'gradient' | 'orbs' | 'mesh' | 'waves' | 'grain';
const PALETTE = ['#0B0B0F', '#15151C', '#8B5CF6', '#D4AF37', '#C0C0C0', '#3B2A66', '#4A3B12', '#FFFFFF'];

interface FX {
  style: Style;
  a: string;
  b: string;
  angle: number;
  grain: number;
  vignette: number;
  seed: number;
}

function rnd(seed: number) {
  let s = seed || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function drawFX(x: CanvasRenderingContext2D, W: number, H: number, f: FX) {
  const r = rnd(f.seed);
  x.fillStyle = f.a;
  x.fillRect(0, 0, W, H);
  const ang = (f.angle * Math.PI) / 180;
  if (f.style === 'gradient') {
    const L = Math.hypot(W, H) / 2;
    const g = x.createLinearGradient(W / 2 - Math.cos(ang) * L, H / 2 - Math.sin(ang) * L, W / 2 + Math.cos(ang) * L, H / 2 + Math.sin(ang) * L);
    g.addColorStop(0, f.a);
    g.addColorStop(1, f.b);
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
  } else if (f.style === 'orbs' || f.style === 'mesh') {
    const n = f.style === 'orbs' ? 5 : 14;
    for (let i = 0; i < n; i++) {
      const cx = r() * W;
      const cy = r() * H;
      const rad = (f.style === 'orbs' ? 0.25 + r() * 0.35 : 0.15 + r() * 0.25) * H;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, i % 3 === 2 ? '#ffffff22' : f.b);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      x.globalAlpha = f.style === 'orbs' ? 0.7 : 0.45;
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
    }
    x.globalAlpha = 1;
  } else if (f.style === 'waves') {
    for (let i = 0; i < 10; i++) {
      x.beginPath();
      x.moveTo(0, H);
      const base = H * (0.2 + i * 0.075);
      const amp = H * (0.03 + r() * 0.05);
      const ph = r() * 6;
      for (let px = 0; px <= W; px += W / 40) x.lineTo(px, base + Math.sin((px / W) * Math.PI * 2 + ph + ang) * amp);
      x.lineTo(W, H);
      x.closePath();
      x.globalAlpha = 0.12;
      x.fillStyle = f.b;
      x.fill();
    }
    x.globalAlpha = 1;
  }
  if (f.grain > 0) {
    const t = document.createElement('canvas');
    t.width = 256;
    t.height = 256;
    const tx = t.getContext('2d')!;
    const d = tx.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = r() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    tx.putImageData(d, 0, 0);
    x.save();
    x.globalAlpha = f.grain / 250;
    x.globalCompositeOperation = 'overlay';
    const scale = Math.max(1, W / 720);
    x.scale(scale, scale);
    x.fillStyle = x.createPattern(t, 'repeat')!;
    x.fillRect(0, 0, W / scale, H / scale);
    x.restore();
  }
  if (f.vignette > 0) {
    const v = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, `rgba(0,0,0,${f.vignette / 100})`);
    x.fillStyle = v;
    x.fillRect(0, 0, W, H);
  }
}

export default function BackgroundEffects() {
  const [f, setF] = useState<FX>({ style: 'orbs', a: '#0B0B0F', b: '#8B5CF6', angle: 120, grain: 25, vignette: 40, seed: 7 });
  const [dev, setDev] = useState(DEVICES[0].id);
  const device = getDevice(dev);
  const ref = useRef<HTMLCanvasElement>(null);
  const { w, h } = usePixelSize(ref);
  const up = (p: Partial<FX>) => setF((s) => ({ ...s, ...p }));

  useEffect(() => {
    const c = ref.current;
    if (!c || w < 2) return;
    c.width = w;
    c.height = h;
    drawFX(c.getContext('2d')!, w, h, f);
  }, [f, w, h]);

  const full = () => {
    const c = document.createElement('canvas');
    c.width = device.w;
    c.height = device.h;
    drawFX(c.getContext('2d')!, c.width, c.height, f);
    return c;
  };

  const Swatches = ({ k }: { k: 'a' | 'b' }) => (
    <div className="color-row">
      {PALETTE.map((c) => (
        <button key={c} type="button" className={`dot ${f[k] === c ? 'on' : ''}`} style={{ background: c }} onClick={() => up({ [k]: c })} aria-label={c} />
      ))}
      <label className="dot custom" style={{ background: f[k] }} title="Custom">
        <input type="color" value={f[k]} onChange={(e) => up({ [k]: e.target.value })} aria-label="Custom colour" />
      </label>
    </div>
  );

  return (
    <div className="tool-layout">
      <div className="tool-stage">
        <div className="tool-phone">
          <div className="phone" style={{ aspectRatio: `${device.w} / ${device.h}` }}>
            <canvas ref={ref} className="phone-screen" role="img" aria-label="Generated background preview" />
          </div>
        </div>
      </div>
      <div className="studio-panel tool-panel">
        <div className="panel-body">
          <Group title="Effect">
            <Seg<Style>
              label="Style"
              value={f.style}
              options={[
                { value: 'gradient', label: 'Gradient' },
                { value: 'orbs', label: 'Glow orbs' },
                { value: 'mesh', label: 'Mesh' },
                { value: 'waves', label: 'Waves' },
                { value: 'grain', label: 'Grain' },
              ]}
              onChange={(v) => up({ style: v })}
            />
            <button type="button" className="btn-ghost sm" onClick={() => up({ seed: Math.floor(Math.random() * 1e6) + 1 })}>
              🎲 Shuffle layout
            </button>
          </Group>
          <Group title="Colours">
            <span className="small muted">Base</span>
            <Swatches k="a" />
            <span className="small muted">Accent</span>
            <Swatches k="b" />
          </Group>
          <Group title="Finish">
            <Slider label="Angle / phase" value={f.angle} min={0} max={360} onChange={(v) => up({ angle: v })} format={(v) => `${v}°`} />
            <Slider label="Grain" value={f.grain} min={0} max={100} onChange={(v) => up({ grain: v })} />
            <Slider label="Vignette" value={f.vignette} min={0} max={90} onChange={(v) => up({ vignette: v })} format={(v) => `${v}%`} />
          </Group>
          <Group title="Save">
            <DeviceSelect value={dev} onChange={setDev} />
            <button
              type="button"
              className="btn-primary block"
              onClick={async () => downloadBlob(await canvasToBlob(full(), 'image/png'), `zipperlock-bg-${f.style}-${device.w}x${device.h}.png`)}
            >
              Download background
            </button>
            <button
              type="button"
              className="btn-ghost block"
              onClick={async () => {
                await setHandoff(await canvasToBlob(full(), 'image/png'), `background-${f.style}.png`);
                location.href = '/studio/?handoff=1';
              }}
            >
              Add a zipper to it →
            </button>
          </Group>
        </div>
      </div>
    </div>
  );
}
