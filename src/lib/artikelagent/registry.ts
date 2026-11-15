import { magnesiumArtikelagentScript } from './scripts/magnesium';
import type { ArtikelagentScript } from './types';

/** Slug → typed script. Sanity authoring lands here later as override. */
const FIXTURES: Record<string, ArtikelagentScript> = {
  [magnesiumArtikelagentScript.slug]: magnesiumArtikelagentScript,
};

export function getArtikelagentScript(slug: string | undefined | null): ArtikelagentScript | null {
  if (!slug) return null;
  return FIXTURES[slug] || null;
}

export function listArtikelagentSlugs(): string[] {
  return Object.keys(FIXTURES);
}
