import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site, categories } from '../../../site.config.mjs';
import { postsFor, postSlug, allPosts, categoryName } from '../../lib/posts';

export async function getStaticPaths() {
  const posts = await allPosts();
  const keys = new Set<string>([...Object.keys(categories), ...posts.map((p) => p.data.category)]);
  return [...keys].map((category) => ({ params: { category } }));
}

export async function GET(context: APIContext) {
  const category = context.params.category!;
  const posts = (await postsFor('en')).filter((p) => p.data.category === category);
  return rss({
    title: `${site.name} · ${categoryName(category, 'en')}`,
    description: site.description.en,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/posts/${postSlug(p)}`,
      categories: [p.data.category, ...p.data.tags],
    })),
  });
}
