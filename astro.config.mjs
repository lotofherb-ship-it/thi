import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
