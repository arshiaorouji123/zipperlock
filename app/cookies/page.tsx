import type { Metadata } from 'next';
import Link from 'next/link';
import { ConsentReset } from '../../components/Consent';
import { SITE } from '../../lib/site';

export const metadata: Metadata = { title: 'Cookie Policy', description: 'Which cookies and browser storage ZipperLock uses, and how to control them.', alternates: { canonical: '/cookies/' } };

export default function Cookies() {
  const third = !!(SITE.gaId || SITE.adsenseClient);
  return (
    <div className="wrap page narrow prose">
      <h1>Cookie Policy</h1>
      <p className="muted">Last updated: November 12, 2026</p>
      <h2>Strictly necessary storage (always on)</h2>
      <p>These keep the app working and never leave your device. They are not used for tracking.</p>
      <ul>
        <li><code>zl:draft</code> (localStorage) — your latest Studio settings.</li>
        <li><code>zl:consent</code> (localStorage) — remembers your cookie choice.</li>
        <li><code>zipperlock</code> (IndexedDB) — projects you save, including their photos.</li>
        <li>Service-worker cache — the site’s own files, so it works offline.</li>
      </ul>
      <h2>Optional cookies (only with your consent)</h2>
      {third ? (
        <ul>
          {SITE.gaId && (
            <li>
              <b>Google Analytics 4</b> (<code>_ga</code>, <code>_ga_*</code>) — counts visits and feature use (for example “design previewed” or “image
              downloaded”). We never send your photos or what you type.
            </li>
          )}
          {SITE.adsenseClient && (
            <li>
              <b>Google AdSense</b> — shows ads and measures them. Ads may be personalised; you can opt out at adssettings.google.com.
            </li>
          )}
        </ul>
      ) : (
        <p>None are active at the moment. If analytics or ads are added, you will be asked before anything loads.</p>
      )}
      {third && <ConsentReset />}
      <h2>Controlling storage</h2>
      <p>
        You can delete saved projects at any time on <Link href="/projects/">My Projects</Link>, or clear all site data from your browser settings. See
        also our <Link href="/privacy/">Privacy Policy</Link>.
      </p>
    </div>
  );
}
