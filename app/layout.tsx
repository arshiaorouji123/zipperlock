import type { Metadata, Viewport } from 'next';
import { Footer, Header } from '../components/Chrome';
import Consent from '../components/Consent';
import { SwRegister } from '../components/Pwa';
import JsonLd from '../components/JsonLd';
import { SITE } from '../lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  alternates: { canonical: '/' },
  ...(SITE.gscVerification ? { verification: { google: SITE.gscVerification } } : {}),
  title: {
    default: 'ZipperLock — Zipper Lock Screen Wallpaper Maker',
    template: '%s · ZipperLock',
  },
  description:
    'Create zipper lock screen wallpapers with your own photo. Choose gold, silver or purple metallic zippers, add a clock and download a sharp wallpaper for Android or iPhone — free, no sign-up.',
  applicationName: 'ZipperLock',
  appleWebApp: { capable: true, title: 'ZipperLock', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  twitter: { card: 'summary_large_image' },
  openGraph: {
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'ZipperLock — zipper lock screen maker' }],
    type: 'website',
    siteName: 'ZipperLock',
    title: 'ZipperLock — Zipper Lock Screen Wallpaper Maker',
    description: 'Design a metallic zipper lock screen with your own photo and download it for your phone.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0F',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Consent />
        <SwRegister />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              { '@type': 'Organization', '@id': `${SITE.url}/#org`, name: SITE.name, url: SITE.url, logo: `${SITE.url}/icons/icon-512.png`, email: SITE.email },
              { '@type': 'WebSite', '@id': `${SITE.url}/#site`, name: SITE.name, url: SITE.url, publisher: { '@id': `${SITE.url}/#org` }, inLanguage: 'en' },
            ],
          }}
        />
      </body>
    </html>
  );
}
