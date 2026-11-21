import Link from 'next/link';
import type { ReactNode } from 'react';
import { getTool, TOOLS } from '../../lib/tools';

/** Shared header + "more tools" footer for every tool page. */
export default function ToolPage({ slug, intro, children, about }: { slug: string; intro: string; children: ReactNode; about?: ReactNode }) {
  const t = getTool(slug);
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/tools/">Tools</Link> <span aria-hidden>›</span> <span>{t.name}</span>
      </nav>
      <div className="page-head">
        <h1>
          <span aria-hidden>{t.icon}</span> {t.name}
        </h1>
        <p className="muted">{intro}</p>
      </div>
      {children}
      {about && <section className="tool-about">{about}</section>}
      <section className="more-tools">
        <h2>More tools</h2>
        <div className="tool-grid">
          {TOOLS.filter((x) => x.slug !== slug)
            .slice(0, 4)
            .map((x) => (
              <Link key={x.slug} href={x.href} className="tool">
                <b>
                  {x.icon} {x.name}
                </b>
                <span>{x.blurb}</span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
