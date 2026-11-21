import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LibraryBrowser from '../../../components/LibraryBrowser';
import JsonLd from '../../../components/JsonLd';
import { CATEGORIES, LIBRARY, type CatId } from '../../../lib/library';
import { SITE } from '../../../lib/site';

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((cat) => ({ cat }));
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const c = CATEGORIES[(await params).cat as CatId];
  if (!c) return {};
  const cat = (await params).cat as CatId;
  const n = LIBRARY.filter((d) => d.cat === cat).length;
  return {
    title: `${c.name} Zipper Lock Screens — ${n} Designs`,
    description: `${c.intro.split('. ')[0]}. ${n} original designs you can preview, customise and download free.`,
    alternates: { canonical: `/designs/${cat}/` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const cat = (await params).cat as CatId;
  const c = CATEGORIES[cat];
  if (!c) notFound();
  const items = LIBRARY.filter((d) => d.cat === cat);
  const others = (Object.keys(CATEGORIES) as CatId[]).filter((x) => x !== cat);
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/designs/">Design library</Link> <span aria-hidden>›</span> <span>{c.name}</span>
      </nav>
      <div className="page-head">
        <h1>{c.name} zipper lock screens</h1>
        <p className="muted">{c.intro}</p>
        <p className="small muted">
          {items.length} designs · levels {Math.min(...items.map((d) => d.level))}–{Math.max(...items.map((d) => d.level))}
        </p>
      </div>
      <LibraryBrowser initialCat={cat} lockCat />
      <section className="more-tools">
        <h2>More categories</h2>
        <nav className="cat-links" aria-label="Other categories">
          {others.map((o) => (
            <Link key={o} href={`/designs/${o}/`}>
              {CATEGORIES[o].name}
            </Link>
          ))}
        </nav>
      </section>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: `${c.name} zipper lock screens`,
              url: `${SITE.url}/designs/${cat}/`,
              description: c.intro,
              numberOfItems: items.length,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Design library', item: `${SITE.url}/designs/` },
                { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE.url}/designs/${cat}/` },
              ],
            },
          ],
        }}
      />
    </div>
  );
}
