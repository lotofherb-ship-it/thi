/**
 * Build-time product offer resolver for Astro money pages.
 *
 * Priority: Awin (tursoProductId / network) → Daisycon → Bol (manual partner.bol.com only).
 *
 * Production (PROD / CF_PAGES / CI, and ALLOW_FIXTURES off):
 * - No fuzzy name search
 * - No fixture / example.com fallbacks
 * - Each pick needs tursoProductId and/or affiliateUrl
 *
 * Local preview: ALLOW_FIXTURES=1 restores soft fallbacks for UI work.
 */

import type { ComparisonProduct } from '../../types';
import { PRODUCT_OFFER_FIXTURES } from './fixtures';
import {
  getOffersByEan,
  getProductById,
  rowToOffer,
  searchProducts,
  type AffiliateProductRow,
} from './db';

export type OfferSource = 'manual' | 'fixture' | 'awin' | 'daisycon';

export interface ProductOffer {
  merchant: string;
  price: string;
  url: string;
  currency?: string;
  source: OfferSource;
  productId?: number;
}

export interface ResolvedProduct extends ComparisonProduct {
  offers: ProductOffer[];
  /** Filled from DB when tursoProductId resolves */
  resolvedFromDb?: boolean;
  /** Affiliate-feed pack shot when present (products.image_url). */
  feedImageUrl?: string | null;
  /** True when prod harden stripped commerce (no valid offers). */
  commerceGap?: boolean;
}

const allowFixtures =
  process.env.ALLOW_FIXTURES === '1' || process.env.ALLOW_FIXTURES === 'true';

function isProdBuild(): boolean {
  const viteProd =
    typeof import.meta !== 'undefined' &&
    Boolean((import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD);
  return (
    viteProd ||
    process.env.CF_PAGES === '1' ||
    process.env.CI === 'true' ||
    process.env.NODE_ENV === 'production'
  );
}

function failBuild(message: string): never {
  console.error(`\n[thi-resolve] ${message}\n`);
  process.exitCode = 1;
  throw new Error(message);
}

function isFixtureHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host === 'example.com' || host.endsWith('.example.com');
  } catch {
    return true;
  }
}

function isBolPartnerUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    return host === 'partner.bol.com' || (host === 'bol.com' && u.pathname.includes('/click'));
  } catch {
    return false;
  }
}

function looksLikeBolMerchant(product: ComparisonProduct): boolean {
  const shop = (product.shop || '').toLowerCase();
  return shop.includes('bol');
}

function fixtureOffersFor(product: ComparisonProduct): ProductOffer[] {
  const name = (product.name || '').toLowerCase();
  return PRODUCT_OFFER_FIXTURES
    .filter(f => {
      if (f.tursoProductId != null && product.tursoProductId === f.tursoProductId) return true;
      if (f.matchName && name.includes(f.matchName.toLowerCase())) return true;
      return false;
    })
    .map(f => ({
      merchant: f.merchant,
      price: f.price,
      url: f.url,
      currency: f.currency || 'EUR',
      source: 'fixture' as const,
    }));
}

function dedupe(offers: ProductOffer[]): ProductOffer[] {
  const seen = new Set<string>();
  return offers.filter(o => {
    const k = `${o.merchant.toLowerCase()}|${o.url}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Awin → Daisycon → other manual → Bol partner → fixtures. */
function networkRank(offer: ProductOffer): number {
  if (offer.source === 'awin') return 0;
  if (offer.source === 'daisycon') return 1;
  if (offer.source === 'manual') {
    if (isBolPartnerUrl(offer.url)) return 40;
    return 20;
  }
  if (offer.source === 'fixture') return 90;
  return 30;
}

function sortByNetworkPriority(offers: ProductOffer[]): ProductOffer[] {
  return [...offers].sort((a, b) => networkRank(a) - networkRank(b));
}

function offerFromRow(row: AffiliateProductRow): ProductOffer {
  const o = rowToOffer(row);
  return {
    merchant: o.merchant,
    price: o.price,
    url: o.url,
    currency: o.currency,
    source: o.source,
    productId: o.productId,
  };
}

function assertPointer(product: ComparisonProduct): void {
  if (product.tursoProductId || product.affiliateUrl) return;
  const label = product.name || '(unnamed pick)';
  if (allowFixtures) {
    console.warn(`[thi-resolve] ${label}: no tursoProductId/affiliateUrl (fixtures allowed)`);
    return;
  }
  if (isProdBuild()) {
    failBuild(
      `Money-page pick "${label}" has neither tursoProductId nor affiliateUrl. ` +
        `Link Awin/Daisycon via tursoProductId, or set affiliateUrl (Bol = partner.bol.com only).`,
    );
  }
}

function acceptManualUrl(product: ComparisonProduct, url: string): boolean {
  if (isFixtureHost(url)) {
    if (allowFixtures) return true;
    if (isProdBuild()) {
      console.warn(
        `[thi-resolve] Rejecting fixture/example URL for "${product.name || '?'}": ${url}`,
      );
      return false;
    }
    return false;
  }
  // Bol merchant must use Partner deep link — not a bare bol.com PDP without partner click
  if (looksLikeBolMerchant(product) || url.includes('bol.com')) {
    if (isBolPartnerUrl(url)) return true;
    if (allowFixtures) return true;
    if (isProdBuild()) {
      console.warn(
        `[thi-resolve] Bol URL must be partner.bol.com for "${product.name || '?'}": ${url}`,
      );
      return false;
    }
  }
  return true;
}

/**
 * Resolve offers for one Sanity comparison product / honest-review synthetic.
 */
export async function resolveProductOffers(product: ComparisonProduct): Promise<ProductOffer[]> {
  assertPointer(product);

  const offers: ProductOffer[] = [];
  let primary: AffiliateProductRow | null = null;
  let dbError: string | null = null;

  try {
    if (product.tursoProductId) {
      primary = await getProductById(product.tursoProductId);
      if (primary) {
        offers.push(offerFromRow(primary));
        if (primary.ean) {
          const siblings = await getOffersByEan(primary.ean, 5);
          for (const s of siblings) {
            if (s.id === primary.id) continue;
            offers.push(offerFromRow(s));
          }
        }
      } else if (isProdBuild() && !allowFixtures && !product.affiliateUrl) {
        failBuild(
          `tursoProductId=${product.tursoProductId} not found in affiliate DB for "${product.name || '?'}".`,
        );
      }
    }

    // Fuzzy name search — local fixtures mode only
    if (allowFixtures && !primary && product.name && !product.affiliateUrl) {
      const hits = await searchProducts(product.name, 3);
      for (const h of hits) offers.push(offerFromRow(h));
    }
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
    if (isProdBuild() && !allowFixtures) {
      failBuild(`Affiliate DB error for "${product.name || '?'}": ${dbError}`);
    }
  }

  if (product.affiliateUrl && acceptManualUrl(product, product.affiliateUrl)) {
    const already = offers.some(o => o.url === product.affiliateUrl);
    if (!already) {
      offers.push({
        merchant: product.shop || (isBolPartnerUrl(product.affiliateUrl) ? 'Bol.com' : 'Webshop'),
        price: product.price || '',
        url: product.affiliateUrl,
        currency: 'EUR',
        source: 'manual',
      });
    }
  }

  if (offers.length === 0 && allowFixtures) {
    offers.push(...fixtureOffersFor(product));
  }

  const cleaned = sortByNetworkPriority(
    dedupe(offers).filter(o => {
      if (o.source === 'fixture' && !allowFixtures) return false;
      if (isFixtureHost(o.url) && !allowFixtures) return false;
      return true;
    }),
  );

  if (cleaned.length === 0 && isProdBuild() && !allowFixtures) {
    failBuild(
      `No valid affiliate offers for "${product.name || '?'}". ` +
        `Need working tursoProductId (Awin/Daisycon) or affiliateUrl (Bol = partner.bol.com).`,
    );
  }

  return cleaned;
}

/**
 * Resolve products and overlay live feed fields onto editorial Sanity data.
 * Editorial (name, rating, pros, verdict) stays from Sanity.
 * Commerce prefers DB when tursoProductId resolves (after network sort).
 */
export async function resolveProducts(
  products: ComparisonProduct[],
): Promise<ResolvedProduct[]> {
  return Promise.all(
    products.map(async p => {
      const offers = await resolveProductOffers(p);

      if (p.extraOffers?.length) {
        for (const x of p.extraOffers) {
          if (!acceptManualUrl(p, x.url)) continue;
          offers.push({
            merchant: x.merchant,
            price: x.price,
            url: x.url,
            currency: 'EUR',
            source: 'manual',
          });
        }
      }
      const merged = sortByNetworkPriority(dedupe(offers));

      let feedImageUrl: string | null = null;
      try {
        if (p.tursoProductId) {
          const row = await getProductById(p.tursoProductId);
          if (row?.image_url) feedImageUrl = row.image_url;
        }
      } catch {
        if (isProdBuild() && !allowFixtures) {
          /* already failed in resolveProductOffers on hard errors */
        }
      }

      const primary = merged[0];
      const fromDb = Boolean(
        p.tursoProductId && (primary?.source === 'awin' || primary?.source === 'daisycon'),
      );

      return {
        ...p,
        price: primary?.price || p.price,
        shop: primary?.merchant || p.shop,
        affiliateUrl: primary?.url || p.affiliateUrl,
        offers: merged,
        feedImageUrl,
        resolvedFromDb: fromDb,
        commerceGap: merged.length === 0,
      };
    }),
  );
}

/** Prefer Sanity → feed → editorial imageUrl for pick media. */
export function resolveProductImageUrl(
  product: ResolvedProduct,
  sanityUrl: string | null,
): string | null {
  return sanityUrl || product.feedImageUrl || product.imageUrl || null;
}

/** Quiet WC-style offer label: “€15,16 bij Superfoodstore”. */
export function offerLine(offer: ProductOffer): string {
  if (offer.price) return `${offer.price} bij ${offer.merchant}`;
  return `Bekijk bij ${offer.merchant}`;
}

export function pickLabel(
  product: ComparisonProduct,
  index: number,
): { key: string; label: string } {
  if (product.badge === 'winner' || index === 0) return { key: 'top', label: 'Topkeuze' };
  if (product.badge === 'runner-up' || index === 1) return { key: 'runner', label: 'Runner-up' };
  if (product.badge === 'budget') return { key: 'budget', label: 'Budgetkeuze' };
  return { key: 'also', label: 'Ook goed' };
}
