'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { compose, renderCover, renderHomeScreen, type Design, type SourceImage } from '../lib/design';
import { hitPuller, layout, progressFromFrameY, toFrame } from '../lib/zipper';
import { animate, usePixelSize, useTick } from '../lib/hooks';
import { createZipSound, type SoundStyle, type ZipSound } from '../lib/sound';

interface Props {
  design: Design;
  img?: SourceImage | null;
  /** width / height of the phone screen */
  aspect?: number;
  hint?: boolean;
  label?: string;
  sound?: SoundStyle | null;
  volume?: number;
  haptics?: boolean;
  /** custom reveal layer (defaults to a generic home screen) */
  reveal?: HTMLCanvasElement | null;
  /** keep it open after unlocking instead of zipping back */
  stayOpen?: boolean;
  onUnlock?: () => void;
  className?: string;
}

/** Interactive phone: drag the puller to unzip. */
export default function ZipperDemo({
  design,
  img = null,
  aspect = 9 / 19.5,
  hint = true,
  label = 'Interactive zipper lock demo',
  sound = null,
  volume = 0.8,
  haptics = false,
  reveal = null,
  stayOpen = false,
  onUnlock,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coverRef = useRef<HTMLCanvasElement | null>(null);
  const revealRef = useRef<HTMLCanvasElement | null>(null);
  const progress = useRef(0);
  const drag = useRef<{ grab: number; lastP: number; lastT: number } | null>(null);
  const cancel = useRef<() => void>(() => {});
  const touched = useRef(false);
  const audio = useRef<ZipSound | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [bgNonce, setBgNonce] = useState(0);
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
    c.width = w;
    c.height = h;
    const cover = (coverRef.current ??= document.createElement('canvas'));
    cover.width = w;
    cover.height = h;
    renderCover(cover.getContext('2d')!, w, h, design, img, new Date());
    const rev = (revealRef.current ??= document.createElement('canvas'));
    rev.width = w;
    rev.height = h;
    const rx = rev.getContext('2d')!;
    if (reveal) rx.drawImage(reveal, 0, 0, w, h);
    else renderHomeScreen(rx, w, h);
    draw();
  }, [w, h, design, img, reveal, draw, tick, bgNonce]);

  useEffect(() => {
    const onBgLoaded = () => setBgNonce((n) => n + 1);
    window.addEventListener('zipper-bg-loaded', onBgLoaded);
    return () => window.removeEventListener('zipper-bg-loaded', onBgLoaded);
  }, []);

  // sound engine lifecycle (created lazily on first interaction — browsers require a gesture)
  useEffect(() => {
    if (!sound) {
      audio.current?.dispose();
      audio.current = null;
    } else audio.current?.setStyle(sound);
  }, [sound]);
  useEffect(() => {
    audio.current?.setVolume(volume);
  }, [volume]);
  useEffect(() => () => audio.current?.dispose(), []);
  const ensureAudio = () => {
    if (sound && !audio.current) audio.current = createZipSound(sound, volume);
  };

  const to = useCallback(
    (target: number, ms: number, done?: () => void) => {
      cancel.current();
      let last = progress.current;
      let lastT = performance.now();
      cancel.current = animate(
        progress.current,
        target,
        ms,
        (v) => {
          const now = performance.now();
          if (audio.current) audio.current.update((v - last) / Math.max(1, now - lastT) * 1000 * 0.6);
          last = v;
          lastT = now;
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

  const finishUnlock = useCallback(() => {
    setUnlocked(true);
    audio.current?.click();
    if (haptics) navigator.vibrate?.(30);
    onUnlock?.();
    if (stayOpen) return;
    setTimeout(() => {
      setUnlocked(false);
      to(0, 900);
    }, 1600);
  }, [haptics, onUnlock, stayOpen, to]);

  const playUnlock = useCallback(() => {
    touched.current = true;
    ensureAudio();
    to(1, 700, finishUnlock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, finishUnlock, sound]);

  /** Close again (used when stayOpen). */
  const relock = useCallback(() => {
    setUnlocked(false);
    to(0, 800);
  }, [to]);

  // Stationary: no automatic unprompted movement / bounce
  useEffect(() => () => cancel.current(), []);

  const pt = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  const onDown = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const { x, y } = pt(e);
    if (unlocked && stayOpen) {
      relock();
      return;
    }
    if (!hitPuller(c.width, c.height, design.zipper, progress.current, x, y)) return;
    touched.current = true;
    ensureAudio();
    cancel.current();
    const L = layout(c.width, c.height, design.zipper);
    const { fy } = toFrame(c.width, c.height, design.zipper, x, y);
    drag.current = { grab: fy - (L.restY + progress.current * L.travel), lastP: progress.current, lastT: performance.now() };
    c.setPointerCapture(e.pointerId);
    if (haptics) navigator.vibrate?.(8);
  };
  const onMove = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const { x, y } = pt(e);
    const d = drag.current;
    if (!d) {
      c.style.cursor = hitPuller(c.width, c.height, design.zipper, progress.current, x, y) ? 'grab' : 'default';
      return;
    }
    const { fy } = toFrame(c.width, c.height, design.zipper, x, y);
    progress.current = progressFromFrameY(c.width, c.height, design.zipper, fy, d.grab);
    const now = performance.now();
    audio.current?.update(((progress.current - d.lastP) / Math.max(1, now - d.lastT)) * 1000);
    d.lastP = progress.current;
    d.lastT = now;
    draw();
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    audio.current?.update(0);
    if (progress.current > 0.55) to(1, 350, finishUnlock);
    else to(0, 450);
  };

  return (
    <div className={`phone ${className}`} style={{ aspectRatio: String(aspect) }}>
      <canvas
        ref={canvasRef}
        className="phone-screen"
        role="img"
        aria-label={`${label}. Press Enter to play the unlock animation.`}
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (unlocked && stayOpen) relock();
            else playUnlock();
          }
        }}
      />
      <span className="phone-island" aria-hidden />
      <span className={`phone-toast ${unlocked ? 'show' : ''}`} aria-live="polite">
        {unlocked ? (stayOpen ? 'Unlocked — tap to zip it back up' : 'Unlocked — zipping back up…') : ''}
      </span>
    </div>
  );
}
