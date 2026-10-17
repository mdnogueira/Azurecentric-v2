import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts live in src/content/posts/<lang>/<file>.md
// The folder is the language; `translationKey` links an EN post to its PT version.
// The URL is /posts/<slug>: `slug` from the front-matter when present, otherwise the file name.
const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
    generateId: ({ entry, data }) => {
      const parts = entry.replace(/\.(md|mdx)$/, '').split('/');
      const lang = parts[0];
      const file = parts.slice(1).join('/');
      return `${lang}/${(data as { slug?: string }).slug ?? file}`;
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Optional. Overrides the URL slug (default: the file name). Keep it short and stable.
      slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
      description: z.string().max(200),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.string(),
      tags: z.array(z.string()).default([]),
      translationKey: z.string(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      readingTime: z.number().optional(),
      // Set by scripts/migrate-jekyll.py on posts imported from the old blog.
      legacy: z.boolean().default(false),
      legacyUrl: z.string().optional(),
    }),
});

// The About page bio: src/content/about/en.md and pt.md. Edit the markdown, nothing else.
const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: z.object({ title: z.string() }),
});

export const collections = { posts, about };
