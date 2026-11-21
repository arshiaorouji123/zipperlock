'use client';
import Link from 'next/link';
import { Group, Slider } from './Controls';
import { BG_KINDS, LAYOUTS, MOTIFS, MOTIF_IDS, type ArtLayer, type ArtSpec, type BgKind, type LayoutId, type MotifId } from '../lib/art';

const MAX_LAYERS = 4;

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="color-field">
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'} onChange={(e) => onChange(e.target.value)} />
      <span>{label}</span>
    </label>
  );
}

/** Design-specific controls: every colour, decoration, layout and density of the artwork. */
export default function ArtControls({ art, onChange }: { art: ArtSpec | null | undefined; onChange: (a: ArtSpec | null) => void }) {
  if (!art) {
    return (
      <Group title="Artwork">
        <p className="muted small">
          This design uses a photo or a classic background. Pick an illustrated design from the library to get hearts, animals, sports, neon and more —
          all fully editable here.
        </p>
        <Link href="/designs/" className="btn-primary sm">
          Browse the design library
        </Link>
        <button
          type="button"
          className="btn-ghost sm"
          onClick={() =>
            onChange({
              bg: { kind: 'radial', c1: '#0b0b0f', c2: '#8b5cf6', c3: '#d4af37' },
              layers: [{ motif: 'heart', layout: 'scatter', c1: '#f43f5e', c2: '#ffe4e6', count: 14, size: 0.8, glow: 0 }],
              seed: Math.floor(Math.random() * 1e6),
            })
          }
        >
          Start a blank artwork
        </button>
      </Group>
    );
  }
  const set = (patch: Partial<ArtSpec>) => onChange({ ...art, ...patch });
  const setBg = (patch: Partial<ArtSpec['bg']>) => set({ bg: { ...art.bg, ...patch } });
  const setLayer = (i: number, patch: Partial<ArtLayer>) => set({ layers: art.layers.map((l, k) => (k === i ? { ...l, ...patch } : l)) });

  return (
    <>
      <Group
        title="Background"
        action={
          <button type="button" className="link" onClick={() => set({ seed: Math.floor(Math.random() * 1e6) })}>
            🎲 Shuffle
          </button>
        }
      >
        <label className="select block">
          <span>Scene</span>
          <select value={art.bg.kind} onChange={(e) => setBg({ kind: e.target.value as BgKind })}>
            {(Object.keys(BG_KINDS) as BgKind[]).map((k) => (
              <option key={k} value={k}>
                {BG_KINDS[k]}
              </option>
            ))}
          </select>
        </label>
        <div className="color-fields">
          <ColorField label="Colour 1" value={art.bg.c1} onChange={(v) => setBg({ c1: v })} />
          <ColorField label="Colour 2" value={art.bg.c2} onChange={(v) => setBg({ c2: v })} />
          <ColorField label="Colour 3" value={art.bg.c3} onChange={(v) => setBg({ c3: v })} />
        </div>
      </Group>

      {art.layers.map((L, i) => {
        const m = MOTIFS[L.motif];
        return (
          <Group
            key={i}
            title={`Decoration ${i + 1}`}
            action={
              <button type="button" className="link" onClick={() => set({ layers: art.layers.filter((_, k) => k !== i) })}>
                Remove
              </button>
            }
          >
            <div className="two-col">
              <label className="select block">
                <span>Motif</span>
                <select value={L.motif} onChange={(e) => setLayer(i, { motif: e.target.value as MotifId })}>
                  {MOTIF_IDS.map((k) => (
                    <option key={k} value={k}>
                      {MOTIFS[k].name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="select block">
                <span>Layout</span>
                <select value={L.layout} onChange={(e) => setLayer(i, { layout: e.target.value as LayoutId })}>
                  {(Object.keys(LAYOUTS) as LayoutId[]).map((k) => (
                    <option key={k} value={k}>
                      {LAYOUTS[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="color-fields">
              <ColorField label={m?.labels[0] ?? 'Colour'} value={L.c1} onChange={(v) => setLayer(i, { c1: v })} />
              <ColorField label={m?.labels[1] ?? 'Accent'} value={L.c2} onChange={(v) => setLayer(i, { c2: v })} />
            </div>
            {L.layout !== 'pattern' && (
              <Slider label="Amount" value={L.count} min={1} max={L.layout === 'hero' ? 4 : 40} onChange={(v) => setLayer(i, { count: v })} />
            )}
            <Slider label="Size" value={L.size} min={0.3} max={3} step={0.05} onChange={(v) => setLayer(i, { size: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <Slider label="Glow" value={L.glow} min={0} max={1} step={0.05} onChange={(v) => setLayer(i, { glow: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <Slider
              label="Opacity"
              value={Math.round((L.opacity ?? 1) * 100)}
              min={10}
              max={100}
              onChange={(v) => setLayer(i, { opacity: v / 100 })}
              format={(v) => `${v}%`}
            />
          </Group>
        );
      })}

      <Group title="More">
        {art.layers.length < MAX_LAYERS && (
          <button
            type="button"
            className="btn-ghost sm"
            onClick={() =>
              set({ layers: [...art.layers, { motif: 'sparkle', layout: 'scatter', c1: '#ffffff', c2: '#fde68a', count: 12, size: 0.5, glow: 0.5 }] })
            }
          >
            + Add decoration
          </button>
        )}
        <button type="button" className="link small" onClick={() => onChange(null)}>
          Remove artwork (use a plain background)
        </button>
      </Group>
    </>
  );
}
