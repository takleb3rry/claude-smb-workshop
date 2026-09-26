import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';

/** Public pages only. Welcome pages and the take-home track stay out of search. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${site.url}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
