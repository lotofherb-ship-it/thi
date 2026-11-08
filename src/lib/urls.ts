import type { Post } from '../types';

/**
 * Canonical article URL — matches live WordPress: /{category}/{slug}/
 * Template (comparison / honest-review / standard) does not change the path.
 */
export function postHref(post: Pick<Post, 'slug' | 'category'>): string {
  const category = post.category?.slug?.current || 'gezondheid';
  const slug = post.slug?.current;
  if (!slug) return `/${category}/`;
  return `/${category}/${slug}/`;
}

export function categoryHref(slug?: string): string {
  if (!slug) return '/';
  return `/${slug}/`;
}
