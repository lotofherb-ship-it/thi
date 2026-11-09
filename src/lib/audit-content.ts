/**
 * Content-audit buckets for preview (thi-astro.pages.dev).
 * CUT list is generated into src/data/audit-cuts.json — do not delete Sanity media.
 * Restore: edit data/thi-content-audit-redirects.csv → python3 scripts/generate-redirects.py → rebuild.
 */
import auditCuts from '../data/audit-cuts.json';
import type { Post } from '../types';
import { postHref } from './urls';

/** MONEY CORE — 15 commercial converters (protect). */
export const MONEY_CORE_PATHS = [
  '/supplementen/plnkt-review/',
  '/supplementen/mijn-ervaring-met-inkoherb-eindelijk-minder-vaak-naar-de-wc/',
  '/training/beste-pull-up-bar/',
  '/supplementen/beste-magnesium-bisglycinaat/',
  '/gezondheid/beste-elektrolyten-poeder/',
  '/training/beste-yogamat/',
  '/training/beste-crossfit-schoenen/',
  '/supplementen/vitakruid-ashwagandha-ksm66-review/',
  '/training/beste-massage-gun/',
  '/training/beste-roeitrainers/',
  '/training/beste-crossfit-springtouwen/',
  '/training/beste-hangboards-voor-boulderen-en-klimmen/',
  '/supplementen/beste-ashwagandha-kopen/',
  '/training/beste-roeitrainer-voor-thuis/',
  '/training/beste-roeitrainer-met-waterweerstand-2026-onze-top-5-vergeleken/',
] as const;

/** Homepage feature order — money-core first, not recency junk. */
export const HOMEPAGE_FEATURE_PATHS = [
  '/supplementen/plnkt-review/',
  '/supplementen/mijn-ervaring-met-inkoherb-eindelijk-minder-vaak-naar-de-wc/',
  '/supplementen/beste-magnesium-bisglycinaat/',
  '/supplementen/beste-ashwagandha-kopen/',
  '/gezondheid/beste-elektrolyten-poeder/',
  '/training/beste-roeitrainers/',
  '/training/beste-pull-up-bar/',
  '/training/beste-yogamat/',
] as const;

/** KEEP converters — stay published; prefer in hubs when ranking. */
export const KEEP_PATHS = [
  '/voeding/soorten-havermout/',
  '/training/grip-trainer-kopen/',
  '/voeding/havermout-brinta-verschillen/',
  '/training/beste-liquid-chalk-review/',
  '/training/beste-crossfit-grips/',
  '/supplementen/ashwagandha-dosering/',
  '/training/magnesium-klimmen-en-boulderen/',
  '/training/de-beste-deadlift-schoenen/',
  '/training/beste-crosstrainers/',
  '/training/beste-loopbanden/',
  '/training/cardio-apparaten-voor-thuis/',
  '/training/roeien-afvallen/',
  '/training/beste-hometrainers/',
  '/supplementen/welke-magnesium-is-het-beste/',
  '/supplementen/beste-plankton-supplementen/',
  '/nieuws/wat-is-magnesium/',
  '/supplementen/ashwagandha-werking-voordelen/',
  '/training/beste-squat-schoenen-powerliften/',
  '/training/roeitrainer-welke-spieren/',
  '/supplementen/dit-natuurlijke-supplement-verovert-nederland-en-vrouwen-zijn-enthousiast/',
  '/gezondheid/elektrolyten-voeding/',
  '/supplementen/hoeveel-magnesium-per-dag/',
  '/gezondheid/elektrolyten-drank/',
  '/training/voordelen-van-roeien/',
  '/supplementen/ashwagandha-cortisol/',
  '/gezondheid/elektrolyten/',
  '/gezondheid/wanneer-elektrolyten-nemen/',
  '/supplementen/marine-fytoplankton/',
  '/gezondheid/elektrolyten-tekort-symptomen/',
  '/supplementen/ashwagandha-bijwerkingen/',
  '/supplementen/beste-magnesium-voor-slaap/',
  '/supplementen/magnesium-tekort/',
  '/uncategorized/waar-is-magnesium-goed-voor-werking-en-7-onderbouwde-voordelen/',
] as const;

const cutPathSet = new Set<string>(
  (auditCuts.cutPaths as string[]).map(p => (p.endsWith('/') ? p : `${p}/`)),
);
const moneySet = new Set<string>(MONEY_CORE_PATHS);
const keepSet = new Set<string>(KEEP_PATHS);

export function normalizePostPath(path: string): string {
  if (!path) return '/';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

export function isCutPath(path: string): boolean {
  return cutPathSet.has(normalizePostPath(path));
}

export function isMoneyCorePath(path: string): boolean {
  return moneySet.has(normalizePostPath(path));
}

export function isKeepPath(path: string): boolean {
  return keepSet.has(normalizePostPath(path));
}

export function isProtectedPath(path: string): boolean {
  const p = normalizePostPath(path);
  return moneySet.has(p) || keepSet.has(p);
}

/** Never drop MONEY CORE / KEEP even if a CSV row drifts. */
export function isCutPost(post: Post): boolean {
  const href = normalizePostPath(postHref(post));
  if (isProtectedPath(href)) return false;
  return isCutPath(href);
}

export function withoutCutPosts<T extends Post>(posts: T[]): T[] {
  return posts.filter(p => !isCutPost(p));
}

/** Category hub sort: money-core → keep → other (HOLD), then date. */
export function sortHubPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const ha = normalizePostPath(postHref(a));
    const hb = normalizePostPath(postHref(b));
    const rank = (h: string) => (moneySet.has(h) ? 0 : keepSet.has(h) ? 1 : 2);
    const ra = rank(ha);
    const rb = rank(hb);
    if (ra !== rb) return ra - rb;
    const da = a.updatedAt || a.publishedAt || '';
    const db = b.updatedAt || b.publishedAt || '';
    return db.localeCompare(da);
  });
}

export function pickHomepageFeatures(posts: Post[], limit = 6): Post[] {
  const byPath = new Map(posts.map(p => [normalizePostPath(postHref(p)), p]));
  const picked: Post[] = [];
  for (const path of HOMEPAGE_FEATURE_PATHS) {
    const post = byPath.get(path);
    if (post) picked.push(post);
    if (picked.length >= limit) return picked;
  }
  // Fill from remaining money-core, then keep
  for (const path of [...MONEY_CORE_PATHS, ...KEEP_PATHS]) {
    if (picked.some(p => normalizePostPath(postHref(p)) === path)) continue;
    const post = byPath.get(path);
    if (post) picked.push(post);
    if (picked.length >= limit) break;
  }
  return picked;
}

export const AUDIT_RESTORE_HINT = auditCuts.restore as string;
export const AUDIT_CUT_COUNT = auditCuts.cutCount as number;
