import type { Metadata } from 'next';
import { SITE } from '../../lib/site';

export const metadata: Metadata = { title: 'Terms of Use', description: 'Terms for using ZipperLock’s wallpaper studio, simulator and tools.', alternates: { canonical: '/terms/' } };

export default function Terms() {
  return (
    <div className="wrap page narrow prose">
      <h1>Terms of Use</h1>
      <p className="muted">Last updated: November 9, 2026</p>
      <p>By using ZipperLock you agree to these terms. If you don’t agree, please don’t use the site.</p>
      <h2>What ZipperLock is</h2>
      <p>
        ZipperLock is a free, browser-based design tool for creating wallpaper images and previewing zipper unlock animations. It does not install
        software on your device and does not replace or modify your device’s lock screen or security.
      </p>
      <h2>Your content</h2>
      <ul>
        <li>You keep all rights to the photos you use and the wallpapers you create.</li>
        <li>Only use images you own or have permission to use. You’re responsible for the content you create.</li>
        <li>Because images are processed on your device, we never receive or store them.</li>
      </ul>
      <h2>Our content</h2>
      <p>
        The ZipperLock name, logo, site design, code, zipper artwork, generated backgrounds, themes and articles belong to ZipperLock. Wallpapers you
        export — including our zipper artwork and backgrounds — may be used freely for personal use on your own devices. Please don’t resell them as
        stand-alone assets or republish our articles without permission.
      </p>
      <h2>Acceptable use</h2>
      <p>Don’t use the site to create unlawful, infringing or harmful content, and don’t attempt to disrupt or overload the service.</p>
      <h2>No warranty</h2>
      <p>
        The service is provided “as is”, without warranties of any kind. We do our best to keep it working and accurate, but we can’t guarantee it will
        always be available, error-free or suitable for a particular purpose. Saved projects live in your browser and can be lost if site data is cleared.
      </p>
      <h2>Limitation of liability</h2>
      <p>To the extent permitted by law, ZipperLock isn’t liable for indirect or consequential losses arising from use of the site.</p>
      <h2>Changes</h2>
      <p>We may update these terms. The date above shows the latest version. Continued use means you accept the updated terms.</p>
      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </div>
  );
}
