'use client';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import ZipperDemo from './ZipperDemo';
import { Group, Seg, Slider, Toggle } from './Controls';
import { normalizeDesign, type SourceImage } from '../lib/design';
import { METALS, PULLERS, TEETH, type MetalChoice, type MetalId, type Orientation, type PullerId, type TeethId } from '../lib/zipper';
import { THEMES } from '../lib/presets';
import { CATEGORIES, LIBRARY, getLibDesign, type CatId } from '../lib/library';
import { SOUND_STYLES, type SoundStyle } from '../lib/sound';

export default function SimulatorApp() {
  const [themeId, setThemeId] = useState(`theme-${THEMES[0].id}`);
  const [metal, setMetal] = useState<MetalChoice>(THEMES[0].design.zipper.metal);
  const [teeth, setTeeth] = useState<TeethId>(THEMES[0].design.zipper.teeth);
  const [puller, setPuller] = useState<PullerId>(THEMES[0].design.zipper.puller);
  const [orient, setOrient] = useState<Orientation>('vertical');
  const [sound, setSound] = useState<SoundStyle | 'off'>('metal');
  const [volume, setVolume] = useState(80);
  const [haptics, setHaptics] = useState(true);
  const [stayOpen, setStayOpen] = useState(false);
  const [img, setImg] = useState<SourceImage | null>(null);
  const [count, setCount] = useState(0);
  const [err, setErr] = useState('');
  const stage = useRef<HTMLDivElement>(null);

  const design = useMemo(() => {
    const t = getLibDesign(themeId) ?? LIBRARY[0];
    return normalizeDesign({
      ...t.design,
      zipper: { ...t.design.zipper, metal, teeth, puller, orientation: orient, pos: orient === 'horizontal' ? 0.6 : t.design.zipper.pos },
    });
  }, [themeId, metal, teeth, puller, orient]);

  const pickTheme = (id: string) => {
    const t = getLibDesign(id);
    if (!t) return;
    setThemeId(id);
    setMetal(t.design.zipper.metal);
    setTeeth(t.design.zipper.teeth);
    setPuller(t.design.zipper.puller);
    setOrient(t.design.zipper.orientation);
  };

  const onFile = async (f?: File) => {
    setErr('');
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setErr('Please choose a JPG, PNG or WebP image.');
    try {
      const b = await createImageBitmap(f);
      setImg({ src: b, w: b.width, h: b.height });
    } catch {
      setErr('That image could not be opened.');
    }
  };

  const fullscreen = () => {
    const el = stage.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="sim">
      <div className="sim-stage" ref={stage}>
        <div className="sim-phone">
          <ZipperDemo
            design={design}
            img={img}
            hint
            label="Zipper unlock simulator"
            sound={sound === 'off' ? null : sound}
            volume={volume / 100}
            haptics={haptics}
            stayOpen={stayOpen}
            onUnlock={() => setCount((c) => c + 1)}
          />
        </div>
        <div className="sim-bar">
          <span className="muted small">Unlocks this session: {count}</span>
          <button type="button" className="btn-ghost sm" onClick={fullscreen}>
            ⛶ Full screen
          </button>
        </div>
      </div>

      <div className="studio-panel sim-panel">
        <div className="panel-body">
          <Group title="Design">
            <label className="select block">
              <span className="sr-only">Theme</span>
              <select value={themeId} onChange={(e) => pickTheme(e.target.value)}>
                {(Object.keys(CATEGORIES) as CatId[]).map((c) => (
                  <optgroup key={c} label={CATEGORIES[c].name}>
                    {LIBRARY.filter((d) => d.cat === c).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="dropzone slim">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFile(e.target.files?.[0])} />
              <strong>{img ? 'Change photo' : 'Try it with your photo'}</strong>
              <small>Stays on your device</small>
            </label>
            {img && (
              <button type="button" className="link small" onClick={() => setImg(null)}>
                Use theme background
              </button>
            )}
            {err && <p className="error">{err}</p>}
          </Group>
          <Group title="Zipper">
            <div className="metal-grid">
              {(Object.keys(METALS) as MetalId[]).map((m) => (
                <button key={m} type="button" className={`metal ${metal === m ? 'on' : ''}`} onClick={() => setMetal(m)} aria-pressed={metal === m}>
                  <i style={{ background: `linear-gradient(135deg, ${METALS[m].c[3]}, ${METALS[m].c[1]} 35%, ${METALS[m].c[0]} 50%, ${METALS[m].c[2]} 70%, ${METALS[m].c[3]})` }} aria-hidden />
                  <span>{METALS[m].name}</span>
                </button>
              ))}
            </div>
            <Seg<TeethId> label="Teeth" value={teeth} options={(Object.keys(TEETH) as TeethId[]).map((k) => ({ value: k, label: TEETH[k].name }))} onChange={setTeeth} />
            <Seg<PullerId> label="Puller" value={puller} options={(Object.keys(PULLERS) as PullerId[]).map((k) => ({ value: k, label: PULLERS[k] }))} onChange={setPuller} />
            <Seg<Orientation>
              label="Direction"
              value={orient}
              options={[
                { value: 'vertical', label: 'Vertical' },
                { value: 'horizontal', label: 'Horizontal' },
              ]}
              onChange={setOrient}
            />
          </Group>
          <Group title="Feel">
            <Seg<SoundStyle | 'off'>
              label="Sound"
              value={sound}
              options={[...(Object.keys(SOUND_STYLES) as SoundStyle[]).map((k) => ({ value: k, label: SOUND_STYLES[k].name })), { value: 'off' as const, label: 'Off' }]}
              onChange={setSound}
            />
            {sound !== 'off' && <Slider label="Volume" value={volume} min={0} max={100} onChange={setVolume} format={(v) => `${v}%`} />}
            <Toggle label="Vibration" hint="On supported Android phones" checked={haptics} onChange={setHaptics} />
            <Toggle label="Stay open after unlock" checked={stayOpen} onChange={setStayOpen} />
          </Group>
          <Link href={`/studio/?design=${themeId}&metal=${metal}&teeth=${teeth}&puller=${puller}&orient=${orient}`} className="btn-primary block">
            Make this my wallpaper
          </Link>
          <p className="muted small sim-note">
            This simulator runs in your browser for fun and previewing. It isn’t a system lock screen and can’t secure your phone.
          </p>
        </div>
      </div>
    </div>
  );
}
