import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Offline', robots: { index: false } };

export default function Offline() {
  return (
    <div className="wrap page narrow offline">
      <h1>You’re offline</h1>
      <p className="muted">This page isn’t saved for offline use yet. The Studio, simulator, tools and your saved projects work without a connection once you’ve opened the app online.</p>
      <div className="cta-row">
        <Link href="/studio/" className="btn-primary">
          Open the Studio
        </Link>
        <Link href="/projects/" className="btn-ghost">
          My Projects
        </Link>
      </div>
    </div>
  );
}
