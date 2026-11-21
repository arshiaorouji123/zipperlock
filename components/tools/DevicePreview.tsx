'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ToolUpload from './ToolUpload';
import { Toggle } from '../Controls';
import { renderDesign, type SourceImage } from '../../lib/design';
import { loadDraft } from '../../lib/projects';
import { useTick } from '../../lib/hooks';

const FRAMES = [
  { id: 'android', name: 'Android (20:9)', w: 1080, h: 2400, ui: 'android' as const },
  { id: 'iphone', name: 'iPhone (19.5:9)', w: 1179, h: 2556, ui: 'ios' as const },
  { id: 'ipad', name: 'iPad (portrait)', w: 1640, h: 2360, ui: 'ios' as const },
];

function Frame({ f, img, draft, overlay }: { f: (typeof FRAMES)[number]; img: SourceImage | null; draft: boolean; overlay: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tick = useTick();
  const [clock, setClock] = useState({ time: '', date: '' });
  useEffect(() => {
    const now = new Date();
    setClock({
      time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, ''),
      date: now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
    });
  }, [tick]);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const W = Math.round(f.w / 3);
    const H = Math.round(f.h / 3);
    c.width = W;
    c.height = H;
    if (img) {
      const x = c.getContext('2d')!;
      const s = Math.max(W / img.w, H / img.h);
      x.drawImage(img.src, (W - img.w * s) / 2, (H - img.h * s) / 2, img.w * s, img.h * s);
    } else if (draft) {
      const d = loadDraft();
      if (d) renderDesign(c, d, null);
    }
  }, [img, draft, f]);
  const { time, date } = clock;
  return (
    <figure className="dp-frame">
      <div className={`phone ${f.id === 'ipad' ? 'tablet' : ''}`} style={{ aspectRatio: `${f.w} / ${f.h}` }}>
        <canvas ref={ref} className="phone-screen" role="img" aria-label={`Wallpaper on ${f.name}`} />
        {f.id !== 'ipad' && <span className="phone-island" aria-hidden />}
        {overlay && (
          <div className={`sys-ui ${f.ui}`} aria-hidden>
            <span className="sys-date">{date}</span>
            <span className="sys-time">{time}</span>
            <span className="sys-bottom">{f.ui === 'ios' ? '— swipe up —' : '🔒  Swipe to unlock'}</span>
          </div>
        )}
      </div>
      <figcaption>{f.name}</figcaption>
    </figure>
  );
}

export default function DevicePreview() {
  const [img, setImg] = useState<SourceImage | null>(null);
  const [draft, setDraft] = useState(false);
  const [overlay, setOverlay] = useState(true);
  useEffect(() => setDraft(!!loadDraft()), []);
  return (
    <>
      <div className="dp-controls">
        <div style={{ flex: 1, minWidth: 240 }}>
          <ToolUpload hasImage={!!img} onImage={(im) => setImg(im)} label="Upload a wallpaper to preview" />
        </div>
        <div className="dp-side">
          <Toggle label="Show system clock overlay" hint="Approximate lock-screen layout to check overlaps" checked={overlay} onChange={setOverlay} />
          {!img && draft && <p className="muted small">Showing your latest Studio design. Upload an image to preview something else.</p>}
          {!img && !draft && (
            <p className="muted small">
              No image yet — upload one or <Link href="/studio/">design one in the Studio</Link>.
            </p>
          )}
        </div>
      </div>
      <div className="dp-grid">
        {FRAMES.map((f) => (
          <Frame key={f.id} f={f} img={img} draft={draft} overlay={overlay} />
        ))}
      </div>
      <p className="muted small">The overlay is an approximation — exact clock size and position vary by phone model, OS version and your lock-screen settings.</p>
    </>
  );
}
