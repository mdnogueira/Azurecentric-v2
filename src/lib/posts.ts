import { getCollection, type CollectionEntry } from 'astro:content';
import { categories } from '../../site.config.mjs';
import type { Lang } from '../i18n/ui';

export type Post = CollectionEntry<'posts'>;

export function postLang(post: Post): Lang {
  return post.id.startsWith('pt/') ? 'pt' : 'en';
}

export function postSlug(post: Post): string {
  return post.id.replace(/^(en|pt)\//, '');
}

/** All published posts, newest first. Drafts and future-dated posts are hidden in production builds
 *  (the scheduled workflow rebuilds every 6 hours, so a future pubDate = scheduled publishing). */
export async function allPosts(): Promise<Post[]> {
  const now = Date.now();
  const posts = await getCollection('posts', (p) => import.meta.env.DEV || (!p.data.draft && p.data.pubDate.valueOf() <= now));
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Posts to list for a language: the PT version when it exists, otherwise the EN one.
 * One entry per translationKey.
 */
export async function postsFor(lang: Lang): Promise<Post[]> {
  const posts = await allPosts();
  const byKey = new Map<string, Post>();
  for (const p of posts) {
    const key = p.data.translationKey;
    const existing = byKey.get(key);
    if (!existing) byKey.set(key, p);
    else if (postLang(p) === lang && postLang(existing) !== lang) byKey.set(key, p);
  }
  return [...byKey.values()].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function translationOf(post: Post, lang: Lang): Promise<Post | undefined> {
  const posts = await allPosts();
  return posts.find((p) => p.data.translationKey === post.data.translationKey && postLang(p) === lang);
}

export function categoryName(key: string, lang: Lang): string {
  const c = (categories as Record<string, { en: string; pt: string }>)[key];
  return c ? c[lang] : key;
}

export function readingTime(post: Post): number {
  if (post.data.readingTime) return post.data.readingTime;
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export async function categoryCounts(lang: Lang): Promise<Array<{ key: string; name: string; count: number }>> {
  const posts = await postsFor(lang);
  const counts = new Map<string, number>();
  for (const p of posts) counts.set(p.data.category, (counts.get(p.data.category) ?? 0) + 1);
  const keys = new Set([...Object.keys(categories), ...counts.keys()]);
  return [...keys]
    .map((key) => ({ key, name: categoryName(key, lang), count: counts.get(key) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function allTags(lang: Lang): Promise<string[]> {
  const posts = await postsFor(lang);
  const tags = new Set<string>();
  for (const p of posts) for (const t of p.data.tags) tags.add(t);
  return [...tags].sort();
}
