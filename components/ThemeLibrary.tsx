'use client';
import Link from 'next/link';
import { useState } from 'react';
import DesignThumb from './DesignThumb';
import { COLLECTIONS, THEMES, type Collection } from '../lib/presets';
import { getMetal } from '../lib/zipper';

export default function ThemeLibrary() {
  const [filter, setFilter] = useState<Collection | 'all'>('all');
  const list = THEMES.filter((t) => filter === 'all' || t.collection === filter);
  return (
    <>
      <div className="chip-row filter-row" role="radiogroup" aria-label="Collection">
        <button type="button" role="radio" aria-checked={filter === 'all'} className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
          All ({THEMES.length})
        </button>
        {(Object.keys(COLLECTIONS) as Collection[]).map((c) => (
          <button key={c} type="button" role="radio" aria-checked={filter === c} className={`chip ${filter === c ? 'on' : ''}`} onClick={() => setFilter(c)}>
            {COLLECTIONS[c].name}
          </button>
        ))}
      </div>
      {filter !== 'all' && <p className="muted">{COLLECTIONS[filter].blurb}</p>}
      <div className="card-grid four">
        {list.map((t) => (
          <article key={t.id} className="card">
            <DesignThumb design={t.design} label={`${t.name} theme preview`} />
            <h3>{t.name}</h3>
            <p className="muted small">{t.tagline}</p>
            <p className="tags">
              <span>{getMetal(t.design.zipper).name}</span>
              <span>{COLLECTIONS[t.collection].name}</span>
            </p>
            <div className="card-actions">
              <Link href={`/studio/?theme=${t.id}`} className="btn-primary sm">
                Customize
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
