/**
 * JSON-LD helpers — mirror visible UI only.
 * Site URL always production (canonicals / sitemap locs), even on pages.dev preview.
 */
import type { Author, ExpertReviewer, FAQItem, Post } from '../types';
import { categoryHref, postHref } from './urls';

export const SITE_URL = 'https://thehealthissue.nl';
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const JOUKE_SAME_AS = [
  'https://www.facebook.com/thehealthissueblog/',
] as const;

export function absoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'The Health Issue',
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    sameAs: [...JOUKE_SAME_AS],
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: 'The Health Issue',
    publisher: { '@id': ORG_ID },
    inLanguage: 'nl-NL',
  };
}

/** Sitewide @graph for BaseLayout (home + every page). */
export function sitewideGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), websiteNode()],
  };
}

export function personNode(author?: Author | null) {
  const name = author?.name || 'Jouke de Jong';
  const sameAs = [
    ...JOUKE_SAME_AS,
    ...(author?.instagram ? [author.instagram] : []),
  ];
  return {
    '@type': 'Person',
    name,
    url: `${SITE_URL}/over-ons/`,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** reviewedBy only when a visible expert stamp exists in the UI. */
export function reviewedByNode(expert?: ExpertReviewer | null) {
  if (!expert?.name) return undefined;
  return {
    '@type': 'Person',
    name: expert.name,
    ...(expert.title ? { jobTitle: expert.title } : {}),
  };
}

export function breadcrumbList(post: Post) {
  const pageUrl = absoluteUrl(postHref(post))!;
  const items: Array<Record<string, unknown>> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    },
  ];
  if (post.category?.slug?.current) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: post.category.title,
      item: absoluteUrl(categoryHref(post.category.slug.current)),
    });
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: pageUrl,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: post.title,
      item: pageUrl,
    });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function faqPageSchema(faq?: FAQItem[] | null) {
  if (!faq?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function articleSchema(opts: {
  post: Post;
  image?: string | null;
  includeReviewedBy?: boolean;
}) {
  const { post, image, includeReviewedBy } = opts;
  const url = absoluteUrl(postHref(post));
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: url,
    author: personNode(post.author),
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: 'nl-NL',
  };
  const absImage = absoluteUrl(image || undefined);
  if (absImage) schema.image = absImage;
  if (includeReviewedBy && post.expertReviewer) {
    schema.reviewedBy = reviewedByNode(post.expertReviewer);
  }
  return schema;
}

export type ItemListProductInput = {
  name: string;
  position: number;
  url?: string;
  image?: string | null;
  brand?: string | null;
};

export function itemListSchema(products: ItemListProductInput[]) {
  if (!products.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: products.length,
    itemListElement: products.map((p) => {
      const product: Record<string, unknown> = {
        '@type': 'Product',
        name: p.name,
      };
      const img = absoluteUrl(p.image || undefined);
      if (img) product.image = img;
      if (p.brand) product.brand = { '@type': 'Brand', name: p.brand };
      const listItem: Record<string, unknown> = {
        '@type': 'ListItem',
        position: p.position,
        name: p.name,
        item: product,
      };
      if (p.url) listItem.url = absoluteUrl(p.url);
      return listItem;
    }),
  };
}

export function reviewSchema(opts: {
  post: Post;
  productName: string;
  image?: string | null;
  brand?: string | null;
  reviewBody?: string | null;
  /** Only pass when a visible score exists in the UI (e.g. X/10). */
  ratingValue?: number | null;
  bestRating?: number;
  worstRating?: number;
  includeReviewedBy?: boolean;
}) {
  const {
    post,
    productName,
    image,
    brand,
    reviewBody,
    ratingValue,
    bestRating = 10,
    worstRating = 0,
    includeReviewedBy,
  } = opts;

  const itemReviewed: Record<string, unknown> = {
    '@type': 'Product',
    name: productName,
  };
  const absImage = absoluteUrl(image || undefined);
  if (absImage) itemReviewed.image = absImage;
  if (brand) itemReviewed.brand = { '@type': 'Brand', name: brand };

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: personNode(post.author),
    publisher: { '@id': ORG_ID },
    itemReviewed,
  };
  if (reviewBody) schema.reviewBody = reviewBody;
  if (typeof ratingValue === 'number') {
    schema.reviewRating = {
      '@type': 'Rating',
      ratingValue,
      bestRating,
      worstRating,
    };
  }
  if (includeReviewedBy && post.expertReviewer) {
    schema.reviewedBy = reviewedByNode(post.expertReviewer);
  }
  return schema;
}

/**
 * Cheap sat→money internal link when no Sanity relatedComparison exists.
 * Returns null when the post itself is already the money page.
 */
export function relatedMoneyHint(post: Post): { title: string; href: string } | null {
  const href = postHref(post);
  const slug = (post.slug?.current || '').toLowerCase();
  const cat = (post.category?.slug?.current || '').toLowerCase();
  const hay = `${cat}/${slug}`;

  const hints: Array<{ match: RegExp; title: string; href: string }> = [
    {
      match: /magnesium|bisglycinaat/,
      title: 'Beste magnesiumbisglycinaat — vergelijking',
      href: '/supplementen/beste-magnesium-bisglycinaat/',
    },
    {
      match: /ashwagandha|ksm-?66/,
      title: 'Beste ashwagandha kopen — vergelijking',
      href: '/supplementen/beste-ashwagandha-kopen/',
    },
    {
      match: /elektrolyt/,
      title: 'Beste elektrolytenpoeder — vergelijking',
      href: '/gezondheid/beste-elektrolyten-poeder/',
    },
    {
      match: /roeitrainer|roeien/,
      title: 'Beste roeitrainers — vergelijking',
      href: '/training/beste-roeitrainers/',
    },
    {
      match: /plnkt|plankton|fytoplankton/,
      title: 'PLNKT review — eerlijke test',
      href: '/supplementen/plnkt-review/',
    },
  ];

  for (const h of hints) {
    if (!h.match.test(hay)) continue;
    if (href === h.href) return null;
    return { title: h.title, href: h.href };
  }
  return null;
}

/** Best-effort brand from product name (first token before space if looks like brand). */
export function guessBrand(name: string): string | undefined {
  const first = name.trim().split(/\s+/)[0];
  if (!first || first.length < 2) return undefined;
  // Skip generic Dutch starters
  if (/^(de|het|een|beste|magnesium|ashwagandha)$/i.test(first)) return undefined;
  return first.replace(/[.,]$/, '');
}
