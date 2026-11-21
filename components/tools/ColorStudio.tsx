'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ZipperDemo from '../ZipperDemo';
import { Group, Seg } from '../Controls';
import { DEFAULT_DESIGN, normalizeDesign } from '../../lib/design';
import { metalFromColor, PULLERS, TEETH, type PullerId, type TeethId } from '../../lib/zipper';

const STARTS = ['#D4AF37', '#C0C0C0', '#8B5CF6', '#B76E79', '#2E8B57', '#1E90FF', '#B22222', '#FF8C00', '#222222', '#E5E4E2'];

export default function ColorStudio() {
  const [hex, setHex] = useState('#8B5CF6');
  const [teeth, setTeeth] = useState<TeethId>('classic');
  const [puller, setPuller] = useState<PullerId>('classic');
  const [copied, setCopied] = useState(false);
  const metal = useMemo(() => metalFromColor(hex), [hex]);
  const design = useMemo(
    () =>
      normalizeDesign({
        ...DEFAULT_DESIGN,
        bg: 'midnight',
        zipper: { ...DEFAULT_DESIGN.zipper, metal: 'custom', customColor: hex, teeth, puller, size: 1.25 },
        clock: { ...DEFAULT_DESIGN.clock, show: false },
      }),
    [hex, teeth, puller],
  );
  const css = `linear-gradient(135deg, ${metal.c[3]} 0%, ${metal.c[1]} 30%, ${metal.c[0]} 48%, ${metal.c[2]} 68%, ${metal.c[3]} 100%)`;
  const valid = /^#[0-9a-f]{6}$/i.test(hex);

  return (
    <div className="tool-layout">
      <div className="tool-stage">
        <div className="tool-phone">
          <ZipperDemo design={design} hint={false} label="Custom colour zipper preview" />
        </div>
      </div>
      <div className="studio-panel tool-panel">
        <div className="panel-body">
          <Group title="Base colour">
            <div className="color-pick">
              <input type="color" value={valid ? hex : '#8B5CF6'} onChange={(e) => setHex(e.target.value.toUpperCase())} aria-label="Pick colour" />
              <input
                type="text"
                value={hex}
                maxLength={7}
                onChange={(e) => setHex(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
                aria-label="Hex colour"
                spellCheck={false}
              />
            </div>
            <div className="color-row">
              {STARTS.map((c) => (
                <button key={c} type="button" className={`dot ${hex === c ? 'on' : ''}`} style={{ background: metalFromColor(c).c[2] }} onClick={() => setHex(c)} aria-label={c} />
              ))}
            </div>
          </Group>
          <Group title="Generated metal">
            <div className="ramp">
              {['Highlight', 'Light', 'Base', 'Shadow', 'Edge'].map((n, i) => (
                <div key={n}>
                  <i style={{ background: i < 4 ? metal.c[i] : metal.edge }} />
                  <span>{n}</span>
                </div>
              ))}
            </div>
            <div className="ramp-bar" style={{ background: css }} />
            <button
              type="button"
              className="btn-ghost sm"
              onClick={() => {
                navigator.clipboard?.writeText(`background: ${css};`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? 'Copied ✓' : 'Copy CSS gradient'}
            </button>
          </Group>
          <Group title="Preview with">
            <Seg<TeethId> label="Teeth" value={teeth} options={(Object.keys(TEETH) as TeethId[]).map((k) => ({ value: k, label: TEETH[k].name }))} onChange={setTeeth} />
            <Seg<PullerId> label="Puller" value={puller} options={(Object.keys(PULLERS) as PullerId[]).map((k) => ({ value: k, label: PULLERS[k] }))} onChange={setPuller} />
          </Group>
          {valid && (
            <Link href={`/studio/?custom=${hex.slice(1)}&teeth=${teeth}&puller=${puller}&tab=zipper`} className="btn-primary block">
              Use this colour in the Studio
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
