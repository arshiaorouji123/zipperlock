'use client';
import { useState } from 'react';
import ToolUpload from './ToolUpload';
import { Group, Seg } from '../Controls';
import type { SourceImage } from '../../lib/design';
import { DEVICES } from '../../lib/presets';
import { canvasToBlob, downloadBlob } from '../../lib/image';

type Mode = 'fill' | 'blur' | 'color';

function renderTo(img: SourceImage, W: number, H: number, mode: Mode, color: string) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  x.imageSmoothingQuality = 'high';
  const cover = Math.max(W / img.w, H / img.h);
  const fit = Math.min(W / img.w, H / img.h);
  const draw = (s: number) => x.drawImage(img.src, (W - img.w * s) / 2, (H - img.h * s) / 2, img.w * s, img.h * s);
  if (mode === 'fill') draw(cover);
  else {
    if (mode === 'color') {
      x.fillStyle = color;
      x.fillRect(0, 0, W, H);
    } else {
      // blurred, enlarged copy behind (downscale/upscale works everywhere)
      const t = document.createElement('canvas');
      t.width = Math.max(1, Math.round(W / 24));
      t.height = Math.max(1, Math.round(H / 24));
      const tx = t.getContext('2d')!;
      tx.drawImage(img.src, (t.width - img.w * cover / 24) / 2, (t.height - img.h * cover / 24) / 2, (img.w * cover) / 24, (img.h * cover) / 24);
      x.drawImage(t, 0, 0, W, H);
      x.fillStyle = 'rgba(0,0,0,0.25)';
      x.fillRect(0, 0, W, H);
    }
    draw(fit);
  }
  return c;
}

export default function ResolutionConverter() {
  const [img, setImg] = useState<SourceImage | null>(null);
  const [name, setName] = useState('image');
  const [sel, setSel] = useState<string[]>(['android-fhd', 'iphone-std']);
  const [mode, setMode] = useState<Mode>('fill');
  const [color, setColor] = useState('#0B0B0F');
  const [fmt, setFmt] = useState<'png' | 'jpeg'>('jpeg');
  const [busy, setBusy] = useState('');

  const one = async (id: string) => {
    const d = DEVICES.find((x) => x.id === id)!;
    const c = renderTo(img!, d.w, d.h, mode, color);
    const b = await canvasToBlob(c, `image/${fmt}`, 0.92);
    downloadBlob(b, `${name}-${d.id}-${d.w}x${d.h}.${fmt === 'png' ? 'png' : 'jpg'}`);
  };
  const all = async () => {
    for (const id of sel) {
      setBusy(`Creating ${DEVICES.find((d) => d.id === id)!.name}…`);
      await one(id);
      await new Promise((r) => setTimeout(r, 400));
    }
    setBusy(`Done — ${sel.length} file${sel.length > 1 ? 's' : ''} saved.`);
  };

  return (
    <div className="tool-cols">
      <div className="studio-panel tool-panel">
        <div className="panel-body">
          <Group title="1 · Image">
            <ToolUpload
              hasImage={!!img}
              onImage={(im, f) => {
                setImg(im);
                setName(f.name.replace(/\.[^.]+$/, ''));
              }}
            />
            {img && (
              <p className="muted small">
                Original: {img.w} × {img.h}px
              </p>
            )}
          </Group>
          <Group title="2 · How to fit">
            <Seg<Mode>
              label="Mode"
              value={mode}
              options={[
                { value: 'fill', label: 'Fill (crop edges)' },
                { value: 'blur', label: 'Fit + blurred edges' },
                { value: 'color', label: 'Fit + colour' },
              ]}
              onChange={setMode}
            />
            {mode === 'color' && (
              <label className="ctl-text">
                <span>Background colour</span>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              </label>
            )}
            <Seg<'png' | 'jpeg'> label="Format" value={fmt} options={[{ value: 'jpeg', label: 'JPEG' }, { value: 'png', label: 'PNG' }]} onChange={setFmt} />
          </Group>
        </div>
      </div>
      <div className="studio-panel tool-panel">
        <div className="panel-body">
          <Group
            title="3 · Devices"
            action={
              <button type="button" className="link small" onClick={() => setSel(sel.length === DEVICES.length ? [] : DEVICES.map((d) => d.id))}>
                {sel.length === DEVICES.length ? 'None' : 'All'}
              </button>
            }
          >
            <ul className="check-list">
              {DEVICES.map((d) => (
                <li key={d.id}>
                  <label>
                    <input type="checkbox" checked={sel.includes(d.id)} onChange={(e) => setSel(e.target.checked ? [...sel, d.id] : sel.filter((x) => x !== d.id))} />
                    <span>{d.name}</span>
                    <small>
                      {d.w}×{d.h}
                    </small>
                  </label>
                  <button type="button" className="link small" disabled={!img} onClick={() => one(d.id)}>
                    Download
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-primary block" disabled={!img || sel.length === 0} onClick={all}>
              Download {sel.length} size{sel.length === 1 ? '' : 's'}
            </button>
            {busy && (
              <p className="muted small" role="status">
                {busy}
              </p>
            )}
            <p className="muted small">Your browser may ask to allow multiple downloads.</p>
          </Group>
        </div>
      </div>
    </div>
  );
}
