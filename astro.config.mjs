// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './site.config.mjs';
import remarkFirstArticleImage from './scripts/remark-first-article-image.mjs';
import tagRedirects from './src/data/tag-redirects.json';

export default defineConfig({
  site: site.url,
  output: 'static',
  redirects: tagRedirects,
  markdown: { remarkPlugins: [remarkFirstArticleImage] },
  trailingSlash: 'never',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    // A page or post with no Portuguese version is served in English at the /pt URL
    // (rewrite, not redirect) — so PT is optional per post.
    fallback: { pt: 'en' },
    routing: { prefixDefaultLocale: false, fallbackType: 'rewrite' },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', pt: 'pt-PT' } },
    }),
  ],
  image: {
    // Hero/cover images are converted to AVIF/WebP at build time by sharp.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  vite: { build: { assetsInlineLimit: 0 } },
});
