import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'ZipperLock — Zipper Lock Screen Studio',
    short_name: 'ZipperLock',
    description: 'Design zipper lock screen wallpapers with your own photo. Works offline.',
    start_url: '/studio/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',
    background_color: '#0B0B0F',
    theme_color: '#0B0B0F',
    categories: ['photo', 'personalization', 'design'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'New design', url: '/studio/', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Simulator', url: '/simulator/', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'My Projects', url: '/projects/', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
