/**
 * Magnesium bisglycinaat — Pain-Point Router script (vergelijking).
 * Depth ≤ 3 · assistant ≤ 60 words · claim-coded · artifact on Decide.
 */
import type { ChatScript } from './types';
import { lintChatScript } from './types';

export const magnesiumChatScript: ChatScript = {
  id: 'magnesium-bisglycinaat-v2',
  format: 'vergelijking',
  version: '2.0.0',
  locale: 'nl-NL',
  topic: 'magnesiumbisglycinaat',
  brand: 'The Health Issue',
  headline: 'Kies sneller de juiste magnesium',
  support: 'Weinig tijd? Vraag het direct, of scroll naar Alles wat we aanraden.',
  seed:
    'Meest gestelde vraag hier: wat is de topkeuze? Tik hieronder, of scroll naar Alles wat we aanraden.',
  seedSignedBy: 'jouke',
  disclosure: 'Voorgeprogrammeerde antwoorden · geen live AI · Jouke eindverantwoordelijk.',
  skipLabel: 'Artikel',
  hero: {
    photo: '/images/chat-hero-magnesium.jpg',
    photoAlt: 'Magnesiumcapsules naast een glas water op een nachtkastje, avondritueel',
    mood: 'ritual',
  },
  openingChips: [
    {
      id: 'topkeuze',
      label: 'Wat is jullie topkeuze?',
      intentClass: 'decide',
      analyticsKey: 'open_decide',
    },
    {
      id: 'voor-wie',
      label: 'Voor wie is dit wél / niet?',
      intentClass: 'fit',
      analyticsKey: 'open_fit',
    },
    {
      id: 'verwachten',
      label: 'Wat mag je er wél van verwachten?',
      intentClass: 'orient',
      analyticsKey: 'open_orient',
    },
    {
      id: 'type-vergelijk',
      label: 'Bisglycinaat vs citraat?',
      intentClass: 'compare',
      analyticsKey: 'open_compare',
    },
  ],
  nodes: {
    topkeuze: {
      id: 'topkeuze',
      depth: 1,
      claimMode: 'opinion',
      signedBy: 'jouke',
      reply:
        'Topkeuze: Vitakruid Magnesium Bisglycinaat 150. Hoogste elementaire dosis per tablet plus taurine. Trade-off: geen TRAACS. Wie certificering eist, neemt Vitals.',
      followUps: [
        { id: 'runner-up', label: 'En de runner-up?', intentClass: 'compare' },
        { id: 'hoe-gekozen', label: 'Hoe hebben jullie gekozen?', intentClass: 'trust' },
        { id: 'medical-guard', label: 'Helpt het bij een aandoening?', intentClass: 'guard' },
      ],
      handoffs: [{ label: 'Alles wat we aanraden', href: '#aanraden', analyticsKey: 'handoff_aanraden' }],
      artifact: {
        kind: 'pick',
        product: 'Vitakruid Magnesium Bisglycinaat 150',
        claim: 'Topkeuze: 150 mg elementair + L-taurine, avondroutine na training',
        priceLine: 'Vanaf ~€24 bij Vitaminstore / Superfoodstore',
        tradeOff: 'Geen TRAACS-stempel',
        href: '#aanraden',
        imageUrl: 'https://cdn.shopify.com/s/files/1/0822/6681/6844/files/2b9ae86d5a50ef953db9f7dd97b0.png?v=1791569559',
      },
    },
    'voor-wie': {
      id: 'voor-wie',
      depth: 1,
      claimMode: 'opinion',
      signedBy: 'jouke',
      reply:
        'Wél: avondgebruik na training, maagvriendelijke bisglycinaat. Niet: medisch advies zoeken, of alleen de goedkoopste oxide. Geen vervanging voor een arts.',
      followUps: [
        { id: 'topkeuze', label: 'Wat is dan jullie tip?', intentClass: 'decide' },
        { id: 'verwachten', label: 'Wat mag je verwachten?', intentClass: 'orient' },
      ],
      handoffs: [{ label: 'Lees “Voor wie”', href: '#voor-wie', analyticsKey: 'handoff_voor_wie' }],
    },
    verwachten: {
      id: 'verwachten',
      depth: 1,
      claimMode: 'authorized',
      authorizedClaimIds: ['EU_reg_432_2012_magnesium_energy', 'EU_reg_432_2012_magnesium_muscles'],
      reply:
        'Magnesium draagt bij tot de normale energiehuishouding en tot de normale werking van de spieren. Geen slaappil, geen geneesmiddel: minerale steun met EU-claims.',
      followUps: [
        { id: 'topkeuze', label: 'Oké: topkeuze tonen', intentClass: 'decide' },
        { id: 'type-vergelijk', label: 'Welke vorm dan?', intentClass: 'compare' },
        { id: 'medical-guard', label: 'Helpt het bij ziekte X?', intentClass: 'guard' },
      ],
      handoffs: [{ label: 'Naar FAQ', href: '#veelgestelde-vragen', analyticsKey: 'handoff_faq' }],
    },
    'type-vergelijk': {
      id: 'type-vergelijk',
      depth: 1,
      claimMode: 'opinion',
      reply:
        'Oxide is goedkoop, irriteert vaak. Citraat zit ertussen. Bisglycinaat verdragen de meeste mensen beter. Daarom is deze gids smal: alleen die vorm.',
      followUps: [
        { id: 'topkeuze', label: 'Toon de topkeuze', intentClass: 'decide' },
        { id: 'hoe-gekozen', label: 'Hoe filteren jullie?', intentClass: 'trust' },
      ],
      handoffs: [{ label: 'Naar types / tabel', href: '#vergelijking', analyticsKey: 'handoff_type' }],
    },
    'runner-up': {
      id: 'runner-up',
      depth: 2,
      claimMode: 'opinion',
      signedBy: 'jouke',
      reply:
        'Runner-up: Vitals Magnesium Bisglycinaat 100. Albion TRAACS plus taurine. Trade-off: 100 mg per tablet, dus meer stuks voor dezelfde dosis als Vitakruid.',
      followUps: [
        { id: 'hoe-gekozen', label: 'Hoe hebben jullie gekozen?', intentClass: 'trust' },
      ],
      handoffs: [
        { label: 'Naar runner-up', href: '#pick-2', analyticsKey: 'handoff_pick2' },
        { label: 'Alles wat we aanraden', href: '#aanraden', analyticsKey: 'handoff_aanraden' },
      ],
    },
    'hoe-gekozen': {
      id: 'hoe-gekozen',
      depth: 2,
      claimMode: 'none',
      reply:
        'Eerst affiliate-realiteit (Awin/Daisycon/Bol last), dan elementair Mg, vulstoffen, prijs per dosis en NL-voorraad. Shortlist van vier. Commissie speelt geen rol.',
      followUps: [{ id: 'topkeuze', label: 'Terug naar topkeuze', intentClass: 'decide' }],
      handoffs: [{ label: 'Naar methode', href: '#methode', analyticsKey: 'handoff_methode' }],
    },
    'medical-guard': {
      id: 'medical-guard',
      depth: 2,
      claimMode: 'refuse',
      reply:
        'Geen medisch advies. Bij ziekte, medicatie of zwangerschap: vraag je huisarts of apotheker. Wij helpen alleen met productkeuze binnen toegestane claims.',
      followUps: [
        { id: 'topkeuze', label: 'Toch de topkeuze zien', intentClass: 'decide' },
        { id: 'verwachten', label: 'Wat mag je wél verwachten?', intentClass: 'orient' },
      ],
      handoffs: [{ label: 'Naar artikel', href: '#guide-start', analyticsKey: 'handoff_guide' }],
    },
  },
  guardrails: {
    medicalRefusalCopy:
      'Geen medisch advies. Bij ziekte, medicatie of zwangerschap: huisarts of apotheker. Alleen productkeuze binnen toegestane claims.',
    affiliateNote:
      'The Health Issue kan een commissie ontvangen via affiliate-links. Dat beïnvloedt onze redactionele keuzes niet.',
  },
};

/** Dev/CI guard — fails loudly if script drifts from masterplan rules. */
export const magnesiumLintErrors = lintChatScript(magnesiumChatScript);
if (import.meta.env?.DEV && magnesiumLintErrors.length) {
  console.warn('[chat-opener] magnesium lint:', magnesiumLintErrors);
}

// Re-export helpers used by older imports
export type { ChatScript, ChatNode, ChatHandoff } from './types';
export { chipLabel, serializeChatScript, lintChatScript } from './types';
