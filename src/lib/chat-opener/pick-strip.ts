/**
 * Answer-first pick strip — money-page Layer 0.
 * Answer + primary buy on first paint. Chips filter the verdict in place (not TOC).
 */

import type { ProductOffer } from '../products/resolve';

export type StripPick = {
  key: 'top' | 'runner' | 'also' | 'budget';
  name: string;
  offers: ProductOffer[];
};

export type PickStripFilter = {
  id: string;
  /** Quiet chip label. Never a section jump. */
  label: string;
  /** Maps to ComparisonPage pick key: top | runner | also | budget */
  pickKey: 'top' | 'runner' | 'also' | 'budget';
  kicker: string;
  /** ≤ ~60 words, Jouke voice, no ops jargon, no em dash */
  verdict: string;
  tradeOff: string;
  analyticsKey?: string;
};

export type PickStripScript = {
  id: string;
  disclosure: string;
  shortlistLabel: string;
  shortlistHref: string;
  default: {
    pickKey: 'top' | 'runner' | 'also' | 'budget';
    kicker: string;
    verdict: string;
    tradeOff: string;
  };
  /** Max 2. Optional. */
  filters: PickStripFilter[];
};

export const magnesiumPickStrip: PickStripScript = {
  id: 'magnesium-pick-strip-v1',
  disclosure: 'Voorgeprogrammeerde keuzes · geen live AI · Jouke eindverantwoordelijk.',
  shortlistLabel: 'Bekijk shortlist',
  shortlistHref: '#aanraden',
  default: {
    pickKey: 'top',
    kicker: 'Topkeuze',
    verdict:
      'Vitakruid Magnesium Bisglycinaat 150 is onze topkeuze: hoogste elementaire dosis per tablet plus L-taurine. Ik gebruik dit zelf in zware trainingsweken.',
    tradeOff: 'Geen TRAACS-stempel. Wie certificering boven dosis stelt, neemt Vitals.',
  },
  filters: [
    {
      id: 'traacs',
      label: 'Liever TRAACS',
      pickKey: 'runner',
      kicker: 'Runner-up',
      verdict:
        'Vitals Magnesium Bisglycinaat 100: Albion TRAACS plus taurine. Kies dit als je het certificaat wilt zien op het etiket.',
      tradeOff: '100 mg per tablet, dus meer stuks voor dezelfde dosis als Vitakruid.',
      analyticsKey: 'filter_traacs',
    },
    {
      id: 'budget',
      label: 'Scherpste €/dag',
      pickKey: 'budget',
      kicker: 'Budgetkeuze',
      verdict:
        'Mattisson Magnesium Bisglycinaat: helder etiket, scherpste prijs per dag in onze shortlist. Stevige budgetkeuze als je geen taurine of TRAACS eist.',
      tradeOff: 'Voorraad wisselt; check altijd de actuele prijs bij de shop.',
      analyticsKey: 'filter_budget',
    },
  ],
};

export const mattissonPickStrip: PickStripScript = {
  id: 'mattisson-pick-strip-v1',
  disclosure: 'Voorgeprogrammeerde keuzes · geen live AI · Jouke eindverantwoordelijk.',
  shortlistLabel: 'Naar eindoordeel',
  shortlistHref: '#eindoordeel',
  default: {
    pickKey: 'top',
    kicker: 'Eindoordeel',
    verdict:
      'Mattisson houdt stand als avondbisglycinaat: score 8,6/10 over acht weken. Helder etiket, rustige maag, routine die vol te houden is.',
    tradeOff: 'Voorraad wisselt bij merchants; check de actuele prijs voor je koopt.',
  },
  filters: [],
};

const PICK_STRIP_BY_SLUG: Record<string, PickStripScript> = {
  'beste-magnesium-bisglycinaat': magnesiumPickStrip,
  'mattisson-magnesium-bisglycinaat-review': mattissonPickStrip,
};

export function getPickStripForSlug(slug: string | undefined | null): PickStripScript | null {
  if (!slug) return null;
  return PICK_STRIP_BY_SLUG[slug] || null;
}
