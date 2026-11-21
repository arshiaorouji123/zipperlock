'use client';
import { useEffect, useState } from 'react';
import { track } from '../lib/analytics';

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Registers the service worker (production only). */
export function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    const reg = () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    if (document.readyState === 'complete') reg();
    else window.addEventListener('load', reg, { once: true });
  }, []);
  return null;
}

/** "Install app" button — Android/desktop prompt, or iOS instructions. Hidden when already installed. */
export function InstallButton({ className = 'btn-ghost sm' }: { className?: string }) {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone;
    setInstalled(!!standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const h = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener('beforeinstallprompt', h);
    const done = () => setInstalled(true);
    window.addEventListener('appinstalled', done);
    return () => {
      window.removeEventListener('beforeinstallprompt', h);
      window.removeEventListener('appinstalled', done);
    };
  }, []);
  if (installed || (!evt && !ios)) return null;
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={async () => {
          track('pwa_install_initiated', { platform: evt ? 'prompt' : 'ios' });
          if (evt) {
            await evt.prompt();
            await evt.userChoice;
            setEvt(null);
          } else setHelp(true);
        }}
      >
        ⤓ Install app
      </button>
      {help && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ios-title" onClick={() => setHelp(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="ios-title">Add ZipperLock to your Home Screen</h2>
            <ol className="muted">
              <li>Tap the Share button in Safari’s toolbar.</li>
              <li>Scroll and tap “Add to Home Screen”.</li>
              <li>Tap Add. ZipperLock opens full-screen and works offline.</li>
            </ol>
            <div className="modal-actions">
              <button type="button" className="btn-primary sm" onClick={() => setHelp(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
