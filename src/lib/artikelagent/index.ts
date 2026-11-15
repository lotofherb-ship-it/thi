/**
 * Artikelagent — content-grounded chips companion.
 * Prefer getArtikelagentScript(slug); fixtures until Sanity authoring ships.
 */
export type {
  ArtikelagentScript,
  ArtikelagentNode,
  ArtikelagentChip,
  ArtikelagentCommerce,
  ArtikelagentProof,
  ArtikelagentRuntime,
  RuntimeNode,
  RuntimeCommerce,
  ClaimMode,
  IntentClass,
} from './types';

export {
  MAX_ASSISTANT_WORDS,
  MAX_DEPTH,
  MAX_OPENING_CHIPS,
  FORBIDDEN_OPS_TOKENS,
  wordCount,
} from './types';

export { lintArtikelagentScript } from './lint';
export { getArtikelagentScript, listArtikelagentSlugs } from './registry';
export { buildArtikelagentRuntime, resolveCommerce } from './resolve-commerce';
export type { CommercePick } from './resolve-commerce';
export {
  magnesiumArtikelagentScript,
  magnesiumArtikelagentLintErrors,
} from './scripts/magnesium';
