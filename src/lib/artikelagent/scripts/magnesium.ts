/**
 * Magnesium bisglycinaat — Artikelagent script (vergelijking).
 * Chips-only · grounded proof anchors · commerce via pickRef.
 */
import { lintArtikelagentScript } from '../lint';
import type { ArtikelagentScript } from '../types';

export const magnesiumArtikelagentScript: ArtikelagentScript = {
  id: 'magnesium-bisglycinaat-aa-v1',
  slug: 'beste-magnesium-bisglycinaat',
  format: 'vergelijking',
  version: '1.0.0',
  locale: 'nl-NL',
  disclosure: 'Voorgeprogrammeerde antwoorden · geen live AI · Jouke eindverantwoordelijk.',
  seed:
    'Ik help je sneller door deze gids. Meest gestelde start: wat is onze topkeuze? Of vraag voor wie dit wél is, of waarom juist bisglycinaat.',
  seedSignedBy: 'jouke',
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
      id: 'type-vergelijk',
      label: 'Waarom bisglycinaat?',
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
      proof: { label: 'Bron in artikel · Alles wat we aanraden', href: '#aanraden' },
      commerce: {
        role: 'top',
        pickRef: 'top',
        productLabel: 'Vitakruid Magnesium Bisglycinaat 150',
        claim: '150 mg elementair + L-taurine',
        tradeOff: 'Geen TRAACS-stempel',
        secondary: { label: 'Lees waarom in de shortlist', href: '#aanraden' },
      },
      followUps: [
        { id: 'runner-up', label: 'En de runner-up?', intentClass: 'compare' },
        { id: 'hoe-gekozen', label: 'Hoe hebben jullie gekozen?', intentClass: 'trust' },
      ],
    },
    'voor-wie': {
      id: 'voor-wie',
      depth: 1,
      claimMode: 'opinion',
      signedBy: 'jouke',
      reply:
        'Wél: avondgebruik na training, maagvriendelijke bisglycinaat. Niet: medisch advies zoeken, of alleen de goedkoopste oxide. Geen vervanging voor een arts.',
      proof: { label: 'Bron in artikel · Voor wie', href: '#voor-wie' },
      followUps: [
        { id: 'topkeuze', label: 'Wat is dan jullie tip?', intentClass: 'decide' },
        { id: 'verwachten', label: 'Wat mag je verwachten?', intentClass: 'orient' },
      ],
    },
    verwachten: {
      id: 'verwachten',
      depth: 2,
      claimMode: 'authorized',
      authorizedClaimIds: ['EU_reg_432_2012_magnesium_energy', 'EU_reg_432_2012_magnesium_muscles'],
      reply:
        'Magnesium draagt bij tot de normale energiehuishouding en tot de normale werking van de spieren. Geen slaappil, geen geneesmiddel: minerale steun met EU-claims.',
      proof: { label: 'Bron in artikel · FAQ', href: '#veelgestelde-vragen' },
      followUps: [
        { id: 'topkeuze', label: 'Oké: topkeuze tonen', intentClass: 'decide' },
        { id: 'medical-guard', label: 'Helpt het bij ziekte X?', intentClass: 'guard' },
      ],
    },
    'type-vergelijk': {
      id: 'type-vergelijk',
      depth: 1,
      claimMode: 'opinion',
      reply:
        'Oxide is goedkoop, irriteert vaak. Citraat zit ertussen. Bisglycinaat verdragen de meeste mensen beter. Daarom is deze gids smal: alleen die vorm.',
      proof: { label: 'Bron in artikel · Vergelijking', href: '#vergelijking' },
      followUps: [
        { id: 'topkeuze', label: 'Toon de topkeuze', intentClass: 'decide' },
        { id: 'hoe-gekozen', label: 'Hoe filteren jullie?', intentClass: 'trust' },
      ],
    },
    'runner-up': {
      id: 'runner-up',
      depth: 2,
      claimMode: 'opinion',
      signedBy: 'jouke',
      reply:
        'Runner-up: Vitals Magnesium Bisglycinaat 100. Albion TRAACS plus taurine. Trade-off: 100 mg per tablet, dus meer stuks voor dezelfde dosis als Vitakruid.',
      proof: { label: 'Bron in artikel · Alles wat we aanraden', href: '#aanraden' },
      commerce: {
        role: 'runner',
        pickRef: 'runner',
        productLabel: 'Vitals Magnesium Bisglycinaat 100',
        claim: 'Albion TRAACS + taurine',
        tradeOff: '100 mg per tablet',
        secondary: { label: 'Naar shortlist', href: '#aanraden' },
      },
      followUps: [{ id: 'hoe-gekozen', label: 'Hoe hebben jullie gekozen?', intentClass: 'trust' }],
    },
    'hoe-gekozen': {
      id: 'hoe-gekozen',
      depth: 2,
      claimMode: 'none',
      reply:
        'Eerst of het écht bisglycinaat is en NL-verkrijgbaar, dan elementair Mg, vulstoffen en prijs per dosis. Shortlist van vier. Commissie speelt geen rol.',
      proof: { label: 'Bron in artikel · Methode', href: '#methode' },
      followUps: [{ id: 'topkeuze', label: 'Terug naar topkeuze', intentClass: 'decide' }],
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
    },
  },
  guardrails: {
    medicalRefusalCopy:
      'Geen medisch advies. Bij ziekte, medicatie of zwangerschap: huisarts of apotheker. Alleen productkeuze binnen toegestane claims.',
    affiliateNote:
      'The Health Issue kan een commissie ontvangen via partnerlinks. Dat beïnvloedt onze redactionele keuzes niet.',
  },
};

export const magnesiumArtikelagentLintErrors = lintArtikelagentScript(magnesiumArtikelagentScript);
if (import.meta.env?.DEV && magnesiumArtikelagentLintErrors.length) {
  console.warn('[artikelagent] magnesium lint:', magnesiumArtikelagentLintErrors);
}
