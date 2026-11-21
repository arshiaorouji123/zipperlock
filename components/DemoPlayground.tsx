'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ZipperDemo from './ZipperDemo';
import { DEFAULT_DESIGN, BACKGROUNDS, type Design } from '../lib/design';
import { METALS, PULLERS, type MetalId, type PullerId } from '../lib/zipper';

export default function DemoPlayground() {
  const [metal, setMetal] = useState<MetalId>('gold');
  const [puller, setPuller] = useState<PullerId>('heartLock');
  const [bg, setBg] = useState('bg-cute-kitty');
  const design: Design = useMemo(
    () => ({
      ...DEFAULT_DESIGN,
      bg,
      zipper: { ...DEFAULT_DESIGN.zipper, metal, puller },
      clock: { ...DEFAULT_DESIGN.clock, color: metal === 'gold' ? 'gold' : metal === 'silver' ? 'silver' : 'white' },
    }),
    [metal, puller, bg],
  );
  return (
    <div className="playground">
      <div className="playground-phone">
        <ZipperDemo design={design} hint label="Zipper unlock simulator" />
      </div>
      <div className="playground-ctl">
        <h3>Try it</h3>
        <p className="muted">Grab the puller and drag it down. Let go past halfway and it unlocks; stop early and it zips back.</p>
        <div className="mini-label">Finish</div>
        <div className="chip-row">
          {(Object.keys(METALS) as MetalId[]).map((m) => (
            <button key={m} type="button" className={`chip ${metal === m ? 'on' : ''}`} onClick={() => setMetal(m)} aria-pressed={metal === m}>
              <i
                aria-hidden
                style={{ background: `linear-gradient(135deg, ${METALS[m].c[3]}, ${METALS[m].c[0]} 50%, ${METALS[m].c[2]})` }}
              />
              {METALS[m].name}
            </button>
          ))}
        </div>
        <div className="mini-label">Puller</div>
        <div className="chip-row">
          {(Object.keys(PULLERS) as PullerId[]).map((p) => (
            <button key={p} type="button" className={`chip ${puller === p ? 'on' : ''}`} onClick={() => setPuller(p)} aria-pressed={puller === p}>
              {PULLERS[p]}
            </button>
          ))}
        </div>
        <div className="mini-label">Wallpaper Background</div>
        <div className="chip-row">
          {[
            { id: 'bg-cute-kitty', name: '🐱 Cute Kitty' },
            { id: 'bg-black-rose', name: '🌹 Royal Rose' },
            { id: 'bg-fire-wolf', name: '🔥 Fire Wolf' },
            { id: 'bg-supercar-red', name: '🏎️ Red Supercar' },
            { id: 'bg-ice-tiger', name: '❄️ Ice Tiger' },
            { id: 'bg-candy-wonderland', name: '🍬 Candy Land' },
          ].map((b) => (
            <button key={b.id} type="button" className={`chip ${bg === b.id ? 'on' : ''}`} onClick={() => setBg(b.id)} aria-pressed={bg === b.id}>
              {b.name}
            </button>
          ))}
        </div>
        <Link href={`/studio/?metal=${metal}&bg=${bg}`} className="btn-primary">
          Open this in the Studio
        </Link>
      </div>
    </div>
  );
}
