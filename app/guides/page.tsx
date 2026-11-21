import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES } from '../../lib/guides';

export const metadata: Metadata = {
  title: 'Lock Screen & Wallpaper Guides',
  description: 'Practical guides to setting custom lock screens on Android and iPhone, choosing photos, wallpaper resolutions and how zipper lock screens work.',
  alternates: { canonical: '/guides/' },
};

export default function GuidesIndex() {
  return (
    <div className="wrap page narrow">
      <div className="page-head">
        <p className="eyebrow">Guides</p>
        <h1>Better lock screens, explained</h1>
        <p className="muted">Short, practical articles written for ZipperLock. No fluff, no app installs required.</p>
      </div>
      <div className="guide-list">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}/`} className="guide-card">
            <h2>{g.title}</h2>
            <p className="muted">{g.description}</p>
            <span className="small muted">{g.readMins} min read</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
