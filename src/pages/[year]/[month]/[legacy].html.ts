// Old blog permalinks were /YYYY/MM/Title-With-Dashes.html.
// Every migrated post carries `legacyUrl`; this endpoint emits one tiny redirect page per old URL
// so links from search engines and other sites keep working. SWA serves them as static files.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { postSlug } from '../../../lib/posts';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts', (p) => p.data.legacy && !!p.data.legacyUrl && p.id.startsWith('en/'));
  return posts.map((post) => {
    const m = post.data.legacyUrl!.match(/^\/(\d{4})\/(\d{2})\/(.+)\.html$/);
    if (!m) return null;
    return { params: { year: m[1], month: m[2], legacy: m[3] }, props: { to: `/posts/${postSlug(post)}`, title: post.data.title } };
  }).filter(Boolean) as any;
};

export const GET: APIRoute = ({ props }) => {
  const { to } = props as { to: string; title: string };
  const title = String((props as any).title).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>` +
    `<meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><meta name="robots" content="noindex">` +
    `</head><body><p>This post moved to <a href="${to}">${to}</a>.</p></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
