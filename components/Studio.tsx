'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BACKGROUNDS,
  compose,
  DEFAULT_ADJUST,
  DEFAULT_DESIGN,
  FONTS,
  normalizeDesign,
  renderCover,
  renderDesign,
  renderHomeScreen,
  type Layers,
  type ClockColor,
  type Design,
  type FontId,
  type SourceImage,
} from '../lib/design';
import {
  hitPuller,
  layout,
  METALS,
  progressFromFrameY,
  PULLERS,
  TEETH,
  toFrame,
  getMetal,
  type MetalChoice,
  type MetalId,
  type Orientation,
  type PullerId,
  type TeethId,
} from '../lib/zipper';
import { DEVICES, getDevice, getTheme, THEMES } from '../lib/presets';
import { animate, usePixelSize, useTick } from '../lib/hooks';
import { Group, Seg, Slider, Toggle } from './Controls';
import ArtControls from './ArtControls';
import { getLibDesign } from '../lib/library';
import { track } from '../lib/analytics';
import { useHistory } from '../lib/history';
import { ACCEPT, decodeDesign, decodeImage, downloadBlob, encodeDesign, validateImage } from '../lib/image';
import { getProject, loadDraft, newId, saveDraft, saveProject, takeHandoff } from '../lib/projects';
import { createZipSound, type ZipSound } from '../lib/sound';

type Tab = 'photo' | 'art' | 'zipper' | 'clock' | 'layers' | 'export';
const TABS: { id: Tab; label: string }[] = [
  { id: 'photo', label: 'Photo' },
  { id: 'art', label: 'Artwork' },
  { id: 'zipper', label: 'Zipper' },
  { id: 'clock', label: 'Clock & Text' },
  { id: 'layers', label: 'Layers' },
  { id: 'export', label: 'Download' },
];

const TAPE_COLORS = ['#15151C', '#0B0B0F', '#2A2A35', '#3B2A66', '#4A3B12', '#8E8E96'];

const clone = (d: Design): Design => normalizeDesign(JSON.parse(JSON.stringify(d)));

function BgSwatch({ id, name, active, onPick }: { id: string; name: string; active: boolean; onPick: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = 90;
    c.height = 180;
    const draw = () => {
      if (ref.current) BACKGROUNDS.find((b) => b.id === id)?.draw(ref.current.getContext('2d')!, 90, 180);
    };
    draw();
    window.addEventListener('zipper-bg-loaded', draw);
    return () => window.removeEventListener('zipper-bg-loaded', draw);
  }, [id]);
  return (
    <button type="button" className={`bg-swatch ${active ? 'on' : ''}`} onClick={onPick} aria-pressed={active}>
      <canvas ref={ref} aria-hidden />
      <span>{name}</span>
    </button>
  );
}

export default function Studio() {
  const params = useSearchParams();
  const [design, setDesign] = useState<Design>(() => clone(DEFAULT_DESIGN));
  const [deviceId, setDeviceId] = useState(DEVICES[0].id);
  const [img, setImg] = useState<SourceImage | null>(null);
  const [imgName, setImgName] = useState('');
  const [error, setError] = useState('');
  const [bgNonce, setBgNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('photo');
  const [test, setTest] = useState(false);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [webp, setWebp] = useState(false);
  const [customSize, setCustomSize] = useState({ on: false, w: 1080, h: 2340 });
  const [quality, setQuality] = useState(92);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [imgBlob, setImgBlob] = useState<Blob | null>(null);
  const [project, setProject] = useState<{ id: string; name: string; created: number } | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [toast, setToast] = useState('');
  const hist = useHistory(design, setDesign);

  const device = getDevice(deviceId);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---- initial state from URL (?theme=, ?bg=, ?metal=, ?tab=) ---- */
  useEffect(() => {
    const th = getTheme(params.get('theme'));
    const bg = params.get('bg');
    const metal = params.get('metal') as MetalId | null;
    const teeth = params.get('teeth') as TeethId | null;
    const puller = params.get('puller') as PullerId | null;
    const orient = params.get('orient') as Orientation | null;
    const pid = params.get('project');
    const lib = getLibDesign(params.get('design'));
    const shared = params.get('d');
    const custom = params.get('custom');
    const handoff = params.get('handoff');
    const t = params.get('tab') as Tab | null;
    const t0 = t;
    const any = th || bg || metal || teeth || puller || orient || custom || lib;
    const fromUrl = shared ? decodeDesign(shared) : null;
    let n = fromUrl ?? (lib ? clone(lib.design) : th ? clone(th.design) : any ? clone(DEFAULT_DESIGN) : (loadDraft() ?? clone(DEFAULT_DESIGN)));
    if (lib && !t0) setTab('art');
    track('editor_opened', lib ? { design_id: lib.id } : {});
    if (custom && /^[0-9a-f]{6}$/i.test(custom)) n = { ...n, zipper: { ...n.zipper, metal: 'custom', customColor: `#${custom}` } };
    if (bg && BACKGROUNDS.some((b) => b.id === bg)) n = { ...n, bg };
    if (metal && metal in METALS) n = { ...n, zipper: { ...n.zipper, metal } };
    if (teeth && teeth in TEETH) n = { ...n, zipper: { ...n.zipper, teeth } };
    if (puller && puller in PULLERS) n = { ...n, zipper: { ...n.zipper, puller } };
    if (orient === 'horizontal' || orient === 'vertical') n = { ...n, zipper: { ...n.zipper, orientation: orient } };
    hist.reset(n);
    if (pid) {
      getProject(pid)
        .then(async (p) => {
          if (!p) return setError('That project could not be found on this device.');
          hist.reset(p.design);
          if (p.deviceId) setDeviceId(p.deviceId);
          setProject({ id: p.id, name: p.name, created: p.created });
          if (p.image) {
            const im = await decodeImage(p.image);
            setImg(im);
            setImgBlob(p.image);
            setImgName(p.imageName ?? 'photo');
          }
        })
        .catch(() => setError('Projects are not available in this browser (private mode may block storage).'));
    }
    if (handoff) {
      takeHandoff()
        .then(async (h) => {
          if (!h) return;
          const im = await decodeImage(h.blob);
          setImg(im);
          setImgBlob(h.blob);
          setImgName(h.name);
        })
        .catch(() => {});
    }
    if (t && TABS.some((x) => x.id === t)) setTab(t);
    try {
      const tc = document.createElement('canvas');
      tc.width = tc.height = 2;
      setWebp(tc.toDataURL('image/webp').startsWith('data:image/webp'));
    } catch {}
    try {
      const f = new File([new Uint8Array(1)], 'x.png', { type: 'image/png' });
      setCanShare(!!navigator.canShare?.({ files: [f] }));
    } catch {
      setCanShare(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // analytics: style picks and simulator use (ids only, never images)
  const styleKey = `${design.zipper.metal}|${design.zipper.teeth}|${design.zipper.puller}`;
  const firstStyle = useRef(true);
  useEffect(() => {
    if (firstStyle.current) {
      firstStyle.current = false;
      return;
    }
    const id = setTimeout(() => track('zipper_style_selected', { style: styleKey }), 1200);
    return () => clearTimeout(id);
  }, [styleKey]);
  useEffect(() => {
    if (test) track('preview_opened', { mode: 'test_unlock' });
  }, [test]);

  // autosave draft (design only)
  useEffect(() => {
    const id = setTimeout(() => saveDraft(design), 600);
    return () => clearTimeout(id);
  }, [design]);

  // keyboard shortcuts
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' && (e.target as HTMLInputElement).type === 'text') return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) hist.redo();
        else hist.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        hist.redo();
      } else if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        openSave();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const openSave = () => {
    setSaveName(project?.name ?? `My zipper ${new Date().toLocaleDateString()}`);
    setSaveOpen(true);
  };

  const doSave = async (asNew: boolean) => {
    try {
      const th = document.createElement('canvas');
      th.width = 180;
      th.height = Math.round((180 * device.h) / device.w);
      renderDesign(th, design, img);
      const now = Date.now();
      const id = !asNew && project ? project.id : newId();
      const name = saveName.trim() || 'Untitled design';
      await saveProject({
        id,
        name,
        design,
        image: imgBlob,
        imageName: imgName,
        deviceId,
        thumb: th.toDataURL('image/jpeg', 0.8),
        created: !asNew && project ? project.created : now,
        updated: now,
      });
      setProject({ id, name, created: !asNew && project ? project.created : now });
      setSaveOpen(false);
      flash(`Saved “${name}” to My Projects`);
      track('project_saved');
    } catch {
      setSaveOpen(false);
      flash('Could not save — storage may be full or blocked in private mode.');
    }
  };

  const up = <K extends keyof Design>(k: K, patch: Partial<Design[K]>) =>
    setDesign((d) => ({ ...d, [k]: { ...(d[k] as object), ...patch } }));
  const setLayer = <K extends keyof Layers>(k: K, patch: Partial<Layers[K]>) =>
    setDesign((d) => ({ ...d, layers: { ...d.layers, [k]: { ...d.layers[k], ...patch } } }));

  /* ---------------- preview rendering ---------------- */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coverRef = useRef<HTMLCanvasElement | null>(null);
  const revealRef = useRef<HTMLCanvasElement | null>(null);
  const progress = useRef(0);
  const cancelAnim = useRef<() => void>(() => {});
  const { w, h } = usePixelSize(canvasRef);
  const tick = useTick();

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !coverRef.current || c.width < 2) return;
    compose(c.getContext('2d')!, c.width, c.height, design, coverRef.current, progress.current, revealRef.current, new Date());
  }, [design]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || w < 2 || h < 2) return;
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
    }
    const cover = (coverRef.current ??= document.createElement('canvas'));
    cover.width = w;
    cover.height = h;
    renderCover(cover.getContext('2d')!, w, h, design, img, new Date());
    const rev = (revealRef.current ??= document.createElement('canvas'));
    if (rev.width !== w || rev.height !== h) {
      rev.width = w;
      rev.height = h;
      renderHomeScreen(rev.getContext('2d')!, w, h);
    }
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, design.bg, design.adj, design.clock, design.layers, img, tick, bgNonce]);

  useEffect(() => {
    const onBgLoaded = () => setBgNonce((n) => n + 1);
    window.addEventListener('zipper-bg-loaded', onBgLoaded);
    return () => window.removeEventListener('zipper-bg-loaded', onBgLoaded);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const audio = useRef<ZipSound | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => () => audio.current?.dispose(), []);
  const animTo = useCallback(
    (target: number, ms: number, done?: () => void) => {
      cancelAnim.current();
      let last = progress.current;
      let lt = performance.now();
      cancelAnim.current = animate(
        progress.current,
        target,
        ms,
        (v) => {
          const now = performance.now();
          audio.current?.update(((v - last) / Math.max(1, now - lt)) * 600);
          last = v;
          lt = now;
          progress.current = v;
          draw();
        },
        () => {
          audio.current?.update(0);
          done?.();
        },
      );
    },
    [draw],
  );

  useEffect(() => {
    if (!test) animTo(0, 300);
  }, [test, animTo]);

  /* ---------------- pointer interaction ---------------- */
  type Drag =
    | { kind: 'unzip'; grab: number; lp: number; lt: number }
    | { kind: 'zipper'; dx: number; dy: number }
    | { kind: 'pan'; x: number; y: number; ax: number; ay: number }
    | { kind: 'pinch'; dist: number; zoom: number };
  const drag = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());

  const pt = (e: React.PointerEvent | React.WheelEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  const onDown = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const p = pt(e);
    pointers.current.set(e.pointerId, p);
    c.setPointerCapture(e.pointerId);
    const W = c.width;
    const H = c.height;
    const z = design.zipper;

    if (pointers.current.size === 2 && img && !test) {
      const [a, b] = [...pointers.current.values()];
      drag.current = { kind: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: design.adj.zoom };
      return;
    }
    const onPuller = hitPuller(W, H, z, progress.current, p.x, p.y);
    const L = layout(W, H, z);
    const { fx, fy } = toFrame(W, H, z, p.x, p.y);
    if (test) {
      if (!onPuller) return;
      cancelAnim.current();
      if (soundOn && !audio.current) audio.current = createZipSound(design.zipper.teeth === 'coil' ? 'coil' : design.zipper.teeth === 'chunky' ? 'chunky' : 'metal');
      if (!soundOn) {
        audio.current?.dispose();
        audio.current = null;
      }
      drag.current = { kind: 'unzip', grab: fy - (L.restY + progress.current * L.travel), lp: progress.current, lt: performance.now() };
    } else if (onPuller) {
      drag.current = { kind: 'zipper', dx: fx - L.cx, dy: fy - L.restY };
    } else if (img) {
      drag.current = { kind: 'pan', x: p.x, y: p.y, ax: design.adj.x, ay: design.adj.y };
    }
  };

  const onMove = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const p = pt(e);
    const W = c.width;
    const H = c.height;
    const z = design.zipper;
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, p);
    const d = drag.current;
    if (!d) {
      const on = hitPuller(W, H, z, progress.current, p.x, p.y);
      c.style.cursor = on ? (test ? 'grab' : 'move') : img && !test ? 'grab' : 'default';
      return;
    }
    const { fx, fy } = toFrame(W, H, z, p.x, p.y);
    if (d.kind === 'unzip') {
      progress.current = progressFromFrameY(W, H, z, fy, d.grab);
      const now = performance.now();
      audio.current?.update(((progress.current - d.lp) / Math.max(1, now - d.lt)) * 1000);
      d.lp = progress.current;
      d.lt = now;
      draw();
    } else if (d.kind === 'zipper') {
      const L = layout(W, H, z);
      let pos = (fx - d.dx) / L.FW;
      if (z.orientation === 'horizontal') pos = 1 - pos;
      const rest = (fy - d.dy) / L.FH;
      up('zipper', {
        pos: Math.round(Math.max(0.12, Math.min(0.88, pos)) * 100) / 100,
        rest: Math.round(Math.max(0.04, Math.min(0.45, rest)) * 100) / 100,
      });
    } else if (d.kind === 'pan') {
      up('adj', { x: d.ax + (p.x - d.x) / W, y: d.ay + (p.y - d.y) / H });
    } else if (d.kind === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      up('adj', { zoom: Math.max(1, Math.min(4, (d.zoom * dist) / d.dist)) });
    }
  };

  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const d = drag.current;
    if (d?.kind === 'pinch' && pointers.current.size > 0) return;
    drag.current = null;
    if (d?.kind === 'unzip') {
      audio.current?.update(0);
      if (progress.current > 0.55)
        animTo(1, 400, () => {
          audio.current?.click();
          navigator.vibrate?.(25);
          setTimeout(() => animTo(0, 900), 1300);
        });
      else animTo(0, 400);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!img || test) return;
    const z = Math.max(1, Math.min(4, design.adj.zoom * (e.deltaY < 0 ? 1.06 : 1 / 1.06)));
    up('adj', { zoom: Math.round(z * 100) / 100 });
  };

  // stop page scroll while wheeling over the preview with a photo loaded
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const block = (e: WheelEvent) => {
      if (img && !test) e.preventDefault();
    };
    c.addEventListener('wheel', block, { passive: false });
    return () => c.removeEventListener('wheel', block);
  }, [img, test]);

  /* ---------------- upload ---------------- */
  const handleFile = async (f: File | undefined | null) => {
    setError('');
    if (!f) return;
    const bad = validateImage(f);
    if (bad) {
      setError(bad);
      return;
    }
    setLoading(true);
    try {
      const im = await decodeImage(f);
      setImg(im);
      setImgBlob(f);
      setImgName(f.name);
      track('image_uploaded', { file_type: f.type });
      up('adj', { ...DEFAULT_ADJUST, dim: design.adj.dim });
    } catch {
      setError('This image could not be opened. It may be damaged or in an unsupported format.');
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  /* ---------------- export ---------------- */
  const render = async () => {
    const W = customSize.on ? Math.max(320, Math.min(4096, Math.round(customSize.w))) : device.w;
    const H = customSize.on ? Math.max(320, Math.min(4096, Math.round(customSize.h))) : device.h;
    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    renderDesign(out, design, img);
    const mime = `image/${format}`;
    const blob = await new Promise<Blob | null>((res) => out.toBlob(res, mime, quality / 100));
    if (!blob) throw new Error('encode');
    const name = `zipperlock-${design.designId ?? (customSize.on ? 'custom' : device.id)}-${W}x${H}-${Date.now().toString(36)}.${format === 'jpeg' ? 'jpg' : format}`;
    return { blob, name };
  };

  const download = async () => {
    setBusy(true);
    setStatus('');
    try {
      const { blob, name } = await render();
      downloadBlob(blob, name);
      track('image_downloaded', { format, width: customSize.on ? customSize.w : device.w, design_id: design.designId ?? 'custom' });
      track('customization_completed', { design_id: design.designId ?? 'custom' });
      setStatus(`Saved ${name} (${(blob.size / 1048576).toFixed(1)} MB).`);
    } catch {
      setStatus('Export failed. Try a smaller device size or JPEG format.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    setStatus('');
    try {
      const { blob, name } = await render();
      const file = new File([blob], name, { type: blob.type });
      await navigator.share({ files: [file], title: 'My ZipperLock wallpaper' });
      setStatus('Shared. On iPhone choose “Save Image” to add it to Photos.');
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setStatus('Sharing is not available here — use Download instead.');
    } finally {
      setBusy(false);
    }
  };

  const resetAll = () => {
    setDesign(clone(DEFAULT_DESIGN));
    setProject(null);
    setImgBlob(null);
    setImg(null);
    setImgName('');
    setError('');
  };

  const metalStyle = (id: MetalChoice, custom?: string) => {
    const c = getMetal({ metal: id, customColor: custom }).c;
    return { background: `linear-gradient(135deg, ${c[3]} 0%, ${c[1]} 35%, ${c[0]} 50%, ${c[2]} 70%, ${c[3]} 100%)` };
  };

  const clockColors: { id: ClockColor; label: string; css: string }[] = useMemo(
    () => [
      { id: 'white', label: 'White', css: '#FFFFFF' },
      { id: 'gold', label: 'Gold', css: 'linear-gradient(180deg,#FFF4C4,#D4AF37)' },
      { id: 'silver', label: 'Silver', css: 'linear-gradient(180deg,#FFFFFF,#9a9aa2)' },
      { id: 'purple', label: 'Purple', css: '#A98BFA' },
    ],
    [],
  );

  const pct = (v: number) => `${Math.round(v)}%`;
  const z = design.zipper;
  const c = design.clock;
  const a = design.adj;

  return (
    <div className="studio">
      {/* ---------------- preview ---------------- */}
      <div className="studio-stage">
        <div className="stage-bar">
          <label className="select">
            <span className="sr-only">Device</span>
            <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} aria-label="Preview device">
              {(['Android', 'iPhone', 'Tablet'] as const).map((g) => (
                <optgroup key={g} label={g}>
                  {DEVICES.filter((d) => d.group === g).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className="stage-actions">
            <button type="button" className="icon-btn" onClick={hist.undo} disabled={!hist.canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
              ↶
            </button>
            <button type="button" className="icon-btn" onClick={hist.redo} disabled={!hist.canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
              ↷
            </button>
            <button type="button" className={`chip ${test ? 'on' : ''}`} onClick={() => setTest((t) => !t)} aria-pressed={test}>
              {test ? '● Testing' : 'Test unlock'}
            </button>
          </div>
        </div>
        {test && (
          <label className="mini-toggle">
            <input type="checkbox" checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} /> Zipper sound
          </label>
        )}
        <div className="stage-phone">
          <div className="phone" style={{ aspectRatio: `${device.w} / ${device.h}` }}>
            <canvas
              ref={canvasRef}
              className="phone-screen"
              role="img"
              aria-label="Live preview of your zipper lock screen design"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onWheel={onWheel}
            />
            <span className="phone-island" aria-hidden />
            {loading && <span className="phone-loading">Loading photo…</span>}
          </div>
        </div>
        <p className="stage-hint">
          {test
            ? 'Drag the puller down to unzip. Release past halfway to unlock.'
            : img
              ? 'Drag the photo to reposition · pinch or scroll to zoom · drag the puller to move the zipper'
              : 'Drag the puller to move the zipper · upload a photo to make it yours'}
        </p>
      </div>

      {/* ---------------- controls ---------------- */}
      <div className="studio-panel">
        <div className="tabs" role="tablist" aria-label="Editor sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              className={tab === t.id ? 'on' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="panel-body" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'photo' && (
            <>
              <Group title="Your photo">
                <label
                  className={`dropzone ${dragOver ? 'over' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                >
                  <input ref={fileRef} type="file" accept={ACCEPT.join(',')} onChange={(e) => handleFile(e.target.files?.[0])} />
                  <strong>{img ? 'Replace photo' : 'Upload a photo'}</strong>
                  <span>{img ? imgName : 'Tap to choose, or drop an image here'}</span>
                  <small>JPG, PNG or WebP · up to 20 MB · stays on your device</small>
                </label>
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                {img && (
                  <button
                    type="button"
                    className="btn-ghost sm"
                    onClick={() => {
                      setImg(null);
                      setImgBlob(null);
                      setImgName('');
                    }}
                  >
                    Remove photo
                  </button>
                )}
              </Group>

              <Group
                title="Adjust"
                action={
                  <button
                    type="button"
                    className="link"
                    onClick={() => up('adj', { brightness: 100, contrast: 100, saturation: 100, blur: 0, dim: 12 })}
                  >
                    Reset
                  </button>
                }
              >
                <Slider label="Brightness" value={a.brightness} min={40} max={160} onChange={(v) => up('adj', { brightness: v })} format={pct} disabled={!img} />
                <Slider label="Contrast" value={a.contrast} min={40} max={160} onChange={(v) => up('adj', { contrast: v })} format={pct} disabled={!img} />
                <Slider label="Saturation" value={a.saturation} min={0} max={200} onChange={(v) => up('adj', { saturation: v })} format={pct} disabled={!img} />
                <Slider label="Blur" value={a.blur} min={0} max={24} onChange={(v) => up('adj', { blur: v })} format={(v) => `${v}`} disabled={!img} />
                <Slider label="Darken (helps the zipper stand out)" value={a.dim} min={0} max={70} onChange={(v) => up('adj', { dim: v })} format={pct} />
              </Group>

              <Group
                title="Framing"
                action={
                  <button type="button" className="link" onClick={() => up('adj', { zoom: 1, x: 0, y: 0, rotate: 0 })} disabled={!img}>
                    Reset
                  </button>
                }
              >
                <Slider label="Zoom" value={a.zoom} min={1} max={4} step={0.01} onChange={(v) => up('adj', { zoom: v })} format={(v) => `${v.toFixed(2)}×`} disabled={!img} />
                <Slider label="Rotate" value={a.rotate} min={-180} max={180} onChange={(v) => up('adj', { rotate: v })} format={(v) => `${v}°`} disabled={!img} />
                <div className="btn-row">
                  <button type="button" className="btn-ghost sm" disabled={!img} onClick={() => up('adj', { rotate: ((a.rotate + 180 + 90) % 360) - 180 })}>
                    Rotate 90°
                  </button>
                  <button type="button" className="btn-ghost sm" disabled={!img} onClick={() => up('adj', { x: 0, y: 0 })}>
                    Center
                  </button>
                </div>
              </Group>

              <Group title="Or start from a background">
                <div className="bg-grid">
                  {BACKGROUNDS.map((b) => (
                    <BgSwatch
                      key={b.id}
                      id={b.id}
                      name={b.name}
                      active={!img && design.bg === b.id}
                      onPick={() => {
                        setImg(null);
                        setImgBlob(null);
                        setImgName('');
                        setDesign((d) => ({ ...d, bg: b.id, art: null }));
                      }}
                    />
                  ))}
                </div>
              </Group>
            </>
          )}

          {tab === 'art' && <ArtControls art={design.art} onChange={(a) => setDesign((d) => ({ ...d, art: a }))} />}

          {tab === 'zipper' && (
            <>
              <Group title="Finish">
                <div className="metal-grid" role="radiogroup" aria-label="Zipper finish">
                  {(Object.keys(METALS) as MetalId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={z.metal === id}
                      className={`metal ${z.metal === id ? 'on' : ''}`}
                      onClick={() => up('zipper', { metal: id })}
                    >
                      <i style={metalStyle(id)} aria-hidden />
                      <span>{METALS[id].name}</span>
                    </button>
                  ))}
                  <label className={`metal ${z.metal === 'custom' ? 'on' : ''}`} title="Pick any colour">
                    <i style={metalStyle('custom', z.customColor)} aria-hidden />
                    <span>Custom…</span>
                    <input
                      type="color"
                      className="color-overlay"
                      value={z.customColor ?? '#8B5CF6'}
                      aria-label="Custom zipper colour"
                      onChange={(e) => up('zipper', { metal: 'custom', customColor: e.target.value })}
                    />
                  </label>
                </div>
              </Group>
              <Group title="Style">
                <Seg<TeethId>
                  label="Teeth"
                  value={z.teeth}
                  options={(Object.keys(TEETH) as TeethId[]).map((k) => ({ value: k, label: TEETH[k].name }))}
                  onChange={(v) => up('zipper', { teeth: v })}
                />
                <Seg<PullerId>
                  label="Puller"
                  value={z.puller}
                  options={(Object.keys(PULLERS) as PullerId[]).map((k) => ({ value: k, label: PULLERS[k] }))}
                  onChange={(v) => up('zipper', { puller: v })}
                />
                <Seg<Orientation>
                  label="Direction"
                  value={z.orientation}
                  options={[
                    { value: 'vertical', label: 'Vertical' },
                    { value: 'horizontal', label: 'Horizontal' },
                  ]}
                  onChange={(v) => up('zipper', { orientation: v })}
                />
              </Group>
              <Group title="Size & position">
                <Slider label="Size" value={z.size} min={0.6} max={1.6} step={0.01} onChange={(v) => up('zipper', { size: v })} format={(v) => `${Math.round(v * 100)}%`} />
                <Slider
                  label={z.orientation === 'vertical' ? 'Position (left ↔ right)' : 'Position (top ↕ bottom)'}
                  value={z.pos}
                  min={0.12}
                  max={0.88}
                  step={0.01}
                  onChange={(v) => up('zipper', { pos: v })}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <Slider label="Puller start" value={z.rest} min={0.04} max={0.45} step={0.01} onChange={(v) => up('zipper', { rest: v })} format={(v) => `${Math.round(v * 100)}%`} />
              </Group>
              <Group
                title="Puller & finish"
                action={
                  <button type="button" className="link" onClick={() => up('zipper', { shadow: 1, gloss: 1, pullerScale: 1, swing: 0 })}>
                    Reset
                  </button>
                }
              >
                <Slider label="Puller size" value={z.pullerScale ?? 1} min={0.6} max={1.6} step={0.01} onChange={(v) => up('zipper', { pullerScale: v })} format={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Puller swing" value={z.swing ?? 0} min={-35} max={35} onChange={(v) => up('zipper', { swing: v })} format={(v) => `${v}°`} />
                <Slider label="Metallic reflection" value={z.gloss ?? 1} min={0} max={1.5} step={0.05} onChange={(v) => up('zipper', { gloss: v })} format={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Shadow intensity" value={z.shadow ?? 1} min={0} max={1.5} step={0.05} onChange={(v) => up('zipper', { shadow: v })} format={(v) => `${Math.round(v * 100)}%`} />
              </Group>
              <Group title="Fabric tape">
                <Toggle label="Show tape" checked={z.tape} onChange={(v) => up('zipper', { tape: v })} />
                {z.tape && (
                  <>
                    <div className="color-row" role="radiogroup" aria-label="Tape colour">
                      {TAPE_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          role="radio"
                          aria-checked={z.tapeColor === col}
                          aria-label={`Tape colour ${col}`}
                          className={`dot ${z.tapeColor === col ? 'on' : ''}`}
                          style={{ background: col }}
                          onClick={() => up('zipper', { tapeColor: col })}
                        />
                      ))}
                    </div>
                    <Slider label="Tape width" value={z.tapeWidth} min={0.6} max={2} step={0.01} onChange={(v) => up('zipper', { tapeWidth: v })} format={(v) => `${Math.round(v * 100)}%`} />
                  </>
                )}
              </Group>
            </>
          )}

          {tab === 'clock' && (
            <>
              <Group title="Clock">
                <Toggle
                  label="Show clock"
                  checked={c.show}
                  onChange={(v) => up('clock', { show: v })}
                  hint="Your phone draws its own lock-screen clock too — turn this off to avoid seeing two."
                />
                {c.show && (
                  <>
                    <Toggle label="24-hour time" checked={c.h24} onChange={(v) => up('clock', { h24: v })} />
                    <Toggle label="Show date" checked={c.date} onChange={(v) => up('clock', { date: v })} />
                    <Seg<'en' | 'fa'>
                      label="Language"
                      value={c.locale}
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'fa', label: 'فارسی' },
                      ]}
                      onChange={(v) => up('clock', { locale: v })}
                    />
                  </>
                )}
              </Group>
              <Group title="Text">
                <label className="ctl-text">
                  <span>Name or short message</span>
                  <input
                    type="text"
                    maxLength={40}
                    value={c.text}
                    placeholder="e.g. Sara · Stay focused"
                    onChange={(e) => up('clock', { text: e.target.value })}
                  />
                </label>
              </Group>
              <Group title="Typography">
                <Seg<'left' | 'center' | 'right'>
                  label="Alignment"
                  value={c.align}
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                  ]}
                  onChange={(v) => up('clock', { align: v })}
                />
                <Seg<FontId>
                  label="Font"
                  value={c.font}
                  options={(Object.keys(FONTS) as FontId[]).map((k) => ({
                    value: k,
                    label: <span style={{ fontFamily: FONTS[k].family, fontWeight: FONTS[k].weight }}>{FONTS[k].name}</span>,
                  }))}
                  onChange={(v) => up('clock', { font: v })}
                />
                <div className="color-row" role="radiogroup" aria-label="Text colour">
                  {clockColors.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      role="radio"
                      aria-checked={c.color === col.id}
                      aria-label={col.label}
                      title={col.label}
                      className={`dot ${c.color === col.id ? 'on' : ''}`}
                      style={{ background: col.css }}
                      onClick={() => up('clock', { color: col.id })}
                    />
                  ))}
                  <label className={`dot custom ${c.color === 'custom' ? 'on' : ''}`} title="Custom colour" style={{ background: c.custom }}>
                    <input
                      type="color"
                      value={c.custom}
                      aria-label="Custom text colour"
                      onChange={(e) => up('clock', { color: 'custom', custom: e.target.value })}
                    />
                  </label>
                </div>
                <Slider label="Size" value={c.size} min={0.6} max={1.5} step={0.01} onChange={(v) => up('clock', { size: v })} format={(v) => `${Math.round(v * 100)}%`} />
                <Slider label="Vertical position" value={c.y} min={0.1} max={0.75} step={0.01} onChange={(v) => up('clock', { y: v })} format={(v) => `${Math.round(v * 100)}%`} />
              </Group>
            </>
          )}

          {tab === 'layers' && (
            <>
              <Group title="Layers (top to bottom)">
                <ul className="layers">
                  {(design.layers.clock.above ? (['clock', 'zipper', 'photo'] as const) : (['zipper', 'clock', 'photo'] as const)).map((k) => {
                    const L = design.layers[k];
                    const names = { clock: 'Clock & text', zipper: 'Zipper', photo: img ? 'Photo' : 'Background' };
                    return (
                      <li key={k} className={L.visible ? '' : 'off'}>
                        <button
                          type="button"
                          className="eye"
                          aria-pressed={L.visible}
                          aria-label={`${L.visible ? 'Hide' : 'Show'} ${names[k]}`}
                          onClick={() => setLayer(k, { visible: !L.visible })}
                        >
                          {L.visible ? '◉' : '○'}
                        </button>
                        <div className="layer-main">
                          <b>{names[k]}</b>
                          <Slider
                            label="Opacity"
                            value={L.opacity}
                            min={0}
                            max={100}
                            onChange={(v) => setLayer(k, { opacity: v })}
                            format={pct}
                            disabled={!L.visible || (k === 'photo' && !img)}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <Toggle
                  label="Clock above zipper"
                  hint="On: the clock stays put while you unzip. Off: it splits with the wallpaper."
                  checked={design.layers.clock.above}
                  onChange={(v) => setLayer('clock', { above: v })}
                />
                {img && <p className="muted small">Lower the photo opacity to blend it with the selected background.</p>}
              </Group>
              <Group title="History">
                <div className="btn-row">
                  <button type="button" className="btn-ghost sm" onClick={hist.undo} disabled={!hist.canUndo}>
                    ↶ Undo
                  </button>
                  <button type="button" className="btn-ghost sm" onClick={hist.redo} disabled={!hist.canRedo}>
                    ↷ Redo
                  </button>
                </div>
                <p className="muted small">Shortcuts: Ctrl/⌘+Z undo · Ctrl/⌘+Shift+Z redo · Ctrl/⌘+S save</p>
              </Group>
            </>
          )}

          {tab === 'export' && (
            <>
              <Group title="Size">
                <label className="select block">
                  <span>Device</span>
                  <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                    {(['Android', 'iPhone', 'Tablet'] as const).map((g) => (
                      <optgroup key={g} label={g}>
                        {DEVICES.filter((d) => d.group === g).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} — {d.w}×{d.h}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <Toggle label="Custom dimensions" checked={customSize.on} onChange={(v) => setCustomSize((c) => ({ ...c, on: v }))} />
                {customSize.on ? (
                  <div className="two-col">
                    <label className="ctl-text">
                      <span>Width (px)</span>
                      <input type="number" min={320} max={4096} value={customSize.w} onChange={(e) => setCustomSize((c) => ({ ...c, w: Number(e.target.value) || 0 }))} />
                    </label>
                    <label className="ctl-text">
                      <span>Height (px)</span>
                      <input type="number" min={320} max={4096} value={customSize.h} onChange={(e) => setCustomSize((c) => ({ ...c, h: Number(e.target.value) || 0 }))} />
                    </label>
                  </div>
                ) : (
                  <p className="muted">
                    Exports at <strong>{device.w} × {device.h}</strong> px — your screen’s native resolution, so it stays sharp.
                  </p>
                )}
                {customSize.on && <p className="muted small">320–4096 px per side. The design is re-drawn at this size, not stretched.</p>}
              </Group>
              <Group title="Format">
                <Seg<'png' | 'jpeg' | 'webp'>
                  label="File type"
                  value={format}
                  options={[
                    { value: 'png', label: 'PNG · best' },
                    { value: 'jpeg', label: 'JPEG · smaller' },
                    ...(webp ? [{ value: 'webp' as const, label: 'WebP · smallest' }] : []),
                  ]}
                  onChange={setFormat}
                />
                {format !== 'png' && <Slider label="Quality" value={quality} min={60} max={100} onChange={setQuality} format={pct} />}
              </Group>
              <div className="export-actions">
                <button type="button" className="btn-primary block" onClick={download} disabled={busy}>
                  {busy ? 'Preparing…' : 'Download wallpaper'}
                </button>
                {canShare && (
                  <button type="button" className="btn-ghost block" onClick={share} disabled={busy}>
                    Share / Save to Photos
                  </button>
                )}
                {status && (
                  <p className="muted" role="status">
                    {status}
                  </p>
                )}
              </div>
              <Group title="Set it as your wallpaper">
                <details className="howto">
                  <summary>Android</summary>
                  <ol>
                    <li>Open the downloaded image in Gallery or Google Photos.</li>
                    <li>Tap ⋮ → <em>Set as wallpaper</em>.</li>
                    <li>Choose <em>Lock screen</em> (or both screens) and confirm.</li>
                  </ol>
                </details>
                <details className="howto">
                  <summary>iPhone</summary>
                  <ol>
                    <li>Use <em>Share / Save to Photos</em>, or save from the Downloads folder in Files.</li>
                    <li>Open Photos → the image → Share → <em>Use as Wallpaper</em>.</li>
                    <li>Adjust if needed, tap <em>Add</em>, then <em>Set as Wallpaper Pair</em> or lock screen only.</li>
                  </ol>
                </details>
                <p className="muted small">
                  This is a wallpaper image. The unzip animation is a simulation in your browser — it doesn’t replace your phone’s
                  real lock screen or its security.
                </p>
              </Group>
            </>
          )}
        </div>

        <div className="panel-foot">
          <button type="button" className="link" onClick={resetAll}>
            Start over
          </button>
          <div className="foot-right">
            <button type="button" className="btn-ghost sm" onClick={openSave}>
              {project ? 'Save' : 'Save project'}
            </button>
            <button type="button" className="btn-primary sm" onClick={() => setTab('export')}>
              Download →
            </button>
          </div>
        </div>
        {project && <p className="project-line muted">Editing “{project.name}” · <a href="/projects/">My Projects</a></p>}
      </div>

      {saveOpen && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="save-title" onClick={() => setSaveOpen(false)}>
          <form
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              doSave(false);
            }}
          >
            <h2 id="save-title">{project ? 'Save project' : 'Save to My Projects'}</h2>
            <p className="muted small">Saved in this browser only — including your photo. Nothing is uploaded.</p>
            <label className="ctl-text">
              <span>Name</span>
              <input autoFocus type="text" maxLength={60} value={saveName} onChange={(e) => setSaveName(e.target.value)} />
            </label>
            <div className="modal-actions">
              <button type="button" className="link" onClick={() => setSaveOpen(false)}>
                Cancel
              </button>
              {project && (
                <button type="button" className="btn-ghost sm" onClick={() => doSave(true)}>
                  Save as new
                </button>
              )}
              <button type="submit" className="btn-primary sm">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {/* ---------------- quick themes ---------------- */}
      <div className="studio-themes">
        <h2>Quick themes</h2>
        <div className="theme-chips">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="chip"
              onClick={() => {
                track('theme_selected', { theme_id: t.id });
                setDesign((d) => ({ ...clone(t.design), adj: { ...t.design.adj, ...(img ? { ...d.adj } : {}) } }));
              }}
            >
              <i style={metalStyle(t.design.zipper.metal, t.design.zipper.customColor)} aria-hidden />
              {t.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="link small share-link"
          onClick={async () => {
            const url = `${location.origin}/studio/?d=${encodeDesign(design)}`;
            try {
              await navigator.clipboard.writeText(url);
              flash('Design link copied (photos are not included in links)');
            } catch {
              prompt('Copy this link:', url);
            }
          }}
        >
          🔗 Copy a link to this design
        </button>
      </div>
    </div>
  );
}
