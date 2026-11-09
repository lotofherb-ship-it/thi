/**
 * Affiliate product DB — same SQLite as the old WP thi-affiliate engine.
 *
 * Local (dev/build): AFFILIATE_DB_PATH → node:sqlite read-only
 * Remote (CI/prod):  TURSO_DATABASE_URL + TURSO_AUTH_TOKEN → @libsql/client
 *
 * Sync stays Python: thi/affiliate/sync/affiliate_sync.py → products.db
 * (optionally push that DB to Turso for Cloudflare Pages builds)
 */

import { createClient, type Client } from '@libsql/client';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type AffiliateNetwork = 'awin' | 'daisycon' | 'tradetracker' | string;

export interface AffiliateProductRow {
  id: number;
  network?: AffiliateNetwork | null;
  product_name: string;
  merchant_name: string;
  merchant_id?: number | null;
  price?: number | null;
  display_price?: string | null;
  currency?: string | null;
  ean?: string | null;
  brand?: string | null;
  affiliate_url?: string | null;
  image_url?: string | null;
  category?: string | null;
}

const AWIN_PUBLISHER_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.AWIN_PUBLISHER_ID) ||
  process.env.AWIN_PUBLISHER_ID ||
  '694187';

function defaultLocalDbPath(): string {
  const env =
    (typeof import.meta !== 'undefined' && import.meta.env?.AFFILIATE_DB_PATH) ||
    process.env.AFFILIATE_DB_PATH;
  if (env) return env;
  // thi-astro/ → ../affiliate/db/products.db
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../../../affiliate/db/products.db');
}

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    // Awin deep links — same guard as WP thi-affiliate plugin
    if (host === 'awin1.com') {
      if (!url.includes(`a=${AWIN_PUBLISHER_ID}`)) return null;
      return url;
    }
    // Daisycon click hosts (feed deep links)
    if (
      host === 'ds1.nl' ||
      host.endsWith('.daisycon.com') ||
      host.includes('fitwinkel.nl') ||
      host.includes('fr135.net') ||
      (host.startsWith('rep') && host.includes('.'))
    ) {
      return url;
    }
    // Other https affiliate / merchant deep links (Bol last-resort manual stays allowed)
    if (/^https?:$/i.test(new URL(url).protocol)) return url;
  } catch {
    return null;
  }
  return null;
}

function mapRow(row: Record<string, unknown>): AffiliateProductRow | null {
  const url = sanitizeUrl(String(row.affiliate_url || ''));
  if (!url) return null;
  return {
    id: Number(row.id),
    network: row.network != null ? String(row.network) : 'awin',
    product_name: String(row.product_name || ''),
    merchant_name: String(row.merchant_name || ''),
    merchant_id: row.merchant_id != null ? Number(row.merchant_id) : null,
    price: row.price != null ? Number(row.price) : null,
    display_price: row.display_price != null ? String(row.display_price) : null,
    currency: row.currency != null ? String(row.currency) : 'EUR',
    ean: row.ean != null ? String(row.ean) : null,
    brand: row.brand != null ? String(row.brand) : null,
    affiliate_url: url,
    image_url: row.image_url != null ? String(row.image_url) : null,
    category: row.category != null ? String(row.category) : null,
  };
}

let localDb: DatabaseSync | null = null;
let remoteClient: Client | null = null;

function getLocal(): DatabaseSync | null {
  if (localDb) return localDb;
  try {
    const p = defaultLocalDbPath();
    localDb = new DatabaseSync(p, { readOnly: true });
    return localDb;
  } catch {
    return null;
  }
}

function getRemote(): Client | null {
  if (remoteClient) return remoteClient;
  const url =
    (typeof import.meta !== 'undefined' && import.meta.env?.TURSO_DATABASE_URL) ||
    process.env.TURSO_DATABASE_URL;
  const token =
    (typeof import.meta !== 'undefined' && import.meta.env?.TURSO_AUTH_TOKEN) ||
    process.env.TURSO_AUTH_TOKEN;
  if (!url) return null;
  remoteClient = createClient({ url, authToken: token });
  return remoteClient;
}

const SELECT_COLS = `
  id, network, product_name, merchant_name, merchant_id, price, display_price,
  currency, ean, brand, affiliate_url, image_url, category
`;

export async function getProductById(id: number): Promise<AffiliateProductRow | null> {
  const remote = getRemote();
  if (remote) {
    const res = await remote.execute({
      sql: `SELECT ${SELECT_COLS} FROM products WHERE id = ? LIMIT 1`,
      args: [id],
    });
    const row = res.rows[0];
    if (!row) return null;
    return mapRow(row as unknown as Record<string, unknown>);
  }

  const db = getLocal();
  if (!db) return null;
  const row = db.prepare(`SELECT ${SELECT_COLS} FROM products WHERE id = ? LIMIT 1`).get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRow(row) : null;
}

export async function getOffersByEan(ean: string, limit = 5): Promise<AffiliateProductRow[]> {
  if (!ean) return [];
  const remote = getRemote();
  if (remote) {
    const res = await remote.execute({
      sql: `SELECT ${SELECT_COLS} FROM products WHERE ean = ? ORDER BY price ASC LIMIT ?`,
      args: [ean, limit],
    });
    return res.rows
      .map(r => mapRow(r as unknown as Record<string, unknown>))
      .filter((r): r is AffiliateProductRow => r !== null);
  }

  const db = getLocal();
  if (!db) return [];
  const rows = db
    .prepare(`SELECT ${SELECT_COLS} FROM products WHERE ean = ? ORDER BY price ASC LIMIT ?`)
    .all(ean, limit) as Record<string, unknown>[];
  return rows.map(mapRow).filter((r): r is AffiliateProductRow => r !== null);
}

export async function searchProducts(
  query: string,
  limit = 10,
): Promise<AffiliateProductRow[]> {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const conditions = terms
    .map(
      () =>
        `(LOWER(product_name) LIKE ? OR LOWER(keywords) LIKE ? OR LOWER(brand) LIKE ?)`,
    )
    .join(' AND ');
  const params: string[] = [];
  for (const t of terms) {
    const like = `%${t}%`;
    params.push(like, like, like);
  }

  const remote = getRemote();
  if (remote) {
    const res = await remote.execute({
      sql: `SELECT ${SELECT_COLS} FROM products WHERE ${conditions} ORDER BY price ASC LIMIT ?`,
      args: [...params, limit],
    });
    return res.rows
      .map(r => mapRow(r as unknown as Record<string, unknown>))
      .filter((r): r is AffiliateProductRow => r !== null);
  }

  const db = getLocal();
  if (!db) return [];
  const rows = db
    .prepare(
      `SELECT ${SELECT_COLS} FROM products WHERE ${conditions} ORDER BY price ASC LIMIT ?`,
    )
    .all(...params, limit) as Record<string, unknown>[];
  return rows.map(mapRow).filter((r): r is AffiliateProductRow => r !== null);
}

export function rowToOffer(row: AffiliateProductRow): {
  merchant: string;
  price: string;
  url: string;
  currency: string;
  source: 'awin' | 'daisycon';
  productId: number;
} {
  const net = (row.network || 'awin').toLowerCase();
  const source: 'awin' | 'daisycon' = net === 'daisycon' ? 'daisycon' : 'awin';
  return {
    merchant: row.merchant_name.replace(/\s+NL$/i, '') || row.merchant_name,
    price: row.display_price || (row.price != null ? `€${row.price.toFixed(2).replace('.', ',')}` : ''),
    url: row.affiliate_url!,
    currency: row.currency || 'EUR',
    source,
    productId: row.id,
  };
}
