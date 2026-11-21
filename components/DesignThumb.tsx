'use client';
import { useEffect, useRef } from 'react';
import { renderDesign, type Design } from '../lib/design';
import { usePixelSize, useVisible } from '../lib/hooks';

/** Static, lazily-rendered preview of a design inside a mini phone. */
export default function DesignThumb({ design, label }: { design: Design; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(ref);
  const { w, h } = usePixelSize(ref, 2);

  useEffect(() => {
    const c = ref.current;
    if (!c || !visible || w < 2) return;
    c.width = w;
    c.height = h;
    renderDesign(c, design, null);

    const onBgLoaded = () => {
      if (ref.current && visible && w >= 2) {
        renderDesign(ref.current, design, null);
      }
    };
    window.addEventListener('zipper-bg-loaded', onBgLoaded);
    return () => window.removeEventListener('zipper-bg-loaded', onBgLoaded);
  }, [visible, w, h, design]);

  return (
    <div className="phone phone-sm" style={{ aspectRatio: '9 / 19.5' }}>
      <canvas ref={ref} className="phone-screen" role="img" aria-label={label} />
    </div>
  );
}
