/**
 * Artikelagent content contract.
 * Predesigned chips only — no live LLM.
 * Prefer pickRef / tursoProductId over pasted merchant URLs.
 */

export type ClaimMode = 'none' | 'authorized' | 'opinion' | 'refuse';

export type IntentClass =
  | 'decide'
  | 'fit'
  | 'orient'
  | 'compare'
  | 'trust'
  | 'commerce'
  | 'guard'
  | 'nav';

export type ArtikelagentChip = {
  id: string;
  label: string;
  intentClass?: IntentClass;
  analyticsKey?: string;
};

export type ArtikelagentProof = {
  label: string;
  href: string;
};

export type ArtikelagentCommerce = {
  role: 'top' | 'runner' | 'alt';
  /** Map to ComparisonPage pick tier */
  pickRef?: 'top' | 'runner' | 'also' | 'budget';
  tursoProductId?: number;
  productLabel: string;
  claim: string;
  tradeOff: string;
  /** Shortlist / proof tertiary — never primary */
  secondary?: { label: string; href: string };
};

export type ArtikelagentNode = {
  id: string;
  reply: string;
  claimMode: ClaimMode;
  authorizedClaimIds?: string[];
  signedBy?: 'jouke';
  depth: number;
  followUps?: ArtikelagentChip[];
  /** Required for non-refuse nodes */
  proof?: ArtikelagentProof;
  /** Decide / commerce leaves */
  commerce?: ArtikelagentCommerce;
};

export type ArtikelagentScript = {
  id: string;
  slug: string;
  format: 'vergelijking' | 'honest-review';
  version: string;
  locale: 'nl-NL';
  disclosure: string;
  seed: string;
  seedSignedBy?: 'jouke';
  openingChips: ArtikelagentChip[];
  nodes: Record<string, ArtikelagentNode>;
  guardrails: {
    medicalRefusalCopy: string;
    affiliateNote?: string;
  };
};

/** Resolved at SSR for client runtime */
export type ResolvedCommerceCta = {
  action: string;
  price: string;
  href: string;
};

export type RuntimeCommerce = ArtikelagentCommerce & {
  cta: ResolvedCommerceCta | null;
};

export type RuntimeNode = Omit<ArtikelagentNode, 'commerce'> & {
  commerce?: RuntimeCommerce;
};

export type ArtikelagentRuntime = {
  id: string;
  disclosure: string;
  seed: string;
  seedSignedBy?: 'jouke';
  authorName: string;
  openingChips: ArtikelagentChip[];
  nodes: Record<string, RuntimeNode>;
  labels: Record<string, string>;
};

export const MAX_ASSISTANT_WORDS = 60;
export const MAX_DEPTH = 3;
export const MAX_OPENING_CHIPS = 3;

export const FORBIDDEN_OPS_TOKENS = [
  'Awin',
  'Daisycon',
  'TradeTracker',
  'Turso',
  'affiliate-feed',
  'Daisycon-CTA',
  'Awin-pad',
] as const;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
