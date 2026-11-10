import type { PortableTextBlock } from '@portabletext/types';

export interface SanitySlug {
  current: string;
}

export interface SanityImage {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
  hotspot?: { x: number; y: number; height: number; width: number };
  alt?: string;
}

export interface Author {
  _id?: string;
  name: string;
  slug?: SanitySlug;
  avatar?: SanityImage;
  bio?: string;
  credentials?: string;
  instagram?: string;
}

export interface Category {
  _id?: string;
  title: string;
  slug: SanitySlug;
  description?: string;
  heroImage?: SanityImage;
  color?: string;
  order?: number;
}

/** Spec cell for Wirecutter-style compare tables (category-specific). */
export interface ProductSpec {
  key: string;
  label: string;
  value: string;
}

export interface ProductExtraOffer {
  merchant: string;
  price: string;
  url: string;
}

/** Rejected / also-looked-at product blurb (“Wat we ook bekeken”). */
export interface AlsoConsideredItem {
  name: string;
  blurb: string;
}

export interface ComparisonProduct {
  name: string;
  badge?: 'winner' | 'runner-up' | 'budget' | '';
  tagline?: string;
  rating: number;
  price?: string;
  priceNote?: string;
  shop?: string;
  affiliateUrl?: string;
  image?: SanityImage;
  /** External / affiliate-feed image URL (used when Sanity image missing). */
  imageUrl?: string;
  pros?: string[];
  cons?: string[];
  verdict?: string;
  /** Category specs for the vergelijking table (vorm, dosering, …). */
  specs?: ProductSpec[];
  /** Extra merchant rows merged after feed resolve (outline alt offers). */
  extraOffers?: ProductExtraOffer[];
  tursoProductId?: number;
  /** Path to the in-depth honest review for this single pick. */
  reviewUrl?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ExpertReviewer {
  name: string;
  title?: string;
  quote?: string;
}

export interface HonestReviewScore {
  ingredients?: number;
  dosage?: number;
  effect?: number;
  value?: number;
  taste?: number;
}

export interface HonestReviewWeekEntry {
  week: number;
  title?: string;
  body: string;
}

export interface HonestReview {
  productName?: string;
  testPeriod?: string;
  overallScore?: number;
  bestFor?: string;
  /** Short “minder geschikt als…” bullets for this one product. */
  notFor?: string[];
  tagline?: string;
  /** Editorial verdict paragraph under the hero buy module. */
  verdict?: string;
  /** Pack shot when no Sanity hero image. */
  imageUrl?: string;
  /** Affiliate products.db id for live offers (same as comparison pick). */
  tursoProductId?: number;
  /** Manual affiliate URL when product is not in Awin/Daisycon (e.g. PLNKT). */
  affiliateUrl?: string;
  shop?: string;
  price?: string;
  pros?: string[];
  cons?: string[];
  scores?: HonestReviewScore;
  weeklyEntries?: HonestReviewWeekEntry[];
  /** Back-link to the parent vergelijkingsartikel. */
  relatedComparison?: {
    title: string;
    href: string;
  };
}

export type PostTemplate = 'standard' | 'comparison' | 'honest-review' | 'nutrient';

export interface Post {
  _id: string;
  _createdAt?: string;
  title: string;
  slug: SanitySlug;
  template: PostTemplate;
  publishedAt?: string;
  updatedAt?: string;
  excerpt?: string;
  heroImage?: SanityImage;
  /** Fixture / CDN cover when Sanity hero is absent (home + category thumbs). */
  coverImageUrl?: string;
  /** Optional category-hub subhead grouping (e.g. “Magnesium”). */
  topicGroup?: string;
  seoTitle?: string;
  seoDescription?: string;
  category?: Category;
  author?: Author;
  /** Bridge to a related rekentool (“eerst behoefte, dan product”). */
  relatedCalculator?: { title: string; href: string };
  // Full post fields (only on single-post queries)
  quickAnswer?: string;
  keyTakeaways?: string[];
  body?: PortableTextBlock[];
  faq?: FAQItem[];
  expertReviewer?: ExpertReviewer;
  comparisonProducts?: ComparisonProduct[];
  comparisonDisclosure?: string;
  /** Ordered spec columns for #vergelijking (keys must match product.specs[].key). */
  comparisonSpecColumns?: { key: string; label: string }[];
  /** “Wat we ook bekeken” / concurrentie reject blurbs. */
  alsoConsidered?: AlsoConsideredItem[];
  /** Guide-specific trust copy (overrides generic Vertrouwen prose when set). */
  trustNarrative?: string;
  /** Optional continuous “voor wie” prose above the wel/niet split. */
  whoForProse?: string;
  honestReview?: HonestReview;
}
