/**
 * Content API — Sanity is the source of truth for production builds.
 *
 * Fixtures are opt-in for local prototype only (`ALLOW_FIXTURES=1`).
 * Production / Pages builds must fail when Sanity is unreachable or empty.
 */
import type { Category, Post } from '../types';
import {
  client,
  allPostsQuery,
  allCategoriesQuery,
  postBySlugQuery,
  postsByCategoryQuery,
  categoryBySlugQuery,
} from './sanity';
import { fixtureCategories, fixturePosts } from './fixtures/content';
import { isCutPost, withoutCutPosts } from './audit-content';

/** Shell / CI flag — not PUBLIC_*, so read via process.env during SSG. */
const allowFixtures =
  process.env.ALLOW_FIXTURES === '1' ||
  process.env.ALLOW_FIXTURES === 'true';

function isProdBuild(): boolean {
  // Astro sets PROD during `astro build`; also treat CI/Pages as prod-safe.
  return (
    import.meta.env.PROD === true ||
    process.env.CF_PAGES === '1' ||
    process.env.CI === 'true'
  );
}

function failBuild(message: string): never {
  // Ensure non-zero exit even if a caller swallows the error string.
  console.error(`\n[thi-content] ${message}\n`);
  process.exitCode = 1;
  throw new Error(message);
}

async function fetchOrThrow<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  try {
    return await client.fetch<T>(query, params ?? {});
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!allowFixtures && isProdBuild()) {
      failBuild(`Sanity fetch failed: ${msg}`);
    }
    throw new Error(`Sanity fetch failed: ${msg}`);
  }
}

function bySlug<T extends { slug?: { current?: string } }>(items: T[]): Map<string, T> {
  const m = new Map<string, T>();
  for (const item of items) {
    const s = item.slug?.current;
    if (s) m.set(s, item);
  }
  return m;
}

function assertHasPosts(posts: Post[], context: string): void {
  if (posts.length > 0) return;
  if (allowFixtures) return;
  if (isProdBuild()) {
    failBuild(
      `Sanity returned 0 posts (${context}). Import content or set ALLOW_FIXTURES=1 for local prototype only.`,
    );
  }
}

function sortByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const da = a.publishedAt || '';
    const db = b.publishedAt || '';
    return db.localeCompare(da);
  });
}

/**
 * Published posts for preview/SSG — CUT audit slugs excluded (reversible via CSV).
 * MONEY CORE + KEEP never filtered even if CSV drifts.
 */
export async function getAllPosts(): Promise<Post[]> {
  if (!allowFixtures) {
    const remote = await fetchOrThrow<Post[]>(allPostsQuery);
    const posts = withoutCutPosts(remote || []);
    assertHasPosts(posts, 'getAllPosts');
    return sortByDate(posts);
  }

  let remote: Post[] = [];
  try {
    remote = (await fetchOrThrow<Post[]>(allPostsQuery)) || [];
  } catch {
    remote = [];
  }
  const map = bySlug(fixturePosts);
  for (const p of remote) {
    if (p.slug?.current) map.set(p.slug.current, p);
  }
  return sortByDate(withoutCutPosts([...map.values()]));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!allowFixtures) {
    const remote = await fetchOrThrow<Post | null>(postBySlugQuery, { slug });
    if (!remote?.slug?.current) return null;
    // CUT posts are not built — edge _redirects handle the URL with a hard 301.
    if (isCutPost(remote)) return null;
    return remote;
  }
  try {
    const remote = await fetchOrThrow<Post | null>(postBySlugQuery, { slug });
    if (remote?.slug?.current) {
      if (isCutPost(remote)) return null;
      return remote;
    }
  } catch {
    /* fall through to fixtures */
  }
  const fixture = fixturePosts.find(p => p.slug.current === slug) || null;
  if (fixture && isCutPost(fixture)) return null;
  return fixture;
}

export async function getAllCategories(): Promise<Category[]> {
  if (!allowFixtures) {
    const remote = await fetchOrThrow<Category[]>(allCategoriesQuery);
    return [...(remote || [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }
  let remote: Category[] = [];
  try {
    remote = (await fetchOrThrow<Category[]>(allCategoriesQuery)) || [];
  } catch {
    remote = [];
  }
  const map = bySlug(fixtureCategories);
  for (const c of remote) {
    if (c.slug?.current) map.set(c.slug.current, c);
  }
  return [...map.values()].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!allowFixtures) {
    const remote = await fetchOrThrow<Category | null>(categoryBySlugQuery, { slug });
    return remote?.slug?.current ? remote : null;
  }
  try {
    const remote = await fetchOrThrow<Category | null>(categoryBySlugQuery, { slug });
    if (remote?.slug?.current) return remote;
  } catch {
    /* fall through */
  }
  return fixtureCategories.find(c => c.slug.current === slug) || null;
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  if (!allowFixtures) {
    const remote = await fetchOrThrow<Post[]>(postsByCategoryQuery, { category });
    return sortByDate(withoutCutPosts(remote || []));
  }
  let remote: Post[] = [];
  try {
    remote = (await fetchOrThrow<Post[]>(postsByCategoryQuery, { category })) || [];
  } catch {
    remote = [];
  }
  const fixtures = fixturePosts.filter(p => p.category?.slug.current === category);
  const map = bySlug(fixtures);
  for (const p of remote) {
    if (p.slug?.current) map.set(p.slug.current, p);
  }
  return sortByDate(withoutCutPosts([...map.values()]));
}

export async function getRecentPosts(): Promise<Post[]> {
  // Use filtered getAllPosts so CUT titles never appear in sidebars.
  return (await getAllPosts()).slice(0, 5);
}

export async function getComparisonPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter(p => p.template === 'comparison');
}

export async function getReviewPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter(p => p.template === 'honest-review');
}
