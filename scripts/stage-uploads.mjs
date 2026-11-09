#!/usr/bin/env node
/**
 * Stage WP media into dist so /wp-content/uploads/* keeps working on Cloudflare Pages.
 *
 * Source (default): ../export/wp-2026-10-07/uploads  (~1009 files / ~165 MB)
 * Override: THI_UPLOADS_SRC=/path/to/uploads
 *
 * Run AFTER `npm run build`, BEFORE `wrangler pages deploy`.
 * Media is NOT committed to git — only the export on disk is copied into dist/.
 *
 * Durable: Pages serves the files from the deploy (no SiteGround/live-WP dependency).
 * After a fresher WP export, re-run this script and redeploy.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASTRO = resolve(__dirname, '..');
const THI = resolve(ASTRO, '..');
const SRC = resolve(
  process.env.THI_UPLOADS_SRC || join(THI, 'export/wp-2026-10-07/uploads'),
);
const DEST = join(ASTRO, 'dist/wp-content/uploads');

function countFiles(dir) {
  let n = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

if (!existsSync(join(ASTRO, 'dist'))) {
  console.error('dist/ missing — run `npm run build` first');
  process.exit(1);
}

if (!existsSync(SRC)) {
  console.error(`Uploads source missing: ${SRC}`);
  console.error('Set THI_UPLOADS_SRC or place the WP export under thi/export/…/uploads');
  process.exit(1);
}

mkdirSync(join(ASTRO, 'dist/wp-content'), { recursive: true });
rmSync(DEST, { recursive: true, force: true });
cpSync(SRC, DEST, { recursive: true });

const files = countFiles(DEST);
console.log(`Staged ${files} upload files → dist/wp-content/uploads/`);
console.log(`Source: ${SRC}`);
