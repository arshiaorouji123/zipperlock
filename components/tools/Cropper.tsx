'use client';
import { useEffect, useRef, useState } from 'react';
import ToolUpload from './ToolUpload';
import { Group, Seg, Slider, Toggle } from '../Controls';
import { DEFAULT_ADJUST, drawImageAdjusted, type Adjust, type SourceImage } from '../../lib/design';
import { DEVICES, getDevice } from '../../lib/presets';
import { canvasToBlob, downloadBlob } from '../../lib/image';
import { setHandoff } from '../../lib/projects';
import { usePixelSize } from '../../lib/hooks';

export function DeviceSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="select block">
      <span>Device</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {(['Android', 'iPhone', 'Tablet'] as const).map((g) => (
          <optgroup key={g} label={g}>
            {DEVICES.filter((d) => d.group === g).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.w}×{d.h}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

export default function Cropper() {
  const [img, setImg] = useState<SourceImage | null>(null);
  const [name, setName] = useState('photo');
  const [dev, setDev] = useState(DEVICES[0].id);
  const [a, setA] = useState<Adjust>({ ...DEFAULT_ADJUST, dim: 0 });
  const [grid, setGrid] = useState(true);
  const [fmt, setFmt] = useState<'png' | 'jpeg'>('jpeg');
  const [msg, setMsg] = useState('');
  const device = getDevice(dev);
  const ref = useRef<HTMLCanvasElement>(null);
  const { w, h } = usePixelSize(ref);
  const drag = useRef<{ x: number; y: number; ax: number; ay: number } | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || w < 2) return;
    c.width = w;
    c.height = h;
    const x = c.getContext('2d')!;
    x.fillStyle = '#15151C';
    x.fillRect(0, 0, w, h);
    if (img) drawImageAdjusted(x, w, h, img, a);
    if (grid) {
      x.strokeStyle = 'rgba(255,255,255,0.35)';
      x.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        x.beginPath();
        x.moveTo((w * i) / 3, 0);
        x.lineTo((w * i) / 3, h);
        x.moveTo(0, (h * i) / 3);
        x.lineTo(w, (h * i) / 3);
        x.stroke();
      }
    }
  }, [img, a, w, h, grid]);

  const exportCanvas = () => {
    const c = document.createElement('canvas');
    c.width = device.w;
    c.height = device.h;
    const x = c.getContext('2d')!;
    x.fillStyle = '#000';
    x.fillRect(0, 0, c.width, c.height);
    drawImageAdjusted(x, c.width, c.height, img!, a);
    return c;
  };

  return (
    <div className="tool-layout">
      <div className="tool-stage">
        <div className="tool-phone">
          <div className="phone" style={{ aspectRatio: `${device.w} / ${device.h}` }}>
            <canvas
              ref={ref}
              className="phone-screen"
              role="img"
              aria-label="Crop preview — drag to move, scroll or pinch to zoom"
              onPointerDown={(e) => {
                if (!img) return;
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                drag.current = { x: e.clientX, y: e.clientY, ax: a.x, ay: a.y };
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d) return;
                const r = ref.current!.getBoundingClientRect();
                setA((s) => ({ ...s, x: d.ax + (e.clientX - d.x) / r.width, y: d.ay + (e.clientY - d.y) / r.height }));
              }}
              onPointerUp={() => (drag.current = null)}
              onWheel={(e) => img && setA((s) => ({ ...s, zoom: Math.max(1, Math.min(5, s.zoom * (e.deltaY < 0 ? 1.06 : 1 / 1.06))) }))}
            />
            {!img && <span className="phone-loading">Upload a photo to start</span>}
          </div>
        </div>
        <p className="stage-hint">Drag to reposition · scroll to zoom · the frame is your full screen</p>
      </div>
      <div className="studio-panel tool-panel">
        <div className="panel-body">
          <Group title="Image">
            <ToolUpload
              hasImage={!!img}
              onImage={(im, f) => {
                setImg(im);
                setName(f.name.replace(/\.[^.]+$/, ''));
                setA({ ...DEFAULT_ADJUST, dim: 0 });
              }}
            />
          </Group>
          <Group title="Frame">
            <DeviceSelect value={dev} onChange={setDev} />
            <Slider label="Zoom" value={a.zoom} min={1} max={5} step={0.01} onChange={(v) => setA({ ...a, zoom: v })} format={(v) => `${v.toFixed(2)}×`} disabled={!img} />
            <Slider label="Rotate" value={a.rotate} min={-180} max={180} onChange={(v) => setA({ ...a, rotate: v })} format={(v) => `${v}°`} disabled={!img} />
            <div className="btn-row">
              <button type="button" className="btn-ghost sm" disabled={!img} onClick={() => setA({ ...a, rotate: ((a.rotate + 270) % 360) - 180 })}>
                Rotate 90°
              </button>
              <button type="button" className="btn-ghost sm" disabled={!img} onClick={() => setA({ ...a, x: 0, y: 0, zoom: 1, rotate: 0 })}>
                Reset
              </button>
            </div>
            <Toggle label="Rule-of-thirds grid" checked={grid} onChange={setGrid} />
          </Group>
          <Group title="Save">
            <Seg<'png' | 'jpeg'> label="Format" value={fmt} options={[{ value: 'jpeg', label: 'JPEG' }, { value: 'png', label: 'PNG' }]} onChange={setFmt} />
            <button
              type="button"
              className="btn-primary block"
              disabled={!img}
              onClick={async () => {
                const b = await canvasToBlob(exportCanvas(), `image/${fmt}`, 0.93);
                downloadBlob(b, `${name}-${device.w}x${device.h}.${fmt === 'png' ? 'png' : 'jpg'}`);
                setMsg(`Saved at ${device.w}×${device.h}.`);
              }}
            >
              Download cropped image
            </button>
            <button
              type="button"
              className="btn-ghost block"
              disabled={!img}
              onClick={async () => {
                const b = await canvasToBlob(exportCanvas(), 'image/png');
                await setHandoff(b, `${name}-cropped.png`);
                location.href = '/studio/?handoff=1';
              }}
            >
              Add a zipper to it →
            </button>
            {msg && <p className="muted small">{msg}</p>}
          </Group>
        </div>
      </div>
    </div>
  );
}
