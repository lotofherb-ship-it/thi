/**
 * Money-page rewrite: /supplementen/beste-magnesium-bisglycinaat/ (Sanity wp-15441)
 * Framework: Project store docs/thi-money-page-framework.md (Appendix A + §2)
 *
 * Usage:
 *   node scripts/patch-magnesium-bisglycinaat-rewrite.mjs --dry-run
 *   node scripts/patch-magnesium-bisglycinaat-rewrite.mjs --apply   # needs SANITY_API_WRITE_TOKEN
 *   node scripts/patch-magnesium-bisglycinaat-rewrite.mjs --write-override
 *     → writes .content-override.json for local Astro preview (gitignored)
 *
 * Dataset: e6out5at / production
 * Do NOT --apply or pages:ship without Jouke go.
 */
import { createClient } from '@sanity/client';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && !process.env[key]) process.env[key] = rest.join('=').trim();
  }
}
loadEnv();

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 'e6out5at';
const DATASET = process.env.PUBLIC_SANITY_DATASET || 'production';
const WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const DOC_ID = 'wp-15441';
const DRY = process.argv.includes('--dry-run') || !process.argv.includes('--apply');
const WRITE_OVERRIDE = process.argv.includes('--write-override');

function key() {
  return Math.random().toString(36).slice(2, 10);
}

function block(text, style = 'normal') {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  };
}

function h2(text) {
  return block(text, 'h2');
}

function linkBlock(before, label, href, after = '') {
  const linkKey = key();
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [{ _key: linkKey, _type: 'link', href }],
    children: [
      { _type: 'span', _key: key(), text: before, marks: [] },
      { _type: 'span', _key: key(), text: label, marks: [linkKey] },
      { _type: 'span', _key: key(), text: after, marks: [] },
    ],
  };
}

function bolSearchPartner(searchtext, name) {
  const q = searchtext.trim().replace(/\s+/g, '+');
  const dest = `https://www.bol.com/nl/nl/s/?searchtext=${q}`;
  return (
    `https://partner.bol.com/click/click?p=2&t=url&s=1121688&f=TXL&url=${encodeURIComponent(dest)}` +
    `&name=${encodeURIComponent(name)}`
  );
}

const DAISY_VITAKRUID =
  'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&ws=magnesium&dl=product%2Fvitakruid-magnesium-150-bisglycinaat-tabletten-1306678%3F_br_psugg_q%3Dvitakruid%2Bmagnesium';
const DAISY_ORTHICA =
  'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&ws=magnesium&dl=product%2Forthica-magnesium-bisglycinaat-vegicaps-1304652';
const DAISY_VITALS =
  'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&ws=magnesium&dl=product%2Fvitals-magnesiumbisglycinaat-100-mg-tabletten-258130';
const DAISY_MATTISSON =
  'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&ws=magnesium&dl=product%2Fmattisson-healthstyle-magnesium-bisglycinaat-100mg-taurine-tabletten-1309573';

/** Full NL rewrite — framework Appendix A. No em dashes. No affiliate-ops vocab. */
export const REWRITE = {
  title: 'Beste magnesium bisglycinaat 2026',
  seoTitle: 'Beste magnesium bisglycinaat 2026',
  seoDescription:
    'Topkeuze Vitakruid 150 mg + taurine. Runner-up Vitals TRAACS. Orthica puur, Mattisson scherpste €/dag. Trade-offs en named afvallers.',
  excerpt:
    'Welke magnesium bisglycinaat koop je? Topkeuze, runner-up en trade-offs. Oordeel eerst, feiten daarna.',
  quickAnswer:
    'Topkeuze: Vitakruid Magnesium Bisglycinaat 150. Hoogste elementaire dosis per tablet (150 mg) plus L-taurine. Ik gebruik dit zelf in zware trainingsweken. Trade-off: geen TRAACS-stempel. Wie certificering boven dosis stelt, neemt Vitals.',
  updatedAt: new Date().toISOString(),
  whoForProse:
    'Dit is een koopgids voor bisglycinaat via NL-webshops met leesbaar etiket. Ranking en trade-offs eerst. Stofkennis staat onder het oordeel, niet in plaats ervan.',
  whoFor: [
    'Je traint intensief of hebt ’s avonds strakke spieren en wilt een maagvriendelijke vorm',
    'Je slaap is licht in zware weken en je zoekt een avondroutine, geen slaappil',
    'Je wilt een shortlist met echte trade-offs, niet vijf keer “ook goed”',
  ],
  notFor: [
    'Je vooral krampen tijdens inspanning wilt aanpakken. Kijk dan eerder naar citraat',
    'Je alleen de goedkoopste oxide-pot of anonieme Amazon-bulk zoekt. Die vallen hier af op vorm of etiket',
    'Je medisch advies of een diagnose zoekt. Bij klachten: huisarts',
  ],
  methodProse:
    'We kijken eerst naar wat een koper zelf kan nakijken: elementair magnesium per tablet of capsule, echte bisglycinaat (geen oxide of citraat-mix), toevoegingen zoals taurine of BioPerine, prijs per dag bij een eerlijke dosis, slikbaarheid, en of het etiket in een NL-webshop leesbaar is.\n\nWe ranken NL-webshop picks met stabiele koop-links. Amazon- en EU-bulkpots die op veel “beste magnesium”-lijstjes staan, noemen we met naam in Concurrentie en wijzen we af. Dit is etiket- plus (waar relevant) gebruiksoordeel, geen labpanel. Commissiehoogte speelt geen rol in de ranking.',
  methodCriteria: [
    'Elementair Mg per tablet of capsule, niet chelaat-gewicht op de sticker',
    'Echte bisglycinaat-vorm; oxide en citraat vallen af voor deze gids',
    'Toevoegingen en trust: taurine, TRAACS, BioPerine, vulstoffen',
    'Prijs per dag bij labeled of target dosis (~150–250 mg elementair)',
    'First-hand gebruik waar echt; anders expliciet etiket + prijsvergelijking',
    'NL-verkrijgbaarheid bij shops die we linken',
  ],
  trustNarrative:
    'Geen labpanel en geen artsenstempel op deze koopgids. Ik vergeleek etiketten, dosis en prijs per dag, en gebruik Vitakruid zelf in zware trainingsweken. Vitals, Orthica en Mattisson beoordeel ik op etiket en prijs, niet op multi-week eigen gebruik. Partnerlinks staan bij elke koopknop. De ranking volgt criteria, niet commissie.',
  keyTakeaways: [
    'Vitakruid wint op dosis (150 mg) + taurine voor avondgebruik na training',
    'Vitals is runner-up als je Albion TRAACS wilt; reken op meer tabletten',
    'Vergelijk altijd elementair magnesium, niet “500 mg bisglycinaat” op de sticker',
    'Prijs per dag zegt meer dan de potprijs. Mattisson wint op €/dag bij ~200 mg',
    'Practice range hier: 150–250 mg elementair; Consumentenbond waarschuwt rond ~250 mg',
  ],
  comparisonSpecColumns: [
    { key: 'elementair', label: 'Elementair Mg' },
    { key: 'unitsDag', label: 'Stuks @ ~200 mg' },
    { key: 'mgDag', label: 'Mg/dag' },
    { key: 'cert', label: 'Certificering' },
    { key: 'actives', label: 'Extras' },
    { key: 'euroDag', label: '€/dag' },
  ],
  alsoConsidered: [
    {
      name: 'WeightWorld Magnesium Bisglycinaat',
      blurb:
        'Vaak op Amazon-first “beste”-lijstjes. Hoge capsule-voorraad, maar etiket en merchant-pad wisselen sneller dan bij NL-apothekersmerken. Niet gekozen: we willen een stabiele NL-koop-link en een etiket dat je zonder gokken kunt vergelijken op elementair mg.',
    },
    {
      name: 'ProNatural / vit4ever-class EU-bulk',
      blurb:
        'Grote Amazon/EU pots met agressieve “hoogste dosis”-claims. Niet gekozen: dose labeling is lastiger te verifiëren, en ze passen niet bij onze NL-webshop-bar (leesbaar etiket + stabiele merchant).',
    },
    {
      name: 'Lucovitaal Magnesium',
      blurb:
        'Action-pricing en brede zichtbaarheid. Niet gekozen voor deze bisglycinaat-gids: vorm/dose clarity is zwakker dan de shortlist, en het is vaak geen schone bisglycinaat-vergelijking.',
    },
    {
      name: 'Golden Naturals Magnesium',
      blurb:
        'SERP-zichtbaar in NL-rondes. Niet gekozen hier: geen sterkere dosis-, taurine- of TRAACS-edge dan Vitakruid/Vitals, en €/dag wint niet van Mattisson.',
    },
    {
      name: 'VitOrtho Magnesium Bisglycinaat',
      blurb:
        'TRAACS zonder sterke dosis- of taurine-edge. Vitals dekt die job beter in deze set.',
    },
    {
      name: 'Magnesiumoxide “hoge dosis” potten',
      blurb:
        'Goedkoop op het etiket, zwak op opname en maagtolerantie. Verkeerde vorm voor deze gids.',
    },
    {
      name: 'Anonieme huismerk-chelaten zonder elementair Mg',
      blurb:
        'Zonder helder elementair magnesium kun je doseringen niet eerlijk vergelijken.',
    },
    {
      name: 'Citraat-only of mixed pots als “bisglycinaat”',
      blurb:
        'Andere job (vaak spieren of laxerend effect). Hoort niet in een pure bisglycinaat-shortlist.',
    },
  ],
  comparisonProducts: [
    {
      name: 'Vitakruid Magnesium Bisglycinaat 150',
      badge: 'winner',
      tagline: 'Hoogste dosis + taurine',
      rating: 4.8,
      price: '€24,39',
      priceNote: '~€0,27/dag bij 1 tablet (90 st, Superfoodstore, 11 nov 2026)',
      shop: 'Superfoodstore',
      affiliateUrl: DAISY_VITAKRUID,
      // Awin Superfoodstore (EAN 8717438691350) via search-affiliate
      tursoProductId: 27600,
      pros: [
        '150 mg elementair magnesium per tablet',
        'L-taurine (200 mg) in dezelfde dosis',
        'Ik gebruik dit zelf in zware trainingsweken',
      ],
      cons: [
        'Geen TRAACS-certificering',
        'Stickerprijs wisselt sterk per merchant',
        'Twee tabletten voor ~300 mg is een bewuste keuze, geen “één pil lost alles”',
      ],
      verdict:
        'Wint op elementaire dosis per tablet plus taurine. Dit is wat ik zelf pak als de load omhooggaat. Trade-off: geen TRAACS. Wie certificering boven dosis stelt, gaat naar Vitals.',
      chapterProse: [
        'Voor wie: avondroutine na zware trainingsdagen, als je maagvriendelijke bisglycinaat wilt en liever één sterke tablet dan een handvol lage doses. Ik slik Vitakruid in weken met Bulgarian Bag ’s ochtends en BJJ of kracht ’s avonds, meestal één tablet (~150 mg elementair) 60–90 minuten voor het slapen, soms twee als de load piekt. Dat blijft binnen onze practice range van 150–250 mg; boven ~250 mg neem ik de Consumentenbond-caution serieus.',
        'Slik en routine: de tablet is groot maar glad genoeg met water bij het avondeten. Geen sterke nasmaak. Taurine (200 mg) zit in dezelfde dosis; ik behandel dat als ondersteuning bij avondontspanning, niet als apart wonderingrediënt. Een pot van 90 tabletten gaat bij één per avond ongeveer drie maanden mee.',
        'Prijs: Superfoodstore rond €24,39 voor 90 st (check 11 november 2026) is ~€0,27 per tablet en dus ~€0,27/dag bij labeled 150 mg. Twee tabletten (~300 mg) verdubbelt dat. Vitaminstore en Bol schommelen; reken op €/dag, niet op één sticker.',
        'Flaws, maar geen dealbreakers: geen Albion TRAACS-stempel. Wie dat eist, heeft een eerlijk argument voor Vitals. De sticker springt per shop. En ja: dit is geen “één pil lost alles”-product. Het is een avondroutine naast herstel, voeding en slapen.',
      ].join('\n\n'),
      specs: [
        { key: 'elementair', label: 'Elementair Mg', value: '150 mg/tab' },
        { key: 'unitsDag', label: 'Stuks @ ~200 mg', value: '1–2 tabs' },
        { key: 'mgDag', label: 'Mg/dag', value: '150–300' },
        { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
        { key: 'actives', label: 'Extras', value: 'L-Taurine 200 mg' },
        { key: 'euroDag', label: '€/dag', value: '€0,27–€0,54' },
        { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Superfoodstore / Vitaminstore / Bol' },
      ],
      extraOffers: [
        {
          merchant: 'Bol.com',
          price: 'vanaf ~€17–€24',
          url: bolSearchPartner(
            'Vitakruid Magnesium 150 Bisglycinaat 90 tabletten',
            'Vitakruid Magnesium 150 Bisglycinaat',
          ),
        },
      ],
    },
    {
      name: 'Vitals Magnesium Bisglycinaat 100',
      badge: 'runner-up',
      tagline: 'TRAACS als je dat eist',
      rating: 4.5,
      price: '€12,98',
      priceNote: '~€0,43/dag bij 2 tabletten (~200 mg; 60 st, Superfoodstore, 11 nov 2026)',
      shop: 'Superfoodstore',
      affiliateUrl: DAISY_VITALS,
      tursoProductId: 23572,
      pros: [
        'Albion TRAACS-chelaat',
        'Taurine mee in de formule',
        'Stabiele NL-verkrijgbaarheid',
      ],
      cons: [
        '100 mg: meer tabletten voor dezelfde elementaire dosis als Vitakruid',
        'Duurder per elementaire mg dan Vitakruid bij gelijke dagdosis',
      ],
      verdict:
        'Runner-up voor wie TRAACS boven maximale dosis per tablet zet. Trade-off: je slik meer stuks om Vitakruid bij te houden.',
      chapterProse: [
        'Voor wie: je wilt Albion TRAACS op het etiket en accepteert meer tabletten voor dezelfde elementaire dosis. Dit is etiket- plus prijsvergelijking; ik heb Vitals niet multi-week naast Vitakruid getest.',
        'Dosis-rekenen: 100 mg elementair per tablet. Voor ~200 mg heb je twee tabletten nodig (€0,43/dag bij Superfoodstore €12,98 / 60 st, check 11 november 2026). Voor ~250 mg zijn het er drie (300 mg), wat boven onze practice-upper caution van Consumentenbond ~250 mg uitkomt. Taurine zit mee; geen aparte BioPerine.',
        'Flaws: meer pills dan Vitakruid voor dezelfde mg, en hogere € per elementaire mg. Wie TRAACS niet eist, blijft bij de topkeuze.',
      ].join('\n\n'),
      specs: [
        { key: 'elementair', label: 'Elementair Mg', value: '100 mg/tab' },
        { key: 'unitsDag', label: 'Stuks @ ~200 mg', value: '2 tabs' },
        { key: 'mgDag', label: 'Mg/dag', value: '200' },
        { key: 'cert', label: 'Certificering', value: 'Albion TRAACS' },
        { key: 'actives', label: 'Extras', value: 'Taurine 200 mg' },
        { key: 'euroDag', label: '€/dag', value: '~€0,43' },
        { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Superfoodstore / Vitaminstore' },
      ],
    },
    {
      name: 'Orthica Magnesium Bisglycinaat-120',
      badge: '',
      tagline: 'Puur zonder actieve extras',
      rating: 4.4,
      price: '€19,95',
      priceNote: '~€0,67/dag bij 2 vegicaps (~240 mg; 60 st, Vitaminstore, 11 nov 2026)',
      shop: 'Vitaminstore',
      affiliateUrl: DAISY_ORTHICA,
      pros: [
        '120 mg elementair, nette tussenstap',
        'Allergenenarm, weinig franje',
        'Vegicap i.p.v. grote tablet',
      ],
      cons: [
        'Geen taurine, geen TRAACS',
        'Hogere €/dag dan Mattisson bij ~200–240 mg',
      ],
      verdict:
        'Ook goed als je een schone pot wilt zonder taurine of TRAACS-verhaal. Trade-off: mist de synergie en het certificaat van de top twee.',
      chapterProse: [
        'Voor wie: je wilt allergenenarm en zonder actieve extras. Orthica beoordeel ik op etiket en prijs, niet op eigen multi-week gebruik.',
        'Dosis: 120 mg per vegicap. Twee capsules geven ~240 mg elementair, dicht tegen de Consumentenbond-caution. Bij Vitaminstore €19,95 voor 60 st (11 november 2026) is dat ~€0,33 per capsule en ~€0,67/dag bij twee stuks. Geen taurine, geen TRAACS, weinig marketingfranje.',
        'Flaws: geen synergie van taurine, geen TRAACS-stempel, en €/dag is hoger dan Mattisson. Kies Orthica voor “schoon”, niet voor budget of certificering.',
      ].join('\n\n'),
      specs: [
        { key: 'elementair', label: 'Elementair Mg', value: '120 mg/caps' },
        { key: 'unitsDag', label: 'Stuks @ ~200 mg', value: '2 caps (~240 mg)' },
        { key: 'mgDag', label: 'Mg/dag', value: '240' },
        { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
        { key: 'actives', label: 'Extras', value: 'Geen actieve extras' },
        { key: 'euroDag', label: '€/dag', value: '~€0,67' },
        { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Vitaminstore' },
      ],
    },
    {
      name: 'Mattisson Magnesium Bisglycinaat',
      badge: 'budget',
      tagline: 'Scherpste €/dag',
      rating: 4.2,
      price: '€15,25',
      priceNote: '~€0,34/dag bij 2 tabletten (~200 mg; 90 st, Superfoodstore, 11 nov 2026)',
      shop: 'Superfoodstore',
      affiliateUrl: DAISY_MATTISSON,
      tursoProductId: 32809,
      pros: [
        'Laagste €/dag bij ~200 mg in deze set',
        'Taurine + BioPerine op het etiket',
        'Elementair Mg leesbaar vermeld',
      ],
      cons: [
        'Tablet i.p.v. vegicap; lost trager',
        'Voorraad wisselt per merchant',
      ],
      verdict:
        'Budgetkeuze op €/dag als je al bij een NL-webshop bestelt. Trade-off: tabletvorm en wisselende voorraad. Negeer oude stickers rond €34,95; reken op de actuele Superfoodstore-prijs.',
      chapterProse: [
        'Voor wie: je wilt bisglycinaat zonder top-euro’s en accepteert een gewone tablet. Beoordeling op etiket en prijs; geen multi-week eigen test.',
        'Prijs: Superfoodstore €15,25 voor 90 tabletten (11 november 2026) is ~€0,17 per tablet. Bij twee tabletten (~200 mg) kom je op ~€0,34/dag, de scherpste €/dag in deze shortlist. Oude Vitaminstore-stickers rond €34,95 zijn misleidend hoog voor deze vergelijking; check de actuele potprijs.',
        'Extras: taurine plus BioPerine (piperine). Geen hype: BioPerine is een etiket-claim, geen bewijs dat deze pot beter “aanslaat” dan Vitakruid. Flaws: tablet lost trager dan een vegicap, voorraad wisselt, geen TRAACS.',
      ].join('\n\n'),
      specs: [
        { key: 'elementair', label: 'Elementair Mg', value: '100 mg/tab' },
        { key: 'unitsDag', label: 'Stuks @ ~200 mg', value: '2 tabs' },
        { key: 'mgDag', label: 'Mg/dag', value: '200' },
        { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
        { key: 'actives', label: 'Extras', value: 'Taurine + BioPerine' },
        { key: 'euroDag', label: '€/dag', value: '~€0,34' },
        { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Superfoodstore' },
      ],
    },
  ],
  faq: [
    {
      question: 'Welke magnesium bisglycinaat is het beste in Nederland?',
      answer:
        'Onze topkeuze is Vitakruid 150: hoogste elementaire dosis per tablet plus taurine. Vitals is runner-up voor TRAACS. Orthica is de puurdere “ook goed”; Mattisson is budget op €/dag.',
    },
    {
      question: 'Hoeveel magnesium bisglycinaat per dag heb ik nodig?',
      answer:
        'In deze gids mikken we op 150–250 mg elementair magnesium via suppletie (practice range). Consumentenbond waarschuwt voor risico’s rond ~250 mg uit supplementen; we houden die caution aan en starten liever laag. EFSA noemt ~350 mg via supplementen als upper level: dat is context, niet ons practice target. Dit is geen medisch advies; bij klachten: huisarts.',
    },
    {
      question: 'Wanneer neem je magnesium bisglycinaat het beste in?',
      answer:
        'Voor avondontspanning: 60–90 minuten voor het slapengaan, bij een maaltijd. Voor herstel: na de avondtraining of bij het avondeten.',
    },
    {
      question: 'Wat is het verschil tussen magnesium bisglycinaat en glycinaat?',
      answer:
        'Niets wezenlijks. Bisglycinaat (bis = twee) is de preciezere naam voor magnesium gebonden aan glycine. Glycinaat is de informele verkorting.',
    },
    {
      question: 'Zijn er bijwerkingen van magnesium bisglycinaat?',
      answer:
        'Bij normale doseringen meestal mild. Bisglycinaat is doorgaans maagvriendelijker dan oxide of citraat. Bij hoge inname kan zachte ontlasting optreden. Start laag en blijf rond 150–250 mg elementair tenzij een arts anders adviseert.',
    },
    {
      question: 'Hoe snel merk je effect van magnesium bisglycinaat?',
      answer:
        'In een slaap-RCT uit 2025 (155 volwassenen, ~250 mg elementair) zaten de meeste veranderingen binnen ongeveer veertien dagen. Wie al goed slaapt en genoeg magnesium uit voeding haalt, merkt vaak weinig. Geen wonderkuur.',
    },
    {
      question: 'Waarom staan WeightWorld en Amazon-bulk niet in jullie top?',
      answer:
        'We ranken NL-webshop picks met leesbaar etiket en stabiele koop-link. Amazon/EU bulk noemen we in Concurrentie en wijzen we af op etiket- of merchant-bar, niet door ze te negeren.',
    },
  ],
  body: [
    block(
      'Er was een periode dat ik ibuprofen nam om de spierspanning weg te krijgen. Niet omdat ik geblesseerd was, gewoon omdat mijn spieren ’s avonds niet wilden ontspannen na twee trainingen op één dag. Bulgarian Bag ’s ochtends, BJJ of kracht ’s avonds. Zes keer per week. Soms zeven.',
    ),
    block(
      'Mijn vrouw (arts) stelde bisglycinaat voor. Kort oordeel voor wie nu al wilt kopen: Vitakruid 150 is mijn topkeuze. Vitals als je TRAACS eist. Orthica als je schoon zonder extras wilt. Mattisson als €/dag telt. Amazon-bulk en oxide laten we bewust vallen; waarom staat onder Concurrentie.',
    ),
    h2('Wat bisglycinaat wél (en niet) doet'),
    block(
      'Bisglycinaat is magnesium gebonden aan glycine. In de praktijk: vaak beter verdragen dan oxide, bruikbaar ’s avonds, en je vergelijkt het op elementair mg. Het is geen slaappil en geen vervanging voor herstel, voeding of medisch advies.',
    ),
    block(
      'Een RCT uit 2025 (155 volwassenen, ~250 mg elementair) zag verbetering in insomnia-scores versus placebo, met effect binnen ongeveer twee weken. Effecten blijven klein tot matig. Reviews over opname (onder meer Schuchardt & Hahn over organische Mg-zouten) onderbouwen waarom etiket-math op elementair mg telt. Studies onderbouwen. Ze vervangen het koopoordeel niet.',
    ),
    linkBlock(
      'Eerst dosering checken? ',
      'Hoeveel magnesium per dag',
      '/supplementen/hoeveel-magnesium-per-dag/',
      '.',
    ),
    h2('Hoe kies je in dertig seconden'),
    block(
      'Zware trainingsweken + avondroutine → Vitakruid 150. TRAACS verplicht in je hoofd → Vitals. Zo puur mogelijk zonder extras → Orthica. Scherpste €/dag → Mattisson. Oxide, anonieme chelaten of Amazon-bulk → niet deze shortlist.',
    ),
    h2('Bronnen'),
    block(
      'Voedingscentrum (magnesium in voeding en behoefte). Consumentenbond: magnesiumsupplementen-testen en Q&A over dosering (~250 mg supplement-caution). EFSA upper level ~350 mg via supplementen (context, niet practice target). Slaap-RCT 2025, n=155, ~250 mg elementair. Absorptie-reviews organische Mg-zouten (o.a. Schuchardt & Hahn). Prijscheck shortlist: Superfoodstore / Vitaminstore, 11 november 2026.',
    ),
    h2('Conclusie: wat ik zelf zou kopen'),
    block(
      'Zelfde oordeel als boven: Vitakruid Magnesium Bisglycinaat 150 voor mezelf. Vitals als runner-up voor TRAACS. Orthica en Mattisson blijven in de shortlist met eerlijke trade-offs. Geen labtheater. Elementair mg, etiket, €/dag en een eerlijke trade-off zijn genoeg om te kiezen.',
    ),
    linkBlock(
      'Slaap-hoek van dezelfde cluster: ',
      'beste magnesium voor slaap',
      '/supplementen/beste-magnesium-voor-slaap/',
      '.',
    ),
  ],
};

function buildProducts(existingProducts = []) {
  const byName = new Map((existingProducts || []).map((p) => [p.name, p]));
  return REWRITE.comparisonProducts.map((p) => {
    const prev = byName.get(p.name) || {};
    return {
      _type: 'comparisonProduct',
      _key: prev._key || key(),
      ...p,
      image: prev.image || undefined,
      tursoProductId: p.tursoProductId ?? prev.tursoProductId ?? undefined,
      extraOffers: (p.extraOffers || []).map((o) => ({
        _type: 'productExtraOffer',
        _key: key(),
        ...o,
      })),
      specs: (p.specs || []).map((s) => ({
        _type: 'productSpec',
        _key: key(),
        ...s,
      })),
    };
  });
}

function buildPatch(existingProducts = []) {
  return {
    title: REWRITE.title,
    seoTitle: REWRITE.seoTitle,
    seoDescription: REWRITE.seoDescription,
    excerpt: REWRITE.excerpt,
    quickAnswer: REWRITE.quickAnswer,
    updatedAt: REWRITE.updatedAt,
    whoForProse: REWRITE.whoForProse,
    whoFor: REWRITE.whoFor,
    notFor: REWRITE.notFor,
    methodProse: REWRITE.methodProse,
    methodCriteria: REWRITE.methodCriteria,
    trustNarrative: REWRITE.trustNarrative,
    keyTakeaways: REWRITE.keyTakeaways,
    comparisonSpecColumns: REWRITE.comparisonSpecColumns,
    alsoConsidered: REWRITE.alsoConsidered.map((item) => ({
      _type: 'alsoConsideredItem',
      _key: key(),
      ...item,
    })),
    comparisonProducts: buildProducts(existingProducts),
    faq: REWRITE.faq.map((item) => ({
      _type: 'faqItem',
      _key: key(),
      ...item,
    })),
    body: REWRITE.body,
  };
}

async function applyToSanity() {
  if (DRY && !WRITE_TOKEN) {
    const patch = buildPatch([]);
    console.log('DRY-RUN (geen write token): zou patchen', DOC_ID);
    console.log(
      JSON.stringify(
        {
          ...patch,
          body: `[${patch.body.length} blocks]`,
          comparisonProducts: patch.comparisonProducts.map((p) => ({
            name: p.name,
            badge: p.badge,
            tursoProductId: p.tursoProductId,
            shop: p.shop,
            chapterProseChars: (p.chapterProse || '').length,
            euroDag: p.specs?.find((s) => s.key === 'euroDag')?.value,
            extraOffers: p.extraOffers?.length || 0,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!WRITE_TOKEN) {
    console.error('❌ SANITY_API_WRITE_TOKEN ontbreekt (.env of env).');
    console.error('   Mac: Editor-token in .env, dan --apply.');
    console.error('   Of: --write-override + THI_CONTENT_OVERRIDE=1 voor lokale preview.');
    process.exit(1);
  }

  const sanity = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: WRITE_TOKEN,
    useCdn: false,
  });

  const existing = await sanity.fetch(
    `*[_id == $id][0]{ _id, comparisonProducts }`,
    { id: DOC_ID },
  );
  if (!existing?._id) {
    console.error(`Document ${DOC_ID} niet gevonden`);
    process.exit(1);
  }

  const patch = buildPatch(existing.comparisonProducts || []);

  if (DRY) {
    console.log('DRY-RUN: zou patchen', DOC_ID);
    console.log(
      JSON.stringify(
        {
          ...patch,
          body: `[${patch.body.length} blocks]`,
          comparisonProducts: patch.comparisonProducts.map((p) => ({
            name: p.name,
            badge: p.badge,
            tursoProductId: p.tursoProductId,
            shop: p.shop,
            chapterProseChars: (p.chapterProse || '').length,
            euroDag: p.specs?.find((s) => s.key === 'euroDag')?.value,
            extraOffers: p.extraOffers?.length || 0,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  await sanity.patch(DOC_ID).set(patch).commit({ autoGenerateArrayKeys: true });
  console.log(`✅ Patched ${DOC_ID} on ${PROJECT_ID}/${DATASET}`);
  console.log('   Preview: Mac pages:ship alleen na Jouke go. CDN snapshot vernieuwt niet live.');
}

function writeOverride() {
  const path = join(root, '.content-override.json');
  const payload = {
    slug: 'beste-magnesium-bisglycinaat',
    patch: {
      title: REWRITE.title,
      seoTitle: REWRITE.seoTitle,
      seoDescription: REWRITE.seoDescription,
      excerpt: REWRITE.excerpt,
      quickAnswer: REWRITE.quickAnswer,
      updatedAt: REWRITE.updatedAt,
      whoForProse: REWRITE.whoForProse,
      whoFor: REWRITE.whoFor,
      notFor: REWRITE.notFor,
      methodProse: REWRITE.methodProse,
      methodCriteria: REWRITE.methodCriteria,
      trustNarrative: REWRITE.trustNarrative,
      keyTakeaways: REWRITE.keyTakeaways,
      comparisonSpecColumns: REWRITE.comparisonSpecColumns,
      alsoConsidered: REWRITE.alsoConsidered,
      comparisonProducts: REWRITE.comparisonProducts,
      faq: REWRITE.faq,
      body: REWRITE.body,
    },
  };
  writeFileSync(path, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${path}; start Astro with THI_CONTENT_OVERRIDE=1 for local preview`);
}

if (WRITE_OVERRIDE) {
  writeOverride();
} else {
  await applyToSanity();
}
