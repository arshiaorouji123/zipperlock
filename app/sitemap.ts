import type { MetadataRoute } from 'next';
import { GUIDES } from '../lib/guides';
import { TOOLS } from '../lib/tools';
import { CATEGORIES } from '../lib/library';
import { SITE } from '../lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date('2026-11-09');
  const pages: [string, number, 'weekly' | 'monthly' | 'yearly'][] = [
    ['/', 1, 'weekly'],
    ['/studio/', 0.95, 'monthly'],
    ['/designs/', 0.9, 'weekly'],
    ['/simulator/', 0.85, 'monthly'],
    ['/styles/', 0.8, 'monthly'],
    ['/themes/', 0.8, 'weekly'],
    ['/tools/', 0.8, 'monthly'],
    ['/guides/', 0.75, 'weekly'],
    ['/about/', 0.4, 'yearly'],
    ['/contact/', 0.3, 'yearly'],
    ['/privacy/', 0.2, 'yearly'],
    ['/terms/', 0.2, 'yearly'],
    ['/disclaimer/', 0.2, 'yearly'],
    ['/cookies/', 0.2, 'yearly'],
  ];
  return [
    ...pages.map(([p, priority, changeFrequency]) => ({ url: SITE.url + p, lastModified: now, priority, changeFrequency })),
    ...TOOLS.filter((t) => t.href.startsWith('/tools/')).map((t) => ({ url: SITE.url + t.href, lastModified: now, priority: 0.7, changeFrequency: 'monthly' as const })),
    ...Object.keys(CATEGORIES).map((c) => ({ url: `${SITE.url}/designs/${c}/`, lastModified: now, priority: 0.75, changeFrequency: 'weekly' as const })),
    ...GUIDES.map((g) => ({ url: `${SITE.url}/guides/${g.slug}/`, lastModified: new Date(g.updated), priority: 0.65, changeFrequency: 'monthly' as const })),
  ];
}
