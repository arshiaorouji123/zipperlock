'use client';
import { useEffect, useRef } from 'react';
import { SITE } from '../lib/site';

/**
 * AdSense slot. Renders nothing unless NEXT_PUBLIC_ADSENSE_CLIENT is set and the visitor has
 * accepted cookies. Space is reserved to avoid layout shift. Never placed inside editors.
 */
export default function AdSlot({ slot, label = 'Advertisement' }: { slot?: string; label?: string }) {
  const ref = useRef<HTMLModElement>(null);
  const enabled = !!SITE.adsenseClient && !!slot;
  useEffect(() => {
    if (!enabled) return;
    const push = () => {
      try {
        if (localStorage.getItem('zl:consent') !== 'yes') return;
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ||= []).push({});
      } catch {}
    };
    push();
    window.addEventListener('zl:consent', push);
    return () => window.removeEventListener('zl:consent', push);
  }, [enabled]);
  if (!enabled) return null;
  return (
    <aside className="ad-slot" aria-label={label}>
      <span className="ad-label">{label}</span>
      <ins ref={ref} className="adsbygoogle" style={{ display: 'block' }} data-ad-client={SITE.adsenseClient} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
