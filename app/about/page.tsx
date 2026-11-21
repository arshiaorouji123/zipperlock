import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'About ZipperLock', description: 'Why ZipperLock exists and how it’s built: a private, browser-based studio for zipper lock screen wallpapers.', alternates: { canonical: '/about/' } };

export default function About() {
  return (
    <div className="wrap page narrow prose">
      <h1>About ZipperLock</h1>
      <p className="lead">
        Zipper lock screens have been a favourite Android customisation for years. ZipperLock brings that look to every phone — without installing an app,
        granting permissions or uploading your photos.
      </p>
      <h2>What we believe</h2>
      <ul>
        <li>
          <b>Real tools, not galleries.</b> Every zipper is drawn live from your settings, at your screen’s exact resolution.
        </li>
        <li>
          <b>Private by design.</b> Photos are edited on your device. There are no accounts and nothing to sign up for.
        </li>
        <li>
          <b>Honest about limits.</b> A wallpaper can’t secure a phone, and we say so clearly.
        </li>
      </ul>
      <h2>How it’s built</h2>
      <p>
        The zipper renderer draws every tooth, the slider and the puller with the HTML5 Canvas API, using metal colour ramps and real zipper geometry —
        interlocking teeth offset by half a pitch, and a V-shaped opening that follows the slider. Sounds are synthesised with the Web Audio API. Saved
        projects use your browser’s IndexedDB, and the app works offline as a Progressive Web App.
      </p>
      <h2>Get started</h2>
      <p>
        <Link href="/studio/">Open the Studio</Link>, <Link href="/simulator/">try the simulator</Link> or browse the <Link href="/guides/">guides</Link>.
        Questions or ideas? <Link href="/contact/">Get in touch</Link>.
      </p>
    </div>
  );
}
