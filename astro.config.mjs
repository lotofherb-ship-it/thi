import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Dual host behavior (intentional):
 * - Preview serves on thi-astro.pages.dev with CF `x-robots-tag: noindex`.
 * - `site` stays https://thehealthissue.nl so sitemap <loc>, canonicals, and OG urls
 *   are production-ready for cutover. Do NOT point site at pages.dev.
 * - Discoverability on preview: /sitemap-index.xml + /sitemap-0.xml;
 *   /sitemap.xml copied at build + _redirects alias; footer link;
 *   robots.txt lists pages.dev + production Sitemap URLs.
 */
export default defineConfig({
  site: 'https://thehealthissue.nl',
  // Match live WP URL shape (trailing slash + one-hop /x → /x/)
  trailingSlash: 'always',
  integrations: [
    // Pin @astrojs/sitemap to 3.2.x in package.json — 3.7.x crashes on Astro 4
    sitemap(),
  ],
  output: 'static',
  vite: {
    optimizeDeps: {
      include: ['@sanity/client', '@sanity/image-url'],
    },
  },
});
