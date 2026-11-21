import type { Metadata } from 'next';
import { Suspense } from 'react';
import Studio from '../../components/Studio';
import JsonLd from '../../components/JsonLd';
import { SITE } from '../../lib/site';

export const metadata: Metadata = {
  title: 'Zipper Lock Studio — Create Your Zipper Lock Screen',
  alternates: { canonical: '/studio/' },
  description:
    'Upload a photo, pick a gold, silver or purple zipper, add a clock and download a full-resolution zipper lock screen wallpaper. Works in your browser, no account needed.',
};

export default function StudioPage() {
  return (
    <div className="wrap studio-page">
      <div className="studio-head">
        <h1>Zipper Lock Studio</h1>
        <p className="muted">Everything updates live. Your photo never leaves this device.</p>
      </div>
      <Suspense fallback={<div className="studio-fallback">Loading the studio…</div>}>
        <Studio />
      </Suspense>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'ZipperLock Studio',
          url: `${SITE.url}/studio/`,
          applicationCategory: 'DesignApplication',
          operatingSystem: 'Any (web browser)',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          featureList: 'Photo upload and adjustment, metallic zipper styles, clock and text, layers, undo/redo, local projects, PNG/JPEG export at native phone resolutions',
        }}
      />
    </div>
  );
}
