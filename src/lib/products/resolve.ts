/**
 * Build-time product offer resolver for Astro money pages.
 *
 * Data source = same engine as old WP:
 *   Python sync (Awin CSV) → products.db → (optional Turso) → this module
 *
 * Plug order per ComparisonProduct:
 * 1. tursoProductId → products.id (live price + affiliate URL + shop)
 * 2. Same EAN → extra merchant offers (WC multi-buy)
 * 3. Manual Sanity fields (affiliateUrl / price / shop) as fallback
 * 4. Fixtures only when nothing else resolves (dev)
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

/** Awin → Daisycon → manual/fixture (Bol last-resort lives in manual). */
function networkRank(o: ProductOffer): number {
  if (o.source === 'awin') return 0;
  if (o.source === 'daisycon') return 1;
  if (o.source === 'manual') {
    try {
      const host = new URL(o.url).hostname.replace(/^www\./, '');
      if (host === 'partner.bol.com' || host === 'bol.com') return 3;
    } catch {
      /* keep manual mid-rank */
    }
    return 2;
  }
  return 4;
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

export interface ResolvedOffers {
  offers: ProductOffer[];
  /** Merchant pack shot from Awin/Daisycon row when present. */
  feedImageUrl: string | null;
}

/**
 * Resolve offers + feed pack shot for one Sanity comparison product.
 */
export async function resolveProductCommerce(
  product: ComparisonProduct,
): Promise<ResolvedOffers> {
  const offers: ProductOffer[] = [];
  let primary: AffiliateProductRow | null = null;
  let feedImageUrl: string | null = null;

  try {
    if (product.tursoProductId) {
      primary = await getProductById(product.tursoProductId);
      if (primary) {
        offers.push(offerFromRow(primary));
        if (primary.image_url) feedImageUrl = primary.image_url;
        // Cross-merchant via EAN (Wirecutter multi-buy)
        if (primary.ean) {
          const siblings = await getOffersByEan(primary.ean, 5);
          for (const s of siblings) {
            if (s.id === primary.id) continue;
            offers.push(offerFromRow(s));
            if (!feedImageUrl && s.image_url) feedImageUrl = s.image_url;
          }
        }
      }
    }

    // Soft fallback: search by product name if no ID linked yet
    if (!primary && product.name && !product.affiliateUrl) {
      const hits = await searchProducts(product.name, 3);
      for (const h of hits) {
        offers.push(offerFromRow(h));
        if (!feedImageUrl && h.image_url) feedImageUrl = h.image_url;
      }
    }

    // Feed image via primary offer productId when ID path missed image
    if (!feedImageUrl) {
      const ranked = sortByNetworkPriority(dedupe(offers));
      const pid = ranked.find(o => o.productId)?.productId;
      if (pid) {
        const row = await getProductById(pid);
        if (row?.image_url) feedImageUrl = row.image_url;
      }
    }
  } catch {
    // Never break the Astro build
  }

  if (product.affiliateUrl) {
    const already = offers.some(o => o.url === product.affiliateUrl);
    if (!already) {
      // Append then sort — do not unshift ahead of Awin/Daisycon feed hits
      offers.push({
        merchant: product.shop || 'Webshop',
        price: product.price || '',
        url: product.affiliateUrl,
        currency: 'EUR',
        source: 'manual',
      });
    }
  }

  if (offers.length === 0) {
    offers.push(...fixtureOffersFor(product));
  }

  return {
    offers: sortByNetworkPriority(dedupe(offers)),
    feedImageUrl,
  };
}

/** Resolve offers for one Sanity comparison product. */
export async function resolveProductOffers(
  product: ComparisonProduct,
): Promise<ProductOffer[]> {
  const { offers } = await resolveProductCommerce(product);
  return offers;
}

/**
 * Resolve products and overlay live feed fields onto editorial Sanity data.
 * Editorial (name, rating, pros, verdict) stays from Sanity.
 * Commerce (price, shop, URL, image) prefers DB when tursoProductId is set.
 */
export async function resolveProducts(
  products: ComparisonProduct[],
): Promise<ResolvedProduct[]> {
  return Promise.all(
    products.map(async p => {
      const { offers: baseOffers, feedImageUrl } = await resolveProductCommerce(p);
      const offers = [...baseOffers];

      // Editorial alt merchants (demo / Sanity) — always merge after feed
      if (p.extraOffers?.length) {
        for (const x of p.extraOffers) {
          offers.push({
            merchant: x.merchant,
            price: x.price,
            url: x.url,
            currency: 'EUR',
            source: 'manual',
          });
        }
      }
      const ranked = sortByNetworkPriority(dedupe(offers));
      const primary = ranked[0];
      const fromDb = Boolean(
        primary?.source === 'awin' || primary?.source === 'daisycon',
      );

      return {
        ...p,
        // Overlay live commerce fields for templates that still read p.price / p.shop
        price: primary?.price || p.price,
        shop: primary?.merchant || p.shop,
        affiliateUrl: primary?.url || p.affiliateUrl,
        offers: ranked,
        feedImageUrl,
        resolvedFromDb: fromDb,
      };
    }),
  );
}

/**
 * Pick-card media: dedicated Sanity product shot → merchant feed pack shot →
 * editorial imageUrl. Never invent a bottle placeholder when the feed has a URL.
 */
export function resolveProductImageUrl(
  product: ResolvedProduct,
  sanityUrl: string | null,
): string | null {
  return sanityUrl || product.feedImageUrl || product.imageUrl || null;
}

/** Strip shop TLDs for cleaner CTA (“Betersport.nl” → “Betersport”). */
export function merchantDisplayName(merchant: string): string {
  const raw = (merchant || 'webshop').trim();
  if (!raw) return 'webshop';
  return raw
    .replace(/\.(nl|com|be|de|eu|net|shop|store)$/i, '')
    .replace(/^www\./i, '')
    .trim() || raw;
}

/** Quiet WC-style offer label: “€15,16 bij Superfoodstore”. */
export function offerLine(offer: ProductOffer): string {
  const shop = merchantDisplayName(offer.merchant);
  if (offer.price) return `${offer.price} bij ${shop}`;
  return `Bekijk bij ${shop}`;
}

/**
 * Soft pre-PDP CTA: action + merchant primary, price secondary.
 * Primary: “Bekijk bij Betersport” / alt: “Naar Vitaminstore”.
 */
export function offerCta(offer: ProductOffer, variant: 'primary' | 'alt' = 'primary'): {
  action: string;
  price: string;
} {
  const shop = merchantDisplayName(offer.merchant);
  const action =
    variant === 'alt' ? `Naar ${shop}` : `Bekijk bij ${shop}`;
  return { action, price: offer.price || '' };
}

/** Compact ACM-ok footnote under buy modules (sitewide strip already exists). */
export const PICK_DISC_SHORT =
  'Partnerlink — commissie mogelijk, zelfde prijs voor jou.';

export function pickLabel(
  product: ComparisonProduct,
  index: number,
): { key: string; label: string } {
  if (product.badge === 'winner' || index === 0) return { key: 'top', label: 'Topkeuze' };
  if (product.badge === 'runner-up' || index === 1) return { key: 'runner', label: 'Runner-up' };
  if (product.badge === 'budget') return { key: 'budget', label: 'Budgetkeuze' };
  return { key: 'also', label: 'Ook goed' };
}
