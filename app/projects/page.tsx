import type { Metadata } from 'next';
import Link from 'next/link';
import ProjectsApp from '../../components/ProjectsApp';

export const metadata: Metadata = {
  title: 'My Projects',
  description: 'Your saved zipper lock screen designs, stored privately in this browser.',
  robots: { index: false },
};

export default function ProjectsPage() {
  return (
    <div className="wrap page">
      <div className="page-head row">
        <div>
          <p className="eyebrow">My projects</p>
          <h1>Saved designs</h1>
          <p className="muted">Stored only in this browser on this device. Clearing site data will remove them.</p>
        </div>
        <Link href="/studio/" className="btn-primary">
          + New design
        </Link>
      </div>
      <ProjectsApp />
    </div>
  );
}
