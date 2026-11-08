/**
 * Pain-Point Router (PPR) script model.
 * Predesigned dialogue only — no live LLM.
 * claimMode tags support YMYL linting/guards even when runtime is static.
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

export type ChatHandoff = {
  label: string;
  href: string;
  /** Analytics key when this handoff is clicked */
  analyticsKey?: string;
};

/** Compact Wirecutter-style pick card shown at end of Decide path. */
export type ChatArtifact = {
  kind: 'pick' | 'compare' | 'methode';
  product: string;
  claim: string;
  /** e.g. "€16,99 bij Holland & Barrett" */
  priceLine: string;
  tradeOff: string;
  href: string;
  imageUrl?: string;
};

export type ChatChip = {
  id: string;
  label: string;
  intentClass?: IntentClass;
  analyticsKey?: string;
};

export type ChatNode = {
  id: string;
  /** Assistant micro-verdict after this chip (≤ ~60 words). */
  reply: string;
  claimMode: ClaimMode;
  /** EU register refs when claimMode === 'authorized' */
  authorizedClaimIds?: string[];
  /** Jouke-signed micro-verdict (Decide/Fit). */
  signedBy?: 'jouke';
  followUps?: ChatChip[];
  handoffs?: ChatHandoff[];
  /** Shown sticky in panel after this answer (typically Decide leaf). */
  artifact?: ChatArtifact;
  /** Tree depth of this node (1 = opening chip). Guard ≤ 3. */
  depth: number;
};

export type ChatScript = {
  id: string;
  format: 'vergelijking' | 'honest-review';
  version: string;
  locale: 'nl-NL';
  topic: string;
  /** Outcome H1 — not “Stel je vraag…” */
  headline: string;
  /** One supporting sentence under H1 / module framing */
  support: string;
  /** SSR first assistant turn — editorial voice, not UI instruction */
  seed: string;
  /** Sign the seed with Jouke when opinionated */
  seedSignedBy?: 'jouke';
  /** Single disclosure (shown once, in chat header only) */
  disclosure: string;
  /** Brand mark / kicker */
  brand: string;
  /** Escape label — one Artikel control */
  skipLabel: string;
  hero: {
    photo: string;
    photoAlt: string;
    mood: 'ritual' | 'pack' | 'movement';
  };
  openingChips: ChatChip[];
  nodes: Record<string, ChatNode>;
  guardrails: {
    medicalRefusalCopy: string;
    affiliateNote: string;
  };
};

export const MAX_ASSISTANT_WORDS = 60;
export const MAX_DEPTH = 3;
export const MAX_OPENING_CHIPS = 4;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Lint helpers for CMS preview / CI — not runtime-blocking. */
export function lintChatScript(script: ChatScript): string[] {
  const errors: string[] = [];

  if (script.openingChips.length > MAX_OPENING_CHIPS) {
    errors.push(`openingChips > ${MAX_OPENING_CHIPS}`);
  }
  if (script.openingChips.length < 2) {
    errors.push('openingChips needs at least Decide + Fit');
  }

  const intents = new Set(script.openingChips.map(c => c.intentClass));
  if (!intents.has('decide')) errors.push('opening set missing decide chip');
  if (!intents.has('fit')) errors.push('opening set missing fit chip');
  if (script.openingChips.some(c => c.intentClass === 'guard')) {
    errors.push('never open with guard chip');
  }

  for (const chip of script.openingChips) {
    if (!script.nodes[chip.id]) errors.push(`missing node for opening chip ${chip.id}`);
  }

  let hasRefuse = false;
  for (const node of Object.values(script.nodes)) {
    const words = wordCount(node.reply);
    if (words > MAX_ASSISTANT_WORDS) {
      errors.push(`${node.id}: reply ${words} words > ${MAX_ASSISTANT_WORDS}`);
    }
    if (node.depth > MAX_DEPTH) {
      errors.push(`${node.id}: depth ${node.depth} > ${MAX_DEPTH}`);
    }
    if (node.claimMode === 'authorized' && !(node.authorizedClaimIds?.length)) {
      errors.push(`${node.id}: authorized without claim IDs`);
    }
    if (node.claimMode === 'refuse') hasRefuse = true;

    const isLeaf =
      !node.followUps?.length ||
      node.followUps.every(f => !script.nodes[f.id] || script.nodes[f.id].depth >= MAX_DEPTH);
    if (isLeaf && !node.handoffs?.length && !node.artifact) {
      errors.push(`${node.id}: leaf without handoff/artifact`);
    }

    for (const f of node.followUps || []) {
      if (!script.nodes[f.id]) errors.push(`${node.id}: followUp ${f.id} missing node`);
    }
  }

  if (!hasRefuse) errors.push('missing medical refusal (guard) node');

  return errors;
}

export function chipLabel(script: ChatScript, id: string): string {
  const open = script.openingChips.find(c => c.id === id);
  if (open) return open.label;
  for (const node of Object.values(script.nodes)) {
    const hit = node.followUps?.find(c => c.id === id);
    if (hit) return hit.label;
  }
  return id;
}

/** Serialize for data-script attribute (runtime JSON). */
export function serializeChatScript(script: ChatScript) {
  // Opening labels first; follow-up labels only fill gaps (same nodeId can have
  // contextual chip copy like "Toch de topkeuze zien" — runtime prefers chip text).
  const labels: Record<string, string> = {};
  for (const c of script.openingChips) labels[c.id] = c.label;
  for (const n of Object.values(script.nodes)) {
    for (const c of n.followUps || []) {
      if (!labels[c.id]) labels[c.id] = c.label;
    }
  }

  return {
    id: script.id,
    format: script.format,
    headline: script.headline,
    support: script.support,
    seed: script.seed,
    seedSignedBy: script.seedSignedBy,
    disclosure: script.disclosure,
    skipLabel: script.skipLabel,
    brand: script.brand,
    openingChips: script.openingChips,
    nodes: script.nodes,
    guardrails: script.guardrails,
    labels,
  };
}
