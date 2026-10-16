import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../../site.config.mjs';
import { postsFor, postSlug } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await postsFor('en');
  return rss({
    title: site.name,
    description: site.description.en,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/posts/${postSlug(p)}`,
      categories: [p.data.category, ...p.data.tags],
    })),
    customData: '<language>en</language>',
  });
}
