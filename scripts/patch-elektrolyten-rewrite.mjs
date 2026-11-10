/**
 * Pilot rewrite: /gezondheid/beste-elektrolyten-poeder/ (Sanity wp-15134)
 *
 * Usage:
 *   node scripts/patch-elektrolyten-rewrite.mjs --dry-run
 *   node scripts/patch-elektrolyten-rewrite.mjs --apply   # needs SANITY_API_WRITE_TOKEN
 *   node scripts/patch-elektrolyten-rewrite.mjs --write-override
 *     → writes .content-override.json for local Astro preview (gitignored)
 *
 * Dataset: e6out5at / production
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
const DOC_ID = 'wp-15134';
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

/** Full NL rewrite — persuasive editorial, Wirecutter section jobs. */
export const REWRITE = {
  title: 'Beste elektrolyten poeder 2026: top 6 vergeleken',
  seoTitle: 'Beste elektrolyten poeder 2026: top 6 vergeleken',
  seoDescription:
    'Topkeuze Bulk (~€0,09, 517 mg natrium) + trade-offs. XXL Hydrate voor onderweg. Afvallers met kill-reden — geen labtheater.',
  excerpt:
    'Welk elektrolytenpoeder past bij jouw training? Topkeuze, trade-offs en afvallers — oordeel eerst, feiten daarna.',
  quickAnswer:
    'Topkeuze: Bulk Elektrolyten Poeder — hoogste natrium per portie (517 mg) en ~€0,09. Trade-off: weinig magnesium (15 mg) en te zout voor rustdagen. Voor onderweg zonder afwegen: XXL Hydrate bruistabletten.',
  updatedAt: new Date().toISOString(),
  whoForProse:
    'Dit is een koopgids voor sporters die elektrolyten bewust aanvullen — geen mineralenencyclopedie. Ranking + trade-offs; feiten ondersteunen het oordeel.',
  whoFor: [
    'Je traint intensief (CrossFit, HYROX, hardlopen >60 min) en zweet flink — je wilt natrium aanvullen, niet alleen water',
    'Je zoekt een poeder dat je op trainingsdagen door een fles of shake mengt, zonder suikerbom',
    'Je wilt weten welk formaat (poeder / bruistablet / capsule) bij jouw routine past',
  ],
  notFor: [
    'Je alleen kort of rustig beweegt — dan is water + normale voeding meestal genoeg',
    'Je een capsule zoekt als enige oplossing na zwaar zweten — XXL-capsules missen natrium en kalium',
    'Je medisch advies of een diagnose zoekt — bij klachten eerst je huisarts',
  ],
  methodProse:
    'We begonnen met wat in Nederland écht gekocht wordt: poeders, bruistabletten en capsules via gangbare webshops (Bulk, XXL, MyProtein, Body & Fit). Daarna vergeleken we etiketten op natrium, kalium, magnesium en calcium per portie — plus prijs per portie, niet stickerprijs.\n\nDit is etiket- + prijsvergelijking met eigen gebruik van Bulk op trainingsdagen — geen labpanel, geen “klinisch bewezen door ons”. Affiliate-commissie speelt geen rol in de ranking; elke CTA toont Partnerlink.',
  methodCriteria: [
    'Natrium/kalium per portie t.o.v. intensief zweetverlies',
    'Prijs per effectieve portie (niet alleen verpakkingsprijs)',
    'Formaat en bruikbaarheid: thuis, onderweg, of zonder drinken',
    'Verkrijgbaarheid in NL-webshops; dropship-only valt af',
    'Trade-offs zichtbaar: geen product is voor iedereen top',
  ],
  trustNarrative:
    'Geen labpanel en geen artsenstempel op deze koopgids. Ik vergeleek etiketten, prijs per portie en bruikbaarheid, en gebruik Bulk zelf op trainingsdagen. Affiliate-links staan bij elke CTA — de ranking volgt criteria, niet commissie.',
  keyTakeaways: [
    'Bulk wint voor intensief zweten: 517 mg natrium/portie, ~€0,09',
    'XXL Hydrate is runner-up voor gemak: isotoon, 0 kcal, tube in de sporttas',
    'Capsules zonder natrium/kalium zijn geen zweetvervanger',
    'Beoordeel prijs per portie — niet op de sticker van de pot',
  ],
  alsoConsidered: [
    {
      name: 'Kant-en-klare suikerrijke sportdranken',
      blurb:
        'Kill: je betaalt voor water + suiker; poeder of bruistablet wint op dosiscontrole en prijs per portie.',
    },
    {
      name: '“Elektrolyten”-sticks zonder vermelde mg',
      blurb: 'Kill: etiket onvergelijkbaar — dan kun je geen eerlijke ranking maken.',
    },
    {
      name: 'Losse magnesiumoxide als “elektrolytenkuur”',
      blurb:
        'Kill: dekt zweetnatrium niet. Handig als magnesium-supplement, verkeerde job voor deze gids.',
    },
    {
      name: 'High-sodium importzakken zonder stabiele NL-shop',
      blurb: 'Kill: lastig nabestellen en prijs ondoorzichtig — viel af op verkrijgbaarheid.',
    },
  ],
  comparisonProducts: [
    {
      name: 'Bulk Elektrolyten Poeder',
      badge: 'winner',
      tagline: 'Topkeuze voor intensieve trainingsdagen',
      rating: 4.4,
      price: '€21,99 / 500g',
      priceNote: '~€0,09 per portie',
      shop: 'Bulk.com',
      affiliateUrl: 'https://tidd.ly/4tHurvZ',
      pros: [
        'Laagste prijs per portie (~€0,09)',
        'Hoogste natriumdosering (517 mg)',
        'Bewezen track record (1.700+ reviews)',
      ],
      cons: [
        'Magnesium laag (15 mg per portie)',
        'Te veel natrium voor rustige dagen',
      ],
      verdict:
        'Wint op natrium en prijs. Ik gebruik dit zelf op zware trainingsdagen. Trade-off: amper magnesium en te zout als je alleen een rustige sessie doet.',
    },
    {
      name: 'XXL Hydrate bruistabletten',
      badge: 'runner-up',
      tagline: 'Beste gemak onderweg',
      rating: 4.7,
      price: '€4,99 / 20 tabletten',
      priceNote: '~€0,25 per tablet',
      shop: 'XXL Nutrition',
      affiliateUrl: 'https://tidd.ly/47Zz3p8',
      pros: [
        'Tube past in elke sporttas',
        'Isotone formule, 0 kcal',
        'Laagste instapprijs per verpakking',
      ],
      cons: [
        '20 tabs: snel op bij dagelijks gebruik',
        'Lagere mineralen dan Bulk per portie',
      ],
      verdict:
        'Beste als je geen poeder wilt afwegen: tablet in 500 ml, klaar. Trade-off: lagere mineralen dan Bulk en een tube van 20 is snel leeg.',
    },
    {
      name: 'MyProtein THE Electro',
      badge: '',
      tagline: 'Breedste micronutriëntenprofiel',
      rating: 0,
      price: '€17,99',
      priceNote: '~€0,35 per portie',
      shop: 'MyProtein',
      affiliateUrl: 'https://tidd.ly/47V2uZt',
      pros: [
        '15+ actieve stoffen incl. D-Ribose',
        'Hoger magnesium dan Bulk',
        'Handig bij eenzijdige voeding',
      ],
      cons: [
        'Lager natrium dan Bulk/Body & Fit',
        'Je betaalt voor breedte die je niet altijd nodig hebt',
      ],
      verdict:
        'Slim als je micronutriënten meeneemt in je keuze. Trade-off: geen hoog-natrium zweetvervanger — Bulk blijft beter bij HYROX-zweet.',
    },
    {
      name: 'Body & Fit Isotonic Electrolytes Drink',
      badge: '',
      tagline: 'Solide isotoon, vaak in de aanbieding',
      rating: 4.4,
      price: '€5,99-€11,99',
      priceNote: '~€0,30 per portie',
      shop: 'Body & Fit',
      affiliateUrl:
        'https://partner.bodyandfit.com/c?c=11113&m=12&a=371475&r=&u=%2Fproducts%2Fisotonic-sports-drink',
      pros: [
        'Isotone formule voor tijdens training',
        'Regelmatig tot 50% korting',
        'NZVT-variant voor topsport beschikbaar',
      ],
      cons: [
        'Buiten actie relatief duur',
        'Minder smaken dan concurrenten',
      ],
      verdict:
        'Prima als Body & Fit al je vaste winkel is. Trade-off: wacht op actie — full price is zwakker dan Bulk op prijs/portie.',
    },
    {
      name: 'XXL Elektrolyten capsules',
      badge: '',
      tagline: 'Dagelijks magnesium/calcium zonder drank',
      rating: 4.7,
      price: '€19,99',
      priceNote: '~€0,40 per portie',
      shop: 'XXL Nutrition',
      affiliateUrl: 'https://tidd.ly/4tEwv85',
      pros: [
        'Geen smaak, geen fles nodig',
        '150 mg magnesium + 200 mg calcium',
        'Logisch op rustdagen',
      ],
      cons: [
        '0 mg natrium en 0 mg kalium',
        'Geen zweetvervanger na intensieve training',
      ],
      verdict:
        'Handige dagelijkse aanvulling. Trade-off: skip als enige optie na zwaar zweten — dit is geen elektrolytendrank in pilvorm.',
    },
    {
      name: 'ON Electrolyte Powder',
      badge: '',
      tagline: 'A-merk instapper, niet de beste deal',
      rating: 4.6,
      price: '€12,99',
      priceNote: '~€0,45 per portie',
      shop: 'Body & Fit',
      affiliateUrl:
        'https://partner.bodyandfit.com/c?c=11113&m=12&a=371475&r=&u=%2Fproducts%2Felectrolyte-powder',
      pros: [
        'Bekend merk, strenge kwaliteitscontrole',
        'Basisformule met vier kernelektrolyten',
      ],
      cons: [
        'Duurste per portie in deze set',
        'Dunne reviewbasis (10 beoordelingen)',
      ],
      verdict:
        'Veilig instapper op merknaam. Trade-off: Bulk of XXL doen meer voor minder — ik zou hier niet blijven hangen.',
    },
  ],
  faq: [
    {
      question: 'Wat doet elektrolyten poeder precies?',
      answer:
        'Je lost mineralen (vooral natrium, kalium, magnesium, calcium) op in water om aan te vullen wat je via zweet verliest. Het is geen energiedrank en geen medicijn.',
    },
    {
      question: 'Wanneer moet ik elektrolyten poeder nemen?',
      answer:
        'Tijdens of direct na intensieve inspanning >45 min, bij hitte, of als je ondanks water drinken verkrampt of leeg raakt. Niet standaard bij elke rustige wandeling.',
    },
    {
      question: 'Wat is beter: poeder, tablet of capsule?',
      answer:
        'Poeder is meestal goedkoopst per portie (Bulk). Tabletten winnen op gemak onderweg (XXL Hydrate). Capsules zonder natrium/kalium zijn geen zweetvervanger.',
    },
    {
      question: 'Is elektrolyten poeder zinvol als ik niet sport?',
      answer:
        'Soms bij hitte, ziekte of een streng dieet — meestal niet als dagelijkse “must”. Twijfel je medisch: huisarts, geen blog.',
    },
    {
      question: 'Wat doen elektrolyten bij afvallen?',
      answer:
        'Ze verbranden geen vet. Ze helpen je mineraalbalans op peil te houden als je weinig eet of hard traint — dat is support, geen fatburner.',
    },
    {
      question: 'Hoe weet je of je te weinig elektrolyten hebt?',
      answer:
        'Spierkrampen, duizeligheid of extreme vermoeidheid na flink zweten zijn herkenbare signalen — geen diagnose. Blijf klachten: huisarts.',
    },
  ],
  body: [
    block(
      'Ik krijg die vraag constant: welk elektrolytenpoeder? Kort: Bulk voor zware trainingsdagen (hoog natrium, ~€0,09). XXL Hydrate als je onderweg alleen een tube tabletten wilt. De rest van deze gids is waarom — en voor wie je juist níet moet kopen.',
    ),
    block(
      'Niet elk poeder is gelijk. Sommige doseren nauwelijks mineralen; andere pushen zoveel natrium dat het op een rustdag overkill is. Hieronder: mineralentabel, wat poeder wél doet, flaws van de topkeuze, en hoe je in dertig seconden kiest.',
    ),
    h2('Wat opvalt in de mineralentabel'),
    block(
      'Dit is het quotable overzicht: vier kernmineralen per portie, plus formaat en prijs. Waarden van productlabels (steekproef 12 april 2026) — kleine afwijkingen per smaak mogelijk.',
    ),
    table([
      ['Product', 'Natrium', 'Kalium', 'Magnesium', 'Calcium', 'Formaat', 'Prijs/portie'],
      ['Bulk Elektrolyten Poeder', '517 mg', '153 mg', '15 mg', '92 mg', 'Poeder', '~€0,09'],
      ['XXL Hydrate bruistabletten', '250 mg', '120 mg', '10 mg', '40 mg', 'Bruistablet', '~€0,25'],
      ['MyProtein THE Electro', '200 mg', '100 mg', '56 mg', '80 mg', 'Poeder', '~€0,35'],
      ['Body & Fit Isotonic Drink', '300 mg', '100 mg', '20 mg', '40 mg', 'Poeder', '~€0,30'],
      ['XXL Elektrolyten capsules', '0 mg', '0 mg', '150 mg', '200 mg', 'Capsules', '~€0,40'],
      ['ON Electrolyte Powder', '270 mg', '110 mg', '30 mg', '50 mg', 'Poeder', '~€0,45'],
    ]),
    block(
      'Bulk heeft de hoogste natriumdosering: logisch na CrossFit of HYROX, te veel op de bank. XXL-capsules hebben juist nul natrium maar veel calcium/magnesium — andere job. MyProtein scoort hoger op magnesium en breedte, lager op natrium.',
    ),
    h2('Wat elektrolytenpoeder wél (en niet) doet'),
    block(
      'Elektrolyten (natrium, kalium, magnesium, calcium) helpen bij vochtbalans, spieren en zenuwen. Bij intensieve inspanning verlies je vooral natrium via zweet — water alleen dekt dat niet. Poeder los je op zodat jij de dosis bepaalt en niet voor flessenwater betaalt.',
    ),
    block(
      'Dit is geen geneesmiddel en geen garantie tegen kramp. Herkenbaar leeg of verkrampt na lang zweten? Dan kán een tekort spelen — zie ook onze gids over symptomen. Bij aanhoudende klachten: huisarts.',
    ),
    linkBlock(
      'Basis mist? Lees eerst ',
      'wat elektrolyten zijn',
      '/gezondheid/elektrolyten/',
      '.',
    ),
    h2('Flaws bij de topkeuze (Bulk) — geen dealbreakers'),
    block(
      'Bulk wint deze set, maar is niet heilig. Magnesium per portie is laag (15 mg): wie specifiek magnesium zoekt, pakt dat beter apart (of kijkt naar MyProtein/XXL-capsules). De natriumklap is bewust hoog — op rustdagen schep ik minder of sla ik over. Geen vitamines: dat is een feature als je rommel wilt vermijden, een minpunt als je “alles-in-één” zoekt.',
    ),
    h2('Hoe kies je in dertig seconden'),
    block(
      'Zware training + flink zweten → Bulk. Alleen gemak in de sporttas → XXL Hydrate. Micronutriënten meenemen → MyProtein. Al klant bij Body & Fit en wacht op actie → hun isotoon. Geen drankje, wel magnesium/calcium op rustdagen → XXL-capsules. Alleen merknaam → ON, maar ik zou doorlopen naar Bulk.',
    ),
    h2('Conclusie — wat ik zelf zou kopen'),
    block(
      'Zelfde oordeel als boven: Bulk op trainingsdagen, XXL Hydrate in de tas voor onderweg. MyProtein alleen als je de breedte echt wilt. Skip capsules als enige zweetplan. Geen labtheater nodig — etiket, prijs per portie en eerlijke trade-offs zijn genoeg om te kiezen.',
    ),
    linkBlock(
      'Timing: ',
      'wanneer elektrolyten nemen',
      '/gezondheid/wanneer-elektrolyten-nemen/',
      '.',
    ),
    linkBlock(
      'Liever kant-en-klaar? ',
      'elektrolyten drank',
      '/gezondheid/elektrolyten-drank/',
      '.',
    ),
  ],
};

async function applyToSanity() {
  if (!WRITE_TOKEN) {
    console.error('❌ SANITY_API_WRITE_TOKEN ontbreekt (.env of env).');
    console.error('   Schrijf Studio-token (Editor) en run opnieuw met --apply.');
    console.error('   Of plak de copy uit docs/thi-elektrolyten-rewrite.md.');
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

  // Preserve images from existing picks by name
  const byName = new Map(
    (existing.comparisonProducts || []).map((p) => [p.name, p]),
  );
  const products = REWRITE.comparisonProducts.map((p) => {
    const prev = byName.get(p.name) || {};
    return {
      _type: 'comparisonProduct',
      _key: prev._key || key(),
      ...p,
      image: prev.image || undefined,
      tursoProductId: prev.tursoProductId ?? p.tursoProductId ?? undefined,
    };
  });

  const patch = {
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
    alsoConsidered: REWRITE.alsoConsidered.map((item) => ({
      _type: 'alsoConsideredItem',
      _key: key(),
      ...item,
    })),
    comparisonProducts: products,
    faq: REWRITE.faq.map((item) => ({
      _type: 'faqItem',
      _key: key(),
      ...item,
    })),
    body: REWRITE.body,
  };

  if (DRY) {
    console.log('DRY-RUN — zou patchen:', DOC_ID);
    console.log(JSON.stringify({ ...patch, body: `[${patch.body.length} blocks]` }, null, 2));
    return;
  }

  await sanity.patch(DOC_ID).set(patch).commit({ autoGenerateArrayKeys: true });
  console.log(`✅ Patched ${DOC_ID} on ${PROJECT_ID}/${DATASET}`);
  console.log('   Static preview: Mac `pages:ship` / Pages rebuild nodig — CDN snapshot vernieuwt niet live.');
}

function writeOverride() {
  const path = join(root, '.content-override.json');
  const payload = {
    slug: 'beste-elektrolyten-poeder',
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
