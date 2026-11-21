'use client';
import { useEffect, useRef, useState } from 'react';
import { Group, Slider } from '../Controls';
import { createZipSound, SOUND_STYLES, type SoundStyle, type ZipSound } from '../../lib/sound';
import { animate } from '../../lib/hooks';

export default function SoundPreview() {
  const snd = useRef<ZipSound | null>(null);
  const [vol, setVol] = useState(80);
  const [active, setActive] = useState<SoundStyle>('metal');
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const pad = useRef<{ x: number; t: number } | null>(null);
  const cancel = useRef<() => void>(() => {});

  const ensure = (s: SoundStyle) => {
    if (!snd.current) snd.current = createZipSound(s, vol / 100);
    snd.current?.setStyle(s);
    snd.current?.setVolume(vol / 100);
    return snd.current;
  };
  useEffect(() => () => snd.current?.dispose(), []);
  useEffect(() => snd.current?.setVolume(vol / 100), [vol]);

  const play = (s: SoundStyle, ms: number) => {
    setActive(s);
    const a = ensure(s);
    if (!a) return;
    cancel.current();
    setPlaying(true);
    let last = 0;
    let lt = performance.now();
    cancel.current = animate(
      0,
      1,
      ms,
      (v) => {
        const now = performance.now();
        a.update(((v - last) / Math.max(1, now - lt)) * 1000);
        last = v;
        lt = now;
        setPos(v);
      },
      () => {
        a.update(0);
        a.click();
        setPlaying(false);
        setTimeout(() => setPos(0), 400);
      },
    );
  };

  return (
    <div className="tool-cols">
      <div className="studio-panel tool-panel">
        <div className="panel-body">
          <Group title="Sounds">
            {(Object.keys(SOUND_STYLES) as SoundStyle[]).map((s) => (
              <div key={s} className={`sound-row ${active === s ? 'on' : ''}`}>
                <div>
                  <b>{SOUND_STYLES[s].name}</b>
                  <small className="muted">
                    {s === 'metal' ? 'Bright, crisp teeth — jeans & jackets' : s === 'coil' ? 'Soft, fast purr — bags & dresses' : 'Deep, clicky — outdoor gear'}
                  </small>
                </div>
                <div className="btn-row">
                  <button type="button" className="btn-ghost sm" onClick={() => play(s, 450)} disabled={playing}>
                    ▶ Fast
                  </button>
                  <button type="button" className="btn-ghost sm" onClick={() => play(s, 1400)} disabled={playing}>
                    ▶ Slow
                  </button>
                </div>
              </div>
            ))}
          </Group>
          <Group title="Volume">
            <Slider label="Volume" value={vol} min={0} max={100} onChange={setVol} format={(v) => `${v}%`} />
          </Group>
        </div>
      </div>
      <div className="studio-panel tool-panel">
        <div className="panel-body">
          <Group title="Zip it yourself">
            <p className="muted small">Drag across the strip — the sound follows your speed. Selected: {SOUND_STYLES[active].name}.</p>
            <div
              className="zip-pad"
              role="slider"
              aria-label="Zipper sound pad"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos * 100)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') play(active, 700);
              }}
              onPointerDown={(e) => {
                ensure(active);
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                const r = e.currentTarget.getBoundingClientRect();
                pad.current = { x: (e.clientX - r.left) / r.width, t: performance.now() };
              }}
              onPointerMove={(e) => {
                const p = pad.current;
                if (!p) return;
                const r = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
                const now = performance.now();
                snd.current?.update(((x - p.x) / Math.max(1, now - p.t)) * 1000);
                p.x = x;
                p.t = now;
                setPos(x);
              }}
              onPointerUp={() => {
                pad.current = null;
                snd.current?.update(0);
              }}
            >
              <div className="zip-pad-open" style={{ width: `${pos * 100}%` }} />
              <div className="zip-pad-puller" style={{ left: `${pos * 100}%` }} />
            </div>
            <p className="muted small">Sounds are generated live in your browser — no audio files. The same sounds play in the Simulator and the Studio’s Test unlock.</p>
          </Group>
        </div>
      </div>
    </div>
  );
}
