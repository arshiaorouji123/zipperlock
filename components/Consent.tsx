'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SITE } from '../lib/site';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...a: unknown[]) => void;
  }
}

function load(src: string, attrs: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

function startServices() {
  if (SITE.gaId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', SITE.gaId, { anonymize_ip: true });
    load(`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`);
  }
  if (SITE.adsenseClient) {
    load(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`, { crossorigin: 'anonymous' });
  }
  window.dispatchEvent(new Event('zl:consent'));
}

/**
 * Cookie consent. Only appears when analytics or ads are configured; nothing third-party
 * loads until the visitor accepts. The choice can be changed from the Privacy page.
 */
export default function Consent() {
  const [show, setShow] = useState(false);
  const needed = !!(SITE.gaId || SITE.adsenseClient);
  useEffect(() => {
    if (!needed) return;
    let v: string | null = null;
    try {
      v = localStorage.getItem('zl:consent');
    } catch {}
    if (v === 'yes') startServices();
    else if (v !== 'no') setShow(true);
    const reopen = () => setShow(true);
    window.addEventListener('zl:consent-open', reopen);
    return () => window.removeEventListener('zl:consent-open', reopen);
  }, [needed]);
  if (!show) return null;
  const choose = (yes: boolean) => {
    try {
      localStorage.setItem('zl:consent', yes ? 'yes' : 'no');
    } catch {}
    setShow(false);
    if (yes) startServices();
  };
  return (
    <div className="consent" role="dialog" aria-label="Cookie choices">
      <p>
        We use cookies for {SITE.gaId ? 'anonymous analytics' : ''}
        {SITE.gaId && SITE.adsenseClient ? ' and ' : ''}
        {SITE.adsenseClient ? 'ads that keep ZipperLock free' : ''}. Your photos are never uploaded. <Link href="/privacy/">Privacy policy</Link>
      </p>
      <div className="btn-row">
        <button type="button" className="btn-ghost sm" onClick={() => choose(false)}>
          Decline
        </button>
        <button type="button" className="btn-primary sm" onClick={() => choose(true)}>
          Accept
        </button>
      </div>
    </div>
  );
}

export function ConsentReset() {
  return (
    <button
      type="button"
      className="btn-ghost sm"
      onClick={() => {
        try {
          localStorage.removeItem('zl:consent');
        } catch {}
        window.dispatchEvent(new Event('zl:consent-open'));
      }}
    >
      Change cookie choices
    </button>
  );
}
