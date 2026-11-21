'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import DesignThumb from './DesignThumb';
import ZipperDemo from './ZipperDemo';
import { CATEGORIES, COLORS, LIBRARY, STYLES, type CatId, type ColorId, type LibDesign, type StyleId } from '../lib/library';
import { getMetal, PULLERS, TEETH } from '../lib/zipper';
import { MOTIFS } from '../lib/art';
import { renderDesign } from '../lib/design';
import { DEVICES, getDevice } from '../lib/presets';
import { canvasToBlob, downloadBlob } from '../lib/image';
import { track } from '../lib/analytics';

type Sort = 'featured' | 'name' | 'level-desc' | 'level-asc';
const PAGE = 24;
const hayCache = new Map<string, string>();
/** Searchable text: name, category, styles, colours, decorations and zipper parts. */
function hay(d: LibDesign) {
  let h = hayCache.get(d.id);
  if (!h) {
    const art = d.design.art?.layers.map((l) => MOTIFS[l.motif]?.name ?? l.motif).join(' ') ?? '';
    h = `${d.name} ${CATEGORIES[d.cat].name} ${d.styles.join(' ')} ${d.colors.join(' ')} ${art} ${PULLERS[d.design.zipper.puller]} ${TEETH[d.design.zipper.teeth].name} ${getMetal(d.design.zipper).name}`.toLowerCase();
    hayCache.set(d.id, h);
  }
  return h;
}
const LEVELS = ['Basic', 'Stylish', 'Decorative', 'Premium', 'Ultra creative'];

function Level({ n }: { n: number }) {
  return (
    <span className="lvl" role="img" title={`Level ${n} — ${LEVELS[n - 1]}`} aria-label={`Level ${n}, ${LEVELS[n - 1]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? 'on' : ''} />
      ))}
    </span>
  );
}

function Preview({ d, onClose, onStep }: { d: LibDesign; onClose: () => void; onStep: (dir: 1 | -1) => void }) {
  const [sound, setSound] = useState(false);
  const [dev, setDev] = useState(DEVICES[0].id);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [onClose, onStep]);
  useEffect(() => track('design_preview', { design_id: d.id, category: d.cat }), [d]);

  const quick = async () => {
    setBusy(true);
    const device = getDevice(dev);
    const c = document.createElement('canvas');
    c.width = device.w;
    c.height = device.h;
    renderDesign(c, d.design, null);
    downloadBlob(await canvasToBlob(c, 'image/png'), `zipperlock-${d.id}-${device.w}x${device.h}.png`);
    track('image_downloaded', { design_id: d.id, source: 'library' });
    setBusy(false);
  };

  return (
    <div className="modal lib-modal" role="dialog" aria-modal="true" aria-labelledby="pv-title" onClick={onClose}>
      <div className="lib-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="icon-btn close" onClick={onClose} aria-label="Close preview">
          ✕
        </button>
        <div className="lib-modal-phone">
          <ZipperDemo design={d.design} hint label={`${d.name} — drag the puller to unzip`} sound={sound ? 'metal' : null} />
        </div>
        <div className="lib-modal-info">
          <p className="eyebrow">{CATEGORIES[d.cat].name}</p>
          <h2 id="pv-title">{d.name}</h2>
          <Level n={d.level} />
          <p className="muted small">Drag the puller down to try the unlock. Every colour, decoration and zipper part can be changed in the Studio.</p>
          <dl className="spec">
            <div>
              <dt>Finish</dt>
              <dd>{getMetal(d.design.zipper).name}</dd>
            </div>
            <div>
              <dt>Teeth</dt>
              <dd>{TEETH[d.design.zipper.teeth].name}</dd>
            </div>
            <div>
              <dt>Puller</dt>
              <dd>{PULLERS[d.design.zipper.puller]}</dd>
            </div>
            <div>
              <dt>Style</dt>
              <dd>{d.styles.map((s) => STYLES[s]).join(', ')}</dd>
            </div>
          </dl>
          <div className="chip-row">
            {d.colors.map((c) => (
              <span key={c} className="chip tiny">
                <i style={{ background: COLORS[c].css }} aria-hidden />
                {COLORS[c].name}
              </span>
            ))}
          </div>
          <label className="mini-toggle">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> Zipper sound
          </label>
          <Link href={`/studio/?design=${d.id}`} className="btn-primary block" onClick={() => track('design_selected', { design_id: d.id })}>
            Customize in Studio
          </Link>
          <div className="quick-dl">
            <select value={dev} onChange={(e) => setDev(e.target.value)} aria-label="Download size">
              {DEVICES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} · {x.w}×{x.h}
                </option>
              ))}
            </select>
            <button type="button" className="btn-ghost sm" onClick={quick} disabled={busy}>
              {busy ? 'Preparing…' : 'Download PNG'}
            </button>
          </div>
          <div className="btn-row step-row">
            <button type="button" className="btn-ghost sm" onClick={() => onStep(-1)}>
              ← Previous
            </button>
            <button type="button" className="btn-ghost sm" onClick={() => onStep(1)}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LibraryBrowser({ initialCat, lockCat = false }: { initialCat?: CatId; lockCat?: boolean }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CatId | 'all'>(initialCat ?? 'all');
  const [color, setColor] = useState<ColorId | 'all'>('all');
  const [style, setStyle] = useState<StyleId | 'all'>('all');
  const [level, setLevel] = useState<number>(0);
  const [sort, setSort] = useState<Sort>('featured');
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);

  // read ?q= &cat= &color= from the URL once (shareable filters)
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('q')) setQ(p.get('q')!);
    const c = p.get('cat') as CatId | null;
    if (!lockCat && c && c in CATEGORIES) setCat(c);
    const col = p.get('color') as ColorId | null;
    if (col && col in COLORS) setColor(col);
    const d = p.get('design');
    if (d) setOpen(d);
  }, [lockCat]);

  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let r = LIBRARY.filter(
      (d) =>
        (cat === 'all' || d.cat === cat) &&
        (color === 'all' || d.colors.includes(color)) &&
        (style === 'all' || d.styles.includes(style)) &&
        (!level || d.level === level) &&
        words.every((w) => hay(d).includes(w)),
    );
    if (sort === 'name') r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'level-desc') r = [...r].sort((a, b) => b.level - a.level || a.order - b.order);
    else if (sort === 'level-asc') r = [...r].sort((a, b) => a.level - b.level || a.order - b.order);
    else if (cat === 'all') {
      // featured: interleave categories so the first page shows the whole range
      const buckets = new Map<string, LibDesign[]>();
      r.forEach((d) => buckets.set(d.cat, [...(buckets.get(d.cat) ?? []), d]));
      const out: LibDesign[] = [];
      const arrs = [...buckets.values()].map((a) => [...a].sort((x, y) => y.level - x.level));
      for (let i = 0; out.length < r.length; i++) arrs.forEach((a) => a[i] && out.push(a[i]));
      r = out;
    }
    return r;
  }, [q, cat, color, style, level, sort]);

  useEffect(() => setShown(PAGE), [q, cat, color, style, level, sort]);
  useEffect(() => {
    if (!q.trim()) return;
    const id = setTimeout(() => track('library_search', { search_term: q.trim() }), 800);
    return () => clearTimeout(id);
  }, [q]);

  const idx = open ? list.findIndex((d) => d.id === open) : -1;
  const current = open ? (LIBRARY.find((d) => d.id === open) ?? null) : null;
  const step = (dir: 1 | -1) => {
    if (!list.length) return;
    const i = idx < 0 ? 0 : (idx + dir + list.length) % list.length;
    setOpen(list[i].id);
  };
  const reset = () => {
    setQ('');
    if (!lockCat) setCat('all');
    setColor('all');
    setStyle('all');
    setLevel(0);
    setSort('featured');
  };

  return (
    <div className="lib">
      <div className="lib-filters">
        <label className="lib-search">
          <span className="sr-only">Search designs</span>
          <input type="search" placeholder="Search: heart, football, cat, neon, gold…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        {!lockCat && (
          <div className="chip-row lib-cats" role="radiogroup" aria-label="Category">
            <button type="button" role="radio" aria-checked={cat === 'all'} className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
              All
            </button>
            {(Object.keys(CATEGORIES) as CatId[]).map((c) => (
              <button key={c} type="button" role="radio" aria-checked={cat === c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
                {CATEGORIES[c].name}
              </button>
            ))}
          </div>
        )}
        <div className="lib-selects">
          <label className="select">
            <span className="sr-only">Colour</span>
            <select value={color} onChange={(e) => setColor(e.target.value as ColorId | 'all')} aria-label="Colour">
              <option value="all">All colours</option>
              {(Object.keys(COLORS) as ColorId[]).map((c) => (
                <option key={c} value={c}>
                  {COLORS[c].name}
                </option>
              ))}
            </select>
          </label>
          <label className="select">
            <span className="sr-only">Style</span>
            <select value={style} onChange={(e) => setStyle(e.target.value as StyleId | 'all')} aria-label="Style">
              <option value="all">All styles</option>
              {(Object.keys(STYLES) as StyleId[]).map((s) => (
                <option key={s} value={s}>
                  {STYLES[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="select">
            <span className="sr-only">Complexity</span>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value))} aria-label="Complexity level">
              <option value={0}>All levels</option>
              {LEVELS.map((l, i) => (
                <option key={l} value={i + 1}>
                  Level {i + 1} · {l}
                </option>
              ))}
            </select>
          </label>
          <label className="select">
            <span className="sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
              <option value="featured">Featured</option>
              <option value="level-desc">Most detailed first</option>
              <option value="level-asc">Simplest first</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
        <p className="muted small lib-count" aria-live="polite">
          {list.length} design{list.length === 1 ? '' : 's'}
          {(q || color !== 'all' || style !== 'all' || level || (!lockCat && cat !== 'all')) && (
            <>
              {' · '}
              <button type="button" className="link small" onClick={reset}>
                Clear filters
              </button>
            </>
          )}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <h2>No designs match</h2>
          <p className="muted">Try another colour or a shorter search.</p>
          <button type="button" className="btn-ghost" onClick={reset}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="lib-grid">
          {list.slice(0, shown).map((d) => (
            <button key={d.id} type="button" className="card lib-card" onClick={() => setOpen(d.id)} aria-label={`Preview ${d.name}`}>
              <DesignThumb design={d.design} label={`${d.name} zipper lock screen`} />
              <span className="lib-name">{d.name}</span>
              <span className="lib-meta">
                <span>{CATEGORIES[d.cat].name}</span>
                <Level n={d.level} />
              </span>
            </button>
          ))}
        </div>
      )}
      {shown < list.length && (
        <div className="load-more">
          <button type="button" className="btn-ghost" onClick={() => setShown((s) => s + PAGE)}>
            Show more ({list.length - shown} left)
          </button>
        </div>
      )}
      {current && <Preview d={current} onClose={() => setOpen(null)} onStep={step} />}
    </div>
  );
}
