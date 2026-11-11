/**
 * Money-page refresh: /supplementen/beste-magnesium-bisglycinaat/ (Sanity wp-15441)
 *
 * Usage:
 *   node scripts/patch-magnesium-bisglycinaat-rewrite.mjs --dry-run
 *   node scripts/patch-magnesium-bisglycinaat-rewrite.mjs --apply   # needs SANITY_API_WRITE_TOKEN
 *   node scripts/patch-magnesium-bisglycinaat-rewrite.mjs --write-override
 *     → writes .content-override.json for local Astro preview (gitignored)
 *
 * Dataset: e6out5at / production
 * Method doc: Project store docs/thi-magnesium-pick-method.md
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

function table(rows) {
  return {
    _type: 'table',
    _key: key(),
    rows: rows.map((cells) => ({ _type: 'tableRow', _key: key(), cells })),
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

/** Full NL rewrite — persuasive editorial, Wirecutter section jobs. No em dashes. */
export const REWRITE = {
  title: 'Beste magnesium bisglycinaat 2026: topkeuze en trade-offs',
  seoTitle: 'Beste magnesium bisglycinaat 2026: topkeuze vergeleken',
  seoDescription:
    'Topkeuze Vitakruid 150 mg + taurine. Runner-up Vitals TRAACS. Orthica puur, Mattisson budget via Awin. Trade-offs, geen bullet-farm.',
  excerpt:
    'Welke magnesium bisglycinaat koop je? Topkeuze, runner-up en trade-offs. Oordeel eerst, feiten daarna.',
  quickAnswer:
    'Topkeuze: Vitakruid Magnesium Bisglycinaat 150. Hoogste elementaire dosis per tablet (150 mg) plus L-taurine. Ik gebruik dit zelf in zware trainingsweken. Trade-off: geen TRAACS-stempel. Wie certificering boven dosis stelt, neemt Vitals.',
  updatedAt: new Date().toISOString(),
  whoForProse:
    'Dit is een koopgids voor bisglycinaat in NL-webshops. Ranking en trade-offs eerst. Stofkennis staat onder het oordeel, niet in plaats ervan.',
  whoFor: [
    'Je traint intensief of hebt ’s avonds strakke spieren en wilt een maagvriendelijke vorm',
    'Je slaap is licht in zware weken en je zoekt een avondroutine, geen slaappil',
    'Je wilt een shortlist met echte trade-offs, niet vijf keer “ook goed”',
  ],
  notFor: [
    'Je vooral krampen tijdens inspanning wilt aanpakken. Kijk dan eerder naar citraat',
    'Je alleen de goedkoopste oxide-pot zoekt. Die valt hier af op vorm',
    'Je medisch advies of een diagnose zoekt. Bij klachten: huisarts',
  ],
  methodProse:
    'We starten bij live affiliate-realiteit: Daisycon Vitaminstore magnesium (bewezen cash), Awin-merchants in Turso (Superfoodstore e.d.), en Bol alleen als last resort (Vitakruid €2,10). Daarna filteren we op echte bisglycinaat, elementair magnesium, vulstoffen/toevoegingen, prijs per effectieve dosis, NL-voorraad en leesbaar etiket.\n\nShortlist blijft kort (vier picks). Afvallers krijgen een kill-reden. Dit is etiket- plus gebruiksoordeel, geen labpanel. Affiliate-commissie speelt geen rol in de ranking. Welke CTA we tonen volgt Awin → Daisycon → Bol.',
  methodCriteria: [
    'Elementair Mg per tablet of capsule, niet chelaat-gewicht',
    'Echte bisglycinaat-vorm; oxide en citraat vallen af voor deze gids',
    'Toevoegingen en trust: taurine, TRAACS, BioPerine, vulstoffen',
    'Prijs per effectieve dosis via NL affiliate-feed',
    'Werkende affiliate-URL verplicht (Awin eerst, Daisycon, Bol last)',
  ],
  trustNarrative:
    'Geen labpanel en geen artsenstempel op deze koopgids. Ik vergeleek etiketten, dosis en prijs per dosis, en gebruik Vitakruid zelf in zware weken. Partnerlinks staan bij elke CTA. De ranking volgt criteria, niet commissie.',
  keyTakeaways: [
    'Vitakruid wint op dosis (150 mg) + taurine voor avondgebruik na training',
    'Vitals is runner-up als je Albion TRAACS wilt; reken op meer tabletten',
    'Vergelijk altijd elementair magnesium, niet “500 mg bisglycinaat” op de sticker',
    'Prijs per dosis zegt meer dan de potprijs. Mattisson wint budget via Awin',
  ],
  comparisonSpecColumns: [
    { key: 'elementair', label: 'Elementair Mg' },
    { key: 'cert', label: 'Certificering' },
    { key: 'toevoeging', label: 'Toevoeging' },
    { key: 'prijsDosis', label: 'Prijs/dosis' },
  ],
  alsoConsidered: [
    {
      name: 'VitOrtho Magnesium Bisglycinaat',
      blurb:
        'Kill: TRAACS zonder sterke dosis- of taurine-edge. Vitals dekt die job beter in deze set.',
    },
    {
      name: 'Magnesiumoxide “hoge dosis” potten',
      blurb:
        'Kill: goedkoop op het etiket, zwak op opname en maagtolerantie. Verkeerde vorm voor deze gids.',
    },
    {
      name: 'Anonieme huismerk-chelaten zonder elementair Mg',
      blurb:
        'Kill: zonder helder elementair magnesium kun je doseringen niet eerlijk vergelijken.',
    },
    {
      name: 'Citraat-only of mixed pots als “bisglycinaat”',
      blurb:
        'Kill: andere job (vaak spieren of laxerend effect). Hoort niet in een pure bisglycinaat-shortlist.',
    },
  ],
  comparisonProducts: [
    {
      name: 'Vitakruid Magnesium Bisglycinaat 150',
      badge: 'winner',
      tagline: 'Hoogste dosis + taurine',
      rating: 4.8,
      price: '€24,39',
      priceNote: '~€0,27 per tablet (90 st, Superfoodstore-range)',
      shop: 'Vitaminstore',
      affiliateUrl: DAISY_VITAKRUID,
      // Awin Superfoodstore tursoProductId: set on Mac after search-affiliate (EAN 8717438691350)
      pros: [
        '150 mg elementair magnesium per tablet',
        'L-taurine (200 mg) in dezelfde dosis',
        'Ik gebruik dit zelf in zware trainingsweken',
      ],
      cons: [
        'Geen TRAACS-certificering',
        'Stickerprijs wisselt sterk per merchant',
      ],
      verdict:
        'Wint op elementaire dosis per tablet plus taurine. Dit is wat ik zelf pak als de load omhooggaat. Trade-off: geen TRAACS. Wie certificering boven dosis stelt, gaat naar Vitals.',
      specs: [
        { key: 'elementair', label: 'Elementair Mg', value: '150 mg/tab' },
        { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
        { key: 'toevoeging', label: 'Toevoeging', value: 'L-Taurine 200 mg' },
        { key: 'prijsDosis', label: 'Prijs/dosis', value: '~€0,27/tab' },
        { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Vitaminstore / Superfoodstore / Bol' },
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
      price: '€14,21',
      priceNote: '~€0,24 per tablet (60 st, Superfoodstore)',
      shop: 'Superfoodstore',
      affiliateUrl: DAISY_VITALS,
      tursoProductId: 23572,
      pros: [
        'Albion TRAACS-chelaat',
        'Taurine mee in de formule',
        'Stabiel Awin-pad via Superfoodstore',
      ],
      cons: [
        '100 mg: meer tabletten voor 150–300 mg/dag',
        'Duurder per elementaire mg dan Vitakruid',
      ],
      verdict:
        'Runner-up voor wie TRAACS boven maximale dosis per tablet zet. Trade-off: je slik meer stuks om Vitakruid bij te houden.',
      specs: [
        { key: 'elementair', label: 'Elementair Mg', value: '100 mg/tab' },
        { key: 'cert', label: 'Certificering', value: 'Albion TRAACS' },
        { key: 'toevoeging', label: 'Toevoeging', value: 'Taurine 200 mg' },
        { key: 'prijsDosis', label: 'Prijs/dosis', value: '~€0,24/tab' },
        { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Superfoodstore / Vitaminstore' },
      ],
    },
    {
      name: 'Orthica Magnesium Bisglycinaat-120',
      badge: '',
      tagline: 'Puur zonder actieve extras',
      rating: 4.4,
      price: '€19,95',
      priceNote: '120 mg per vegicap',
      shop: 'Vitaminstore',
      affiliateUrl: DAISY_ORTHICA,
      pros: [
        '120 mg elementair, nette tussenstap',
        'Allergenenarm, weinig franje',
        'Betrouwbaar NL-merk met Daisycon-CTA',
      ],
      cons: [
        'Geen taurine, geen TRAACS',
        'Geen Awin-turso-hit gevonden in deze refresh',
      ],
      verdict:
        'Ook goed als je een schone pot wilt zonder taurine of TRAACS-verhaal. Trade-off: mist de synergie en het certificaat van de top twee.',
      specs: [
        { key: 'elementair', label: 'Elementair Mg', value: '120 mg/caps' },
        { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
        { key: 'toevoeging', label: 'Toevoeging', value: 'Geen actieve extras' },
        { key: 'prijsDosis', label: 'Prijs/dosis', value: 'Vitaminstore-sticker' },
        { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Vitaminstore' },
      ],
    },
    {
      name: 'Mattisson Magnesium Bisglycinaat',
      badge: 'budget',
      tagline: 'Scherpe Awin-prijs',
      rating: 4.2,
      price: '€15,25',
      priceNote: '~€0,17 per tablet (90 st, Superfoodstore)',
      shop: 'Superfoodstore',
      affiliateUrl: DAISY_MATTISSON,
      tursoProductId: 32809,
      pros: [
        'Scherp per dosis via Awin Superfoodstore',
        'Taurine + BioPerine',
        'Bekend NL-etiket, elementair Mg leesbaar',
      ],
      cons: [
        'Tablet i.p.v. vegicap; lost trager',
        'Voorraad wisselt per merchant',
      ],
      verdict:
        'Budgetkeuze als je al bij Superfoodstore bestelt. Trade-off: tabletvorm en wisselende voorraad. Negeer de oude Vitaminstore-sticker van €34,95; reken op de Awin-prijs.',
      specs: [
        { key: 'elementair', label: 'Elementair Mg', value: '100 mg/tab' },
        { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
        { key: 'toevoeging', label: 'Toevoeging', value: 'Taurine + BioPerine' },
        { key: 'prijsDosis', label: 'Prijs/dosis', value: '~€0,17/tab' },
        { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Superfoodstore (Awin)' },
      ],
    },
  ],
  faq: [
    {
      question: 'Welke magnesium bisglycinaat is het beste in Nederland?',
      answer:
        'Onze topkeuze is Vitakruid 150: hoogste elementaire dosis per tablet plus taurine. Vitals is runner-up voor TRAACS. Orthica is de puurdere “ook goed”; Mattisson is budget via Awin.',
    },
    {
      question: 'Hoeveel magnesium bisglycinaat per dag heb ik nodig?',
      answer:
        'De meeste mensen mikken op 150–300 mg elementair magnesium via suppletie. Bouw rustig op en houd de EFSA-bovengrens van 350 mg via supplementen aan. Dit is geen medisch advies.',
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
        'Bij normale doseringen meestal mild. Bisglycinaat is doorgaans maagvriendelijker dan oxide of citraat. Bij zeer hoge inname kan zachte ontlasting optreden. Start laag.',
    },
    {
      question: 'Hoe snel merk je effect van magnesium bisglycinaat?',
      answer:
        'In de slaap-RCT (2025) zaten de meeste veranderingen binnen ongeveer veertien dagen. Wie al goed slaapt en genoeg magnesium uit voeding haalt, merkt vaak weinig. Geen wonderkuur.',
    },
  ],
  body: [
    block(
      'Er was een periode dat ik ibuprofen nam om de spierspanning weg te krijgen. Niet omdat ik geblesseerd was, gewoon omdat mijn spieren ’s avonds niet wilden ontspannen na twee trainingen op één dag. Bulgarian Bag ’s ochtends, BJJ of kracht ’s avonds. Zes keer per week. Soms zeven.',
    ),
    block(
      'Mijn vrouw (arts) stelde bisglycinaat voor. Kort oordeel voor wie nu al wilt kopen: Vitakruid 150 is mijn topkeuze. Vitals als je TRAACS eist. De rest van deze gids is waarom, voor wie niet, en wat we lieten vallen.',
    ),
    h2('Wat telt in de vergelijkingstabel'),
    block(
      'We rekenen in elementair magnesium, certificering, toevoegingen en prijs per dosis. Scores zonder kill-reden laten we weg. Dit is de quotable laag onder de shortlist hierboven.',
    ),
    table([
      ['Product', 'Elementair Mg', 'Certificering', 'Toevoeging', 'Prijs/dosis'],
      ['Vitakruid 150', '150 mg/tab', 'Geen TRAACS', 'L-Taurine', '~€0,27'],
      ['Vitals 100', '100 mg/tab', 'Albion TRAACS', 'Taurine', '~€0,24'],
      ['Orthica 120', '120 mg/caps', 'Geen TRAACS', 'Geen extras', 'Vitaminstore'],
      ['Mattisson 100', '100 mg/tab', 'Geen TRAACS', 'Taurine + BioPerine', '~€0,17'],
    ]),
    h2('Flaws bij de topkeuze (Vitakruid). Geen dealbreakers'),
    block(
      'Vitakruid wint deze set, maar is niet heilig. Geen TRAACS: wie een Albion-stempel wil, heeft een eerlijk argument voor Vitals. De stickerprijs springt per shop. Reken op prijs per tablet, niet op één merchant. En ja: twee of drie tabletten per avond is een bewuste keuze, geen “één pil lost alles op”.',
    ),
    h2('Wat bisglycinaat wél (en niet) doet'),
    block(
      'Bisglycinaat is magnesium gebonden aan glycine. In de praktijk: vaak beter verdragen dan oxide, bruikbaar ’s avonds, en je vergelijkt het op elementair mg. Het is geen slaappil en geen vervanging voor herstel, voeding of medisch advies.',
    ),
    block(
      'Een RCT uit 2025 (155 volwassenen, ~250 mg elementair) zag verbetering in insomnia-scores versus placebo, met effect binnen ongeveer twee weken. Effecten blijven klein tot matig. Wie al goed slaapt, merkt weinig. Studies onderbouwen. Ze vervangen het koopoordeel niet.',
    ),
    linkBlock(
      'Eerst dosering checken? ',
      'Hoeveel magnesium per dag',
      '/supplementen/hoeveel-magnesium-per-dag/',
      '.',
    ),
    h2('Hoe kies je in dertig seconden'),
    block(
      'Zware trainingsweken + avondroutine → Vitakruid 150. TRAACS verplicht in je hoofd → Vitals. Zo puur mogelijk zonder extras → Orthica. Scherpste Awin-prijs → Mattisson. Oxide of “max mg op de sticker” → niet deze gids.',
    ),
    h2('Conclusie: wat ik zelf zou kopen'),
    block(
      'Zelfde oordeel als boven: Vitakruid Magnesium Bisglycinaat 150 voor mezelf. Vitals als runner-up voor TRAACS. Orthica en Mattisson blijven in de shortlist met eerlijke trade-offs. Geen labtheater nodig. Dosis, etiket, prijs per dosis en een werkende affiliate-link zijn genoeg om te kiezen.',
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
  console.log(`Wrote ${path} — start Astro with THI_CONTENT_OVERRIDE=1 for local preview`);
}

if (WRITE_OVERRIDE) {
  writeOverride();
} else {
  await applyToSanity();
}
