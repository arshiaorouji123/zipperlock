import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Disclaimer', description: 'ZipperLock creates wallpapers and browser simulations; it is not a device lock screen or security product.', alternates: { canonical: '/disclaimer/' } };

export default function Disclaimer() {
  return (
    <div className="wrap page narrow prose">
      <h1>Disclaimer</h1>
      <h2>Not a lock screen or security product</h2>
      <p>
        ZipperLock creates wallpaper images and lets you try a zipper unlock animation inside your web browser. The simulator does not lock your phone and
        cannot protect your data. Your device’s own lock screen, PIN, password, fingerprint and face unlock are unaffected — keep them enabled.
      </p>
      <h2>Installing the web app</h2>
      <p>
        Adding ZipperLock to your home screen installs a web app (PWA) that opens the same site in its own window and works offline. It has no access to
        system settings and cannot replace the system lock screen on Android or iOS.
      </p>
      <h2>Device information</h2>
      <p>
        Screen sizes, menu names and steps in our guides reflect common devices and software versions at the time of writing. Manufacturers change these
        often, so your device may differ.
      </p>
      <h2>Trademarks</h2>
      <p>
        Android is a trademark of Google LLC. iPhone and iPad are trademarks of Apple Inc. Samsung and Galaxy are trademarks of Samsung Electronics. They are
        mentioned only to describe compatibility; ZipperLock is not affiliated with or endorsed by these companies.
      </p>
      <h2>External links</h2>
      <p>We’re not responsible for the content or practices of websites we link to.</p>
    </div>
  );
}
