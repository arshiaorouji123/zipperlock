'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DesignThumb from '../DesignThumb';
import { Seg } from '../Controls';
import { BACKGROUNDS, DEFAULT_DESIGN, FONTS, normalizeDesign, type ClockColor, type Design, type FontId } from '../../lib/design';
import { METALS, PULLERS, TEETH, type MetalId, type PullerId, type TeethId } from '../../lib/zipper';
import { encodeDesign } from '../../lib/image';

type Mood = 'any' | 'warm' | 'cool' | 'bold';
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

function randomDesign(mood: Mood): Design {
  const metals: MetalId[] =
    mood === 'warm' ? ['gold', 'rose'] : mood === 'cool' ? ['silver', 'gunmetal', 'black'] : mood === 'bold' ? ['purple', 'gold'] : (Object.keys(METALS) as MetalId[]);
  const bgs =
    mood === 'warm' ? ['midnight', 'gold-silk', 'gold-dust', 'velvet'] : mood === 'cool' ? ['carbon', 'brushed', 'silver-wave', 'midnight'] : mood === 'bold' ? ['aurora', 'velvet', 'gold-dust'] : BACKGROUNDS.map((b) => b.id);
  const vertical = Math.random() > 0.2;
  const align = pick(['left', 'center', 'right'] as const);
  return normalizeDesign({
    ...DEFAULT_DESIGN,
    bg: pick(bgs),
    zipper: {
      ...DEFAULT_DESIGN.zipper,
      metal: pick(metals),
      teeth: pick(Object.keys(TEETH) as TeethId[]),
      puller: pick(Object.keys(PULLERS) as PullerId[]),
      orientation: vertical ? 'vertical' : 'horizontal',
      pos: vertical ? pick([0.5, 0.5, 0.3, 0.7]) : pick([0.55, 0.65]),
      size: 0.85 + Math.random() * 0.45,
      rest: vertical ? 0.12 + Math.random() * 0.1 : 0.06,
      tapeColor: pick(['#15151C', '#0B0B0F', '#2A2A35', '#3B2A66']),
    },
    clock: {
      ...DEFAULT_DESIGN.clock,
      show: Math.random() > 0.15,
      font: pick(Object.keys(FONTS) as FontId[]),
      color: pick(['white', 'gold', 'silver', 'purple'] as ClockColor[]),
      align: vertical ? align : 'center',
      y: vertical ? 0.18 + Math.random() * 0.06 : 0.22,
    },
  });
}

export default function PresetGenerator() {
  const [mood, setMood] = useState<Mood>('any');
  const [list, setList] = useState<Design[]>([]);
  const shuffle = () => setList(Array.from({ length: 8 }, () => randomDesign(mood)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(shuffle, [mood]);
  return (
    <>
      <div className="gen-bar">
        <Seg<Mood>
          label="Mood"
          value={mood}
          options={[
            { value: 'any', label: 'Anything' },
            { value: 'warm', label: 'Warm metals' },
            { value: 'cool', label: 'Cool steel' },
            { value: 'bold', label: 'Bold' },
          ]}
          onChange={setMood}
        />
        <button type="button" className="btn-primary" onClick={shuffle}>
          🎲 Shuffle
        </button>
      </div>
      <div className="card-grid four">
        {list.map((d, i) => (
          <Link key={i + encodeDesign(d).slice(-8)} href={`/studio/?d=${encodeDesign(d)}`} className="card compact">
            <DesignThumb design={d} label={`Random design ${i + 1}`} />
            <h3>
              {METALS[d.zipper.metal as MetalId]?.name} · {TEETH[d.zipper.teeth].name}
            </h3>
            <span className="link small" style={{ textAlign: 'center' }}>
              Open in Studio →
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
