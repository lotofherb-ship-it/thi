import { offerCta, type ProductOffer } from '../products/resolve';
import type {
  ArtikelagentCommerce,
  ArtikelagentRuntime,
  ArtikelagentScript,
  ResolvedCommerceCta,
  RuntimeCommerce,
  RuntimeNode,
} from './types';

export type CommercePick = {
  key: 'top' | 'runner' | 'also' | 'budget';
  name: string;
  offers: ProductOffer[];
  tursoProductId?: number | null;
};

function ctaFromOffer(offer: ProductOffer | undefined | null): ResolvedCommerceCta | null {
  if (!offer?.url) return null;
  const { action, price } = offerCta(offer);
  return { action, price: price || '', href: offer.url };
}

/** Resolve script commerce refs against page picks / Turso ids. */
export function resolveCommerce(
  commerce: ArtikelagentCommerce,
  picks: CommercePick[],
): RuntimeCommerce {
  let offer: ProductOffer | undefined;

  if (commerce.tursoProductId != null) {
    const byId = picks.find(p => p.tursoProductId === commerce.tursoProductId);
    offer = byId?.offers?.[0];
  }

  if (!offer && commerce.pickRef) {
    const byKey = picks.find(p => p.key === commerce.pickRef);
    offer = byKey?.offers?.[0];
  }

  return {
    ...commerce,
    cta: ctaFromOffer(offer),
  };
}

export function buildArtikelagentRuntime(
  script: ArtikelagentScript,
  picks: CommercePick[],
  authorName = 'Jouke',
): ArtikelagentRuntime {
  const labels: Record<string, string> = {};
  for (const c of script.openingChips) labels[c.id] = c.label;
  for (const n of Object.values(script.nodes)) {
    for (const c of n.followUps || []) {
      if (!labels[c.id]) labels[c.id] = c.label;
    }
  }

  const nodes: Record<string, RuntimeNode> = {};
  for (const [id, node] of Object.entries(script.nodes)) {
    nodes[id] = {
      ...node,
      commerce: node.commerce ? resolveCommerce(node.commerce, picks) : undefined,
    };
  }

  return {
    id: script.id,
    disclosure: script.disclosure,
    seed: script.seed,
    seedSignedBy: script.seedSignedBy,
    authorName,
    openingChips: script.openingChips,
    nodes,
    labels,
  };
}
