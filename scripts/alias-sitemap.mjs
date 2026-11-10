/**
 * Copy sitemap-index.xml → sitemap.xml so /sitemap.xml 200s on Pages
 * without relying only on _redirects (preview discoverability).
 */
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const src = resolve(dist, 'sitemap-index.xml');
const dest = resolve(dist, 'sitemap.xml');

if (!existsSync(src)) {
  console.warn('[alias-sitemap] no sitemap-index.xml — skip');
  process.exit(0);
}
copyFileSync(src, dest);
console.log('[alias-sitemap] wrote dist/sitemap.xml');
