import {
  FORBIDDEN_OPS_TOKENS,
  MAX_ASSISTANT_WORDS,
  MAX_DEPTH,
  MAX_OPENING_CHIPS,
  wordCount,
  type ArtikelagentScript,
} from './types';

/** Lint helpers for CI / CMS preview — not runtime-blocking. */
export function lintArtikelagentScript(script: ArtikelagentScript): string[] {
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

  const readerText = [
    script.seed,
    script.disclosure,
    ...Object.values(script.nodes).map(n =>
      [n.reply, n.commerce?.productLabel, n.commerce?.claim, n.commerce?.tradeOff, n.proof?.label]
        .filter(Boolean)
        .join('\n'),
    ),
  ].join('\n');

  for (const token of FORBIDDEN_OPS_TOKENS) {
    if (readerText.includes(token)) {
      errors.push(`ops jargon in reader copy: ${token}`);
    }
  }
  if (/—/.test(readerText)) {
    errors.push('em dash (—) in reader copy; use comma or period');
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

    if (node.claimMode !== 'refuse' && !node.proof && !node.commerce) {
      errors.push(`${node.id}: non-refuse node needs proof and/or commerce`);
    }

    if (node.commerce) {
      if (!node.commerce.tradeOff?.trim()) {
        errors.push(`${node.id}: commerce missing tradeOff`);
      }
      if (!node.commerce.pickRef && node.commerce.tursoProductId == null) {
        errors.push(`${node.id}: commerce needs pickRef or tursoProductId`);
      }
    }

    for (const f of node.followUps || []) {
      if (!script.nodes[f.id]) errors.push(`${node.id}: followUp ${f.id} missing node`);
    }
  }

  if (!hasRefuse) errors.push('missing medical refusal (guard) node');

  return errors;
}
