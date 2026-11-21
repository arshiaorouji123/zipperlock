import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import LibraryBrowser from '../../components/LibraryBrowser';
import JsonLd from '../../components/JsonLd';
import { CATEGORIES, LIBRARY, type CatId } from '../../lib/library';
import { SITE } from '../../lib/site';

export const metadata: Metadata = {
  title: 'Zipper Lock Screen Design Library — 230+ Original Designs',
  description:
    'Browse 230+ original zipper lock screen designs: love and hearts, football, cats, dogs, anime-inspired, flowers, galaxy, luxury, gaming, cars, dark and seasonal. Preview the unzip, customise every colour and download.',
  alternates: { canonical: '/designs/' },
};

export default function DesignsPage() {
  const counts = (Object.keys(CATEGORIES) as CatId[]).map((c) => [c, LIBRARY.filter((d) => d.cat === c).length] as const);
  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="eyebrow">Design library</p>
        <h1>{LIBRARY.length} zipper lock screen designs</h1>
        <p className="muted">
          Every design is original artwork drawn by ZipperLock, so it stays sharp at any resolution and every colour can be changed. Tap one to try the
          unzip, then customise it in the Studio.
        </p>
      </div>
      <nav className="cat-links" aria-label="Categories">
        {counts.map(([c, n]) => (
          <Link key={c} href={`/designs/${c}/`}>
            {CATEGORIES[c].name} <span>{n}</span>
          </Link>
        ))}
      </nav>
      <Suspense fallback={<p className="muted">Loading designs…</p>}>
        <LibraryBrowser />
      </Suspense>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'ZipperLock design library',
          url: `${SITE.url}/designs/`,
          numberOfItems: LIBRARY.length,
          hasPart: counts.map(([c]) => ({ '@type': 'CollectionPage', name: CATEGORIES[c].name, url: `${SITE.url}/designs/${c}/` })),
        }}
      />
    </div>
  );
}
