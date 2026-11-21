'use client';
import { useEffect, useState, type RefObject } from 'react';

/** Tracks an element's size in device pixels (capped DPR for performance). */
export function usePixelSize(ref: RefObject<HTMLElement | null>, maxDpr = 2.5) {
  const [size, setSize] = useState({ w: 0, h: 0, dpr: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      setSize((s) => (s.w === w && s.h === h ? s : { w, h, dpr }));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, maxDpr]);
  return size;
}

/** Re-render every `ms` so on-canvas clocks stay current. */
export function useTick(ms = 30000) {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}

/** True once the element has scrolled near the viewport. */
export function useVisible(ref: RefObject<HTMLElement | null>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || v) return;
    if (!('IntersectionObserver' in window)) {
      setV(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setV(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, v]);
  return v;
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Animate a numeric ref with rAF. Returns a cancel function. */
export function animate(from: number, to: number, ms: number, onFrame: (v: number) => void, onDone?: () => void) {
  const start = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    onFrame(from + (to - from) * easeOutCubic(t));
    if (t < 1) raf = requestAnimationFrame(step);
    else onDone?.();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
