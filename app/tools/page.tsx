import type { Metadata } from 'next';
import Link from 'next/link';
import { TOOLS } from '../../lib/tools';

export const metadata: Metadata = {
  title: 'Free Wallpaper & Zipper Design Tools',
  description:
    'Free browser tools for lock screen wallpapers: zipper colour studio, wallpaper cropper, resolution converter, background effects, background remover, zipper sounds and more.',
  alternates: { canonical: '/tools/' },
};

export default function ToolsHub() {
  return (
    <div className="wrap page">
      <div className="page-head">
        <p className="eyebrow">Creative tools</p>
        <h1>Tools for better lock screens</h1>
        <p className="muted">Every tool runs in your browser. Your images are never uploaded.</p>
      </div>
      <div className="tool-grid tools-hub">
        {TOOLS.map((t) => (
          <Link key={t.slug} href={t.href} className="tool">
            <span className="tool-icon" aria-hidden>
              {t.icon}
            </span>
            <b>{t.name}</b>
            <span>{t.blurb}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
