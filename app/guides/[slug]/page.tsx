import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '../../../components/AdSlot';
import JsonLd from '../../../components/JsonLd';
import { GUIDES, getGuide } from '../../../lib/guides';
import { SITE } from '../../../lib/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}/` },
    openGraph: { type: 'article', title: g.title, description: g.description, modifiedTime: g.updated },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  const url = `${SITE.url}/guides/${g.slug}/`;
  return (
    <article className="wrap page narrow article">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/guides/">Guides</Link> <span aria-hidden>›</span> <span>{g.title}</span>
      </nav>
      <header className="page-head">
        <h1>{g.title}</h1>
        <p className="lead">{g.description}</p>
        <p className="small muted">
          Updated <time dateTime={g.updated}>{new Date(g.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</time> ·{' '}
          {g.readMins} min read
        </p>
      </header>
      <div className="prose">
        {g.body.map((b, i) => (
          <div key={i}>
            {b.h && <h2>{b.h}</h2>}
            {b.p && <p>{b.p}</p>}
            {b.ol && (
              <ol>
                {b.ol.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
            )}
            {b.ul && (
              <ul>
                {b.ul.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
            {b.tip && (
              <p className="tip">
                <b>Tip:</b> {b.tip}
              </p>
            )}
            {i === 3 && <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} />}
          </div>
        ))}
      </div>
      <div className="article-cta">
        <Link href={g.cta.href} className="btn-primary lg">
          {g.cta.label}
        </Link>
      </div>
      <section className="related">
        <h2>Keep reading</h2>
        <div className="guide-list">
          {others.map((o) => (
            <Link key={o.slug} href={`/guides/${o.slug}/`} className="guide-card">
              <h3>{o.title}</h3>
              <p className="muted small">{o.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Article',
              headline: g.title,
              description: g.description,
              dateModified: g.updated,
              datePublished: g.updated,
              mainEntityOfPage: url,
              author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
              publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icons/icon-512.png` } },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Guides', item: `${SITE.url}/guides/` },
                { '@type': 'ListItem', position: 2, name: g.title, item: url },
              ],
            },
          ],
        }}
      />
    </article>
  );
}
