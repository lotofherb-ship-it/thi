import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'e6out5at',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  useCdn: import.meta.env.PROD,
  apiVersion: '2024-01-01',
  token: import.meta.env.SANITY_API_READ_TOKEN,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ─── GROQ Queries ─────────────────────────────────────────────

export const postFields = `
  _id,
  title,
  slug,
  template,
  publishedAt,
  updatedAt,
  excerpt,
  heroImage,
  seoTitle,
  seoDescription,
  category-> { title, slug },
  author-> { name, slug, avatar, credentials, bio },
`;

/** Lightweight pick fields for homepage / hub cards (Topkeuze one-liner + cover fallback). */
export const postCardFields = `
  comparisonProducts[0..2] {
    name, badge, imageUrl
  },
  honestReview { productName, imageUrl, tagline },
`;

// All published posts (for static paths)
export const allPostsQuery = `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    ${postFields}
    ${postCardFields}
  }
`;

// Single post by slug
export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields}
    quickAnswer,
    keyTakeaways,
    body,
    faq,
    expertReviewer,
    comparisonProducts[] {
      name, badge, tagline, rating, price, priceNote,
      shop, affiliateUrl, image, pros, cons, verdict, tursoProductId,
      specs[] { key, label, value },
      extraOffers[] { merchant, price, url }
    },
    comparisonSpecColumns[] { key, label },
    comparisonDisclosure,
    whoForProse,
    whoFor,
    notFor,
    methodProse,
    methodCriteria,
    trustNarrative,
    alsoConsidered[] { name, blurb },
    honestReview {
      productName, testPeriod, bestFor, overallScore, scores, weeklyEntries,
      notFor, tagline, verdict, imageUrl, pros, cons,
      tursoProductId, affiliateUrl, shop, price, relatedComparison
    },
  }
`;

// Posts for a category page
export const postsByCategoryQuery = `
  *[_type == "post" && category->slug.current == $category && defined(slug.current)]
  | order(publishedAt desc) {
    ${postFields}
    ${postCardFields}
  }
`;

// All categories
export const allCategoriesQuery = `
  *[_type == "category"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    heroImage,
    color,
    order,
  }
`;

// Single category
export const categoryBySlugQuery = `
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    heroImage,
    color,
  }
`;

// Popular / recent posts for sidebar
export const recentPostsQuery = `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0..4] {
    title,
    slug,
    publishedAt,
    category-> { title, slug },
  }
`;

// All comparison posts (for vergelijken index)
export const allComparisonPostsQuery = `
  *[_type == "post" && template == "comparison" && defined(slug.current)]
  | order(publishedAt desc) {
    ${postFields}
    comparisonProducts[0..2] {
      name, badge, rating, price, imageUrl
    },
  }
`;

// All honest-review posts (for reviews index)
export const allReviewPostsQuery = `
  *[_type == "post" && template == "honest-review" && defined(slug.current)]
  | order(publishedAt desc) {
    ${postFields}
    honestReview { overallScore, bestFor, productName, imageUrl, tagline },
  }
`;
