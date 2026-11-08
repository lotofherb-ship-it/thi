/**
 * Mattisson honest-review — Pain-Point Router script.
 * Skews Fit / Worth it / Vs topkeuze / How we tested — no multi-pick Decide.
 */
import type { ChatScript } from './types';
import { lintChatScript } from './types';

export const mattissonChatScript: ChatScript = {
  id: 'mattisson-hr-v1',
  format: 'honest-review',
  version: '1.0.0',
  locale: 'nl-NL',
  topic: 'Mattisson Magnesium Bisglycinaat',
  brand: 'The Health Issue',
  headline: 'Is Mattisson de moeite waard?',
  support: 'Kort oordeel over één product — geen multi-merk ranking.',
  seed:
    'Kort: Mattisson houdt stand als avondbisglycinaat — vraag hieronder wat je wilt weten.',
  seedSignedBy: 'jouke',
  disclosure: 'Voorgeprogrammeerde antwoorden · geen live AI · Jouke eindverantwoordelijk.',
  skipLabel: 'Artikel',
  hero: {
    photo: '/images/chat-hero-magnesium.jpg',
    photoAlt: 'Magnesiumcapsules bij avondlicht — product in routine',
    mood: 'pack',
  },
  openingChips: [
    {
      id: 'waard',
      label: 'Is het de moeite waard?',
      intentClass: 'decide',
      analyticsKey: 'hr_open_worth',
    },
    {
      id: 'voor-wie-hr',
      label: 'Voor wie wel / niet?',
      intentClass: 'fit',
      analyticsKey: 'hr_open_fit',
    },
    {
      id: 'vs-gids',
      label: 'Vs de vergelijkingsgids?',
      intentClass: 'compare',
      analyticsKey: 'hr_open_vs',
    },
    {
      id: 'getest',
      label: 'Hoe hebben jullie getest?',
      intentClass: 'trust',
      analyticsKey: 'hr_open_test',
    },
  ],
  nodes: {
    waard: {
      id: 'waard',
      depth: 1,
      claimMode: 'opinion',
      signedBy: 'jouke',
      reply:
        'Ja — voor avondgebruik met helder etiket houdt Mattisson stand. Score 8,6/10 in acht weken. Trade-off: voorraad wisselt; check de actuele prijs.',
      followUps: [
        { id: 'scores', label: 'Wat scoorde het?', intentClass: 'orient' },
        { id: 'vs-gids', label: 'Waarom niet alleen de gids?', intentClass: 'compare' },
        { id: 'medical-guard-hr', label: 'Helpt het bij een aandoening?', intentClass: 'guard' },
      ],
      handoffs: [{ label: 'Naar eindoordeel', href: '#eindoordeel', analyticsKey: 'hr_handoff_oordeel' }],
      artifact: {
        kind: 'pick',
        product: 'Mattisson Magnesium Bisglycinaat',
        claim: 'Eindoordeel 8,6/10 — topkeuze die in de praktijk standhoudt',
        priceLine: '€16,99 bij Holland & Barrett',
        tradeOff: 'Niet altijd op voorraad bij elke merchant',
        href: '#eindoordeel',
        imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/38.png?v=1685112638',
      },
    },
    'voor-wie-hr': {
      id: 'voor-wie-hr',
      depth: 1,
      claimMode: 'opinion',
      signedBy: 'jouke',
      reply:
        'Wél: rustige maag, rekenen op elementair Mg, NL-webshop. Niet: laagste stickerprijs of medische claims. Multi-merk ranking → vergelijkingsgids.',
      followUps: [
        { id: 'waard', label: 'Is het de moeite?', intentClass: 'decide' },
        { id: 'vs-gids', label: 'Naar de gids?', intentClass: 'compare' },
      ],
      handoffs: [{ label: 'Lees “Voor wie”', href: '#voor-wie', analyticsKey: 'hr_handoff_voor_wie' }],
    },
    'vs-gids': {
      id: 'vs-gids',
      depth: 1,
      claimMode: 'none',
      reply:
        'De gids kiest tussen merken. Deze review is één SKU: acht weken etiket, maag, routine. Geen mini-vergelijking van vijf potten.',
      followUps: [
        { id: 'waard', label: 'Eindoordeel tonen', intentClass: 'decide' },
        { id: 'getest', label: 'Hoe getest?', intentClass: 'trust' },
      ],
      handoffs: [
        {
          label: 'Open vergelijkingsgids',
          href: '/supplementen/beste-magnesium-bisglycinaat/',
          analyticsKey: 'hr_handoff_gids',
        },
      ],
    },
    getest: {
      id: 'getest',
      depth: 1,
      claimMode: 'none',
      reply:
        'Acht weken één pot: etiket narekenen, avonddosering, maagnotities, of de routine vol te houden was. Geen lab, wel redactie op herhaalbaarheid.',
      followUps: [
        { id: 'scores', label: 'Scores bekijken', intentClass: 'orient' },
        { id: 'waard', label: 'Eindoordeel', intentClass: 'decide' },
      ],
      handoffs: [{ label: 'Naar testmethode', href: '#ervaringen', analyticsKey: 'hr_handoff_methode' }],
    },
    scores: {
      id: 'scores',
      depth: 2,
      claimMode: 'opinion',
      reply:
        'Overall 8,6. Sterk op etiket en maag; prijs/kwaliteit netjes. Smaak speelt minder bij capsules. Details staan in de scores-sectie.',
      followUps: [{ id: 'waard', label: 'Terug naar eindoordeel', intentClass: 'decide' }],
      handoffs: [{ label: 'Naar scores', href: '#scores', analyticsKey: 'hr_handoff_scores' }],
    },
    'medical-guard-hr': {
      id: 'medical-guard-hr',
      depth: 2,
      claimMode: 'refuse',
      reply:
        'Geen medisch advies. Bij ziekte, medicatie of zwangerschap: huisarts of apotheker. Dit artikel beoordeelt één product, geen behandeling.',
      followUps: [
        { id: 'waard', label: 'Toch het eindoordeel', intentClass: 'decide' },
        { id: 'vs-gids', label: 'Naar de gids', intentClass: 'compare' },
      ],
      handoffs: [{ label: 'Naar artikel', href: '#guide-start', analyticsKey: 'hr_handoff_guide' }],
    },
  },
  guardrails: {
    medicalRefusalCopy:
      'Geen medisch advies. Bij ziekte, medicatie of zwangerschap: huisarts of apotheker.',
    affiliateNote:
      'The Health Issue kan een commissie ontvangen via affiliate-links. Dat beïnvloedt onze scores of eindoordeel niet.',
  },
};

export const mattissonLintErrors = lintChatScript(mattissonChatScript);
if (import.meta.env?.DEV && mattissonLintErrors.length) {
  console.warn('[chat-opener] mattisson lint:', mattissonLintErrors);
}
