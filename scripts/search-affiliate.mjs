#!/usr/bin/env node
/**
 * CLI: search the same products.db the WP plugin used.
 * Usage:
 *   node scripts/search-affiliate.mjs "magnesium bisglycinaat" --top 8
 *   node scripts/search-affiliate.mjs --id 11451
 *
 * Run from thi-astro/. Uses AFFILIATE_DB_PATH or ../affiliate/db/products.db
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath =
  process.env.AFFILIATE_DB_PATH ||
  path.resolve(__dirname, '../../affiliate/db/products.db');

const args = process.argv.slice(2);
const idFlag = args.indexOf('--id');
const topFlag = args.indexOf('--top');
const top = topFlag >= 0 ? Number(args[topFlag + 1]) || 8 : 8;
const query = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--id' && args[i - 1] !== '--top').join(' ');

const db = new DatabaseSync(dbPath, { readOnly: true });

if (idFlag >= 0) {
  const id = Number(args[idFlag + 1]);
  const row = db.prepare(
    `SELECT id, product_name, merchant_name, display_price, ean, affiliate_url
     FROM products WHERE id = ?`,
  ).get(id);
  console.log(row ? JSON.stringify(row, null, 2) : 'not found');
  process.exit(0);
}

if (!query) {
  console.error('Usage: node scripts/search-affiliate.mjs "<query>" [--top 8]');
  console.error('       node scripts/search-affiliate.mjs --id 12345');
  process.exit(1);
}

const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
const conditions = terms
  .map(() => `(LOWER(product_name) LIKE ? OR LOWER(keywords) LIKE ? OR LOWER(brand) LIKE ?)`)
  .join(' AND ');
const params = [];
for (const t of terms) {
  const like = `%${t}%`;
  params.push(like, like, like);
}
params.push(top);

const rows = db
  .prepare(
    `SELECT id, product_name, merchant_name, display_price, ean, brand, affiliate_url
     FROM products WHERE ${conditions} ORDER BY price ASC LIMIT ?`,
  )
  .all(...params);

console.log(`\n${rows.length} hits in ${dbPath}\n`);
for (const r of rows) {
  console.log(`[${r.id}] ${r.display_price} · ${r.merchant_name}`);
  console.log(`    ${r.product_name}`);
  console.log(`    EAN ${r.ean || '—'} · ${String(r.affiliate_url || '').slice(0, 70)}…\n`);
}

db.close();
