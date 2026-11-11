/**
 * Operational prototype content , used when Sanity is empty/unreachable.
 * Real Sanity docs win on slug collision once migrated.
 */
import type { Category, Post, Author } from '../../types';

export const fixtureAuthor: Author = {
  _id: 'fixture-author-jouke',
  name: 'Jouke de Jong',
  slug: { current: 'jouke-de-jong' },
  credentials:
    'Oprichter The Health Issue · schrijft magnesium- en mineraalgidsen',
  bio:
    'Ik beoordeel supplementen op etikethelderheid, elementair magnesium, dosering en prijs per effectieve dosis , niet op commissiehoogte. Affiliate-links staan altijd zichtbaar bij de koopoptie.',
};

export const fixtureCategories: Category[] = [
  {
    _id: 'cat-supplementen',
    title: 'Supplementen',
    slug: { current: 'supplementen' },
    description: 'Vergelijkingen en gidsen over vitaminen, mineralen en sportsupplementen.',
    order: 1,
  },
  {
    _id: 'cat-gezondheid',
    title: 'Gezondheid',
    slug: { current: 'gezondheid' },
    description: 'Slaap, stress, energie en dagelijkse gezondheidskeuzes.',
    order: 2,
  },
  {
    _id: 'cat-voeding',
    title: 'Voeding',
    slug: { current: 'voeding' },
    description: 'Eiwitten, calorieën en praktische voedingsgidsen , inclusief rekentools.',
    order: 3,
  },
  {
    _id: 'cat-training',
    title: 'Training',
    slug: { current: 'training' },
    description: 'Kracht, herstel en training zonder marketingruis.',
    order: 4,
  },
];

function cat(slug: string): Category {
  return fixtureCategories.find(c => c.slug.current === slug)!;
}

export const fixturePosts: Post[] = [
  {
    _id: 'fixture-cmp-magnesium',
    title: 'Beste magnesium bisglycinaat 2026: topkeuze en trade-offs',
    slug: { current: 'beste-magnesium-bisglycinaat' },
    template: 'comparison',
    publishedAt: '2026-04-19T15:20:54.000Z',
    updatedAt: '2026-11-11T12:00:00.000Z',
    excerpt:
      'Welke magnesium bisglycinaat koop je? Topkeuze, runner-up en trade-offs. Oordeel eerst, feiten daarna.',
    seoTitle: 'Beste magnesium bisglycinaat 2026: topkeuze vergeleken',
    seoDescription:
      'Topkeuze Vitakruid 150 mg + taurine. Runner-up Vitals TRAACS. Orthica puur, Mattisson budget via Awin. Trade-offs, geen bullet-farm.',
    category: cat('supplementen'),
    author: fixtureAuthor,
    quickAnswer:
      'Topkeuze: Vitakruid Magnesium Bisglycinaat 150. Hoogste elementaire dosis per tablet (150 mg) plus L-taurine. Ik gebruik dit zelf in zware trainingsweken. Trade-off: geen TRAACS-stempel. Wie certificering boven dosis stelt, neemt Vitals.',
    keyTakeaways: [
      'Vitakruid wint op dosis (150 mg) + taurine voor avondgebruik na training',
      'Vitals is runner-up als je Albion TRAACS wilt; reken op meer tabletten',
      'Vergelijk altijd elementair magnesium, niet “500 mg bisglycinaat” op de sticker',
      'Prijs per dosis zegt meer dan de potprijs. Mattisson wint budget via Awin',
    ],
    topicGroup: 'Magnesium',
    coverImageUrl:
      'https://cdn.shopify.com/s/files/1/0822/6681/6844/files/2b9ae86d5a50ef953db9f7dd97b0.png?v=1791569559',
    relatedCalculator: {
      title: 'Magnesium-check (rekentool)',
      href: '/voeding/calculators/magnesium/',
    },
    trustNarrative:
      'Geen labpanel en geen artsenstempel op deze koopgids. Ik vergeleek etiketten, dosis en prijs per dosis, en gebruik Vitakruid zelf in zware weken. Partnerlinks staan bij elke CTA. De ranking volgt criteria, niet commissie.',
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
      'We starten bij live affiliate-realiteit: Daisycon Vitaminstore magnesium, Awin-merchants in Turso, en Bol alleen als last resort. Daarna filteren we op echte bisglycinaat, elementair magnesium, toevoegingen, prijs per dosis, NL-voorraad en leesbaar etiket.\n\nShortlist blijft kort (vier picks). Afvallers krijgen een kill-reden. Affiliate-commissie speelt geen rol in de ranking.',
    methodCriteria: [
      'Elementair Mg per tablet of capsule, niet chelaat-gewicht',
      'Echte bisglycinaat-vorm; oxide en citraat vallen af voor deze gids',
      'Toevoegingen en trust: taurine, TRAACS, BioPerine, vulstoffen',
      'Prijs per effectieve dosis via NL affiliate-feed',
      'Werkende affiliate-URL verplicht (Awin eerst, Daisycon, Bol last)',
    ],
    comparisonDisclosure:
      'The Health Issue kan een commissie ontvangen via affiliate-links. Dat beïnvloedt onze redactionele keuzes niet.',
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
        shop: 'Vitaminstore',
        affiliateUrl:
          'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&ws=magnesium&dl=product%2Fvitakruid-magnesium-150-bisglycinaat-tabletten-1306678%3F_br_psugg_q%3Dvitakruid%2Bmagnesium',
        imageUrl:
          'https://cdn.shopify.com/s/files/1/0822/6681/6844/files/2b9ae86d5a50ef953db9f7dd97b0.png?v=1791569559',
        pros: [
          '150 mg elementair magnesium per tablet',
          'L-taurine (200 mg) in dezelfde dosis',
          'Ik gebruik dit zelf in zware trainingsweken',
        ],
        cons: ['Geen TRAACS-certificering', 'Stickerprijs wisselt sterk per merchant'],
        verdict:
          'Wint op elementaire dosis per tablet plus taurine. Dit is wat ik zelf pak als de load omhooggaat. Trade-off: geen TRAACS. Wie certificering boven dosis stelt, gaat naar Vitals.',
        specs: [
          { key: 'elementair', label: 'Elementair Mg', value: '150 mg/tab' },
          { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
          { key: 'toevoeging', label: 'Toevoeging', value: 'L-Taurine 200 mg' },
          { key: 'prijsDosis', label: 'Prijs/dosis', value: '~€0,27/tab' },
        ],
        extraOffers: [
          {
            merchant: 'Bol.com',
            price: 'vanaf ~€17–€24',
            url: 'https://partner.bol.com/click/click?p=2&t=url&s=1121688&f=TXL&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fs%2F%3Fsearchtext%3DVitakruid%2BMagnesium%2B150%2BBisglycinaat%2B90%2Btabletten&name=Vitakruid%20Magnesium%20150%20Bisglycinaat',
          },
        ],
      },
      {
        name: 'Vitals Magnesium Bisglycinaat 100',
        badge: 'runner-up',
        tagline: 'TRAACS als je dat eist',
        rating: 4.5,
        price: '€14,21',
        shop: 'Superfoodstore',
        tursoProductId: 23572,
        affiliateUrl:
          'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&ws=magnesium&dl=product%2Fvitals-magnesiumbisglycinaat-100-mg-tabletten-258130',
        imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/37.png?v=1685112596',
        pros: ['Albion TRAACS-chelaat', 'Taurine mee in de formule', 'Stabiel Awin-pad'],
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
        ],
      },
      {
        name: 'Orthica Magnesium Bisglycinaat-120',
        badge: '',
        tagline: 'Puur zonder actieve extras',
        rating: 4.4,
        price: '€19,95',
        shop: 'Vitaminstore',
        affiliateUrl:
          'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&ws=magnesium&dl=product%2Forthica-magnesium-bisglycinaat-vegicaps-1304652',
        imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/38.png?v=1685112638',
        pros: [
          '120 mg elementair, nette tussenstap',
          'Allergenenarm, weinig franje',
          'Betrouwbaar NL-merk met Daisycon-CTA',
        ],
        cons: ['Geen taurine, geen TRAACS', 'Geen Awin-turso-hit in deze refresh'],
        verdict:
          'Ook goed als je een schone pot wilt zonder taurine of TRAACS-verhaal. Trade-off: mist de synergie en het certificaat van de top twee.',
        specs: [
          { key: 'elementair', label: 'Elementair Mg', value: '120 mg/caps' },
          { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
          { key: 'toevoeging', label: 'Toevoeging', value: 'Geen actieve extras' },
          { key: 'prijsDosis', label: 'Prijs/dosis', value: 'Vitaminstore-sticker' },
        ],
      },
      {
        name: 'Mattisson Magnesium Bisglycinaat',
        badge: 'budget',
        tagline: 'Scherpe Awin-prijs',
        rating: 4.2,
        price: '€15,25',
        shop: 'Superfoodstore',
        tursoProductId: 32809,
        affiliateUrl:
          'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&ws=magnesium&dl=product%2Fmattisson-healthstyle-magnesium-bisglycinaat-100mg-taurine-tabletten-1309573',
        imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/38.png?v=1685112638',
        pros: [
          'Scherp per dosis via Awin Superfoodstore',
          'Taurine + BioPerine',
          'Bekend NL-etiket, elementair Mg leesbaar',
        ],
        cons: ['Tablet i.p.v. vegicap; lost trager', 'Voorraad wisselt per merchant'],
        verdict:
          'Budgetkeuze als je al bij Superfoodstore bestelt. Trade-off: tabletvorm en wisselende voorraad. Negeer de oude Vitaminstore-sticker van €34,95; reken op de Awin-prijs.',
        specs: [
          { key: 'elementair', label: 'Elementair Mg', value: '100 mg/tab' },
          { key: 'cert', label: 'Certificering', value: 'Geen TRAACS' },
          { key: 'toevoeging', label: 'Toevoeging', value: 'Taurine + BioPerine' },
          { key: 'prijsDosis', label: 'Prijs/dosis', value: '~€0,17/tab' },
        ],
      },
    ],
    faq: [
      {
        question: 'Welke magnesium bisglycinaat is het beste in Nederland?',
        answer:
          'Onze topkeuze is Vitakruid 150: hoogste elementaire dosis per tablet plus taurine. Vitals is runner-up voor TRAACS.',
      },
      {
        question: 'Hoeveel magnesium bisglycinaat per dag heb ik nodig?',
        answer:
          'Meestal 150–300 mg elementair via suppletie. Bouw rustig op. EFSA-bovengrens 350 mg via supplementen. Geen medisch advies.',
      },
    ],
    body: [],
  },
  {
    _id: 'fixture-hr-mattisson',
    title: 'Mattisson Magnesium Bisglycinaat , eerlijke review',
    slug: { current: 'mattisson-magnesium-bisglycinaat-review' },
    template: 'honest-review',
    publishedAt: '2026-04-08T10:00:00.000Z',
    updatedAt: '2026-10-12T10:00:00.000Z',
    excerpt:
      'Acht weken één product: etiket, dosering, maag, slaap en of de topkeuze uit onze vergelijking ook in de praktijk standhoudt.',
    seoTitle: 'Mattisson Magnesium Bisglycinaat review (2026) , The Health Issue',
    seoDescription:
      'Eerlijke single-product review van Mattisson Magnesium Bisglycinaat: scores, weekjournal en koopopties.',
    category: cat('supplementen'),
    author: fixtureAuthor,
    topicGroup: 'Magnesium',
    coverImageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/38.png?v=1685112638',
    relatedCalculator: {
      title: 'Magnesium-check (rekentool)',
      href: '/voeding/calculators/magnesium/',
    },
    quickAnswer:
      'Onze topkeuze uit de magnesium-vergelijking houdt stand: helder etiket, rustige maag, eerlijke prijs per effectieve dosis , geen multi-merk mini-gids, alleen dit product.',
    keyTakeaways: [
      'Elementair magnesium staat duidelijk genoeg om doseringen te rekenen',
      'Avondroutine zonder maaggedoe in de testperiode',
      'Voorraad wisselt per webshop , check de actuele feed-prijs',
      'Dit is géén vergelijking van vijf merken; die staat apart',
    ],
    honestReview: {
      productName: 'Mattisson Magnesium Bisglycinaat',
      testPeriod: '8 weken',
      overallScore: 8.6,
      bestFor: 'Avondgebruik zonder maaggedoe, met een helder etiket en stabiele NL-webshop',
      notFor: [
        'Je alleen op de laagste stickerprijs selecteert (oxide wint dan, maar niet op opname)',
        'Je medische claims of klinische bewijzen van ons verwacht',
        'Je een multi-merk ranking zoekt , daarvoor is de vergelijkingsgids',
      ],
      tagline: 'Topkeuze uit onze bisglycinaat-gids , hier uitgewerkt als single-product review',
      verdict:
        'Mattisson blijft onze favoriet voor dagelijks bisglycinaat: schone formule, redelijke prijs per dosis, en een etiket waar je mee kunt rekenen. In acht weken geen maagproblemen, wel een routine die ik volhield. De enige structurele kanttekening is voorraad: niet elke merchant heeft het altijd liggen, dus de affiliate-prijs kan wisselen.',
      imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/38.png?v=1685112638',
      tursoProductId: 32809,
      pros: [
        'Helder etiket , dosering is te vergelijken',
        'Goede prijs/kwaliteit in de Awin-feed',
        'Maag bleef rustig bij avonddosering',
        'Stabiel NL-merk met gangbare webshops',
      ],
      cons: [
        'Voorraad wisselt per merchant',
        'Niet altijd de allerlaagste stickerprijs',
        'Assortiment kan per shop anders zijn',
      ],
      scores: { ingredients: 9, dosage: 9, effect: 8, value: 8, taste: 8 },
      weeklyEntries: [
        {
          week: 1,
          title: 'Opstarten',
          body: 'Twee capsules ’s avonds. Geen maagklachten, geen rare nasmaak. Etiket gecheckt op elementair magnesium.',
        },
        {
          week: 2,
          title: 'Routine',
          body: 'Makkelijk vol te houden naast training. Geen “wow”-effect, wel rustiger inslapen dan zonder.',
        },
        {
          week: 4,
          title: 'Halverwege',
          body: 'Prijs per dosis vergeleken met Vitals in de feed: Mattisson blijft scherper per effectieve dosis.',
        },
        {
          week: 6,
          title: 'Voorraadcheck',
          body: 'Eén merchant tijdelijk uitverkocht , andere shop in de feed nog leverbaar. Typisch voor deze pick.',
        },
        {
          week: 8,
          title: 'Afronding',
          body: 'Blijf ik slikken? Ja. Zou ik opnieuw topkeuze noemen in de gids? Ja , met de voorraad-disclaimer erbij.',
        },
      ],
      relatedComparison: {
        title: 'De beste magnesiumbisglycinaat van 2026',
        href: '/supplementen/beste-magnesium-bisglycinaat/',
      },
    },
    faq: [
      {
        question: 'Is dit hetzelfde als de magnesium-vergelijking?',
        answer:
          'Nee. De vergelijking rankt meerdere merken. Deze pagina is alleen Mattisson , dieper, met weekjournal en scores.',
      },
      {
        question: 'Is dit medisch getest door ons?',
        answer: 'Nee , dit is een redactionele, praktijkgerichte review, geen klinische studie.',
      },
      {
        question: 'Waarom Mattisson en niet Vitakruid?',
        answer:
          'In onze feed scoorde Mattisson beter op prijs per effectieve dosis bij vergelijkbare etikethelderheid. Vitakruid blijft een solide merkkeuze in de gids.',
      },
    ],
    body: [
      {
        _type: 'block',
        _key: 'hr-h2-etiket',
        style: 'h2',
        children: [{ _type: 'span', _key: 's1', text: 'Etiket en dosering', marks: [] }],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'hr-p-etiket',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's2',
            marks: [],
            text: 'Bisglycinaat verdient een etiket waarop je elementair magnesium kunt terugrekenen. Mattisson is daar helder genoeg voor: je ziet wat je slikt, zonder proprietary blend-ruis. Voor avondgebruik hield ik 1–2 capsules aan, zoals op de pot.',
          },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'hr-h2-praktijk',
        style: 'h2',
        children: [{ _type: 'span', _key: 's3', text: 'In de praktijk', marks: [] }],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'hr-p-praktijk',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's4',
            marks: [],
            text: 'Acht weken is kort voor “bewijs”, lang genoeg om te voelen of een routine blijft hangen. Geen maaggedoe, geen afhakers door smaak of formaat. Het product voelt als een werkpaard , precies wat je wilt van een topkeuze die je vaker koopt.',
          },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'hr-h2-prijs',
        style: 'h2',
        children: [{ _type: 'span', _key: 's5', text: 'Prijs en verkrijgbaarheid', marks: [] }],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'hr-p-prijs',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's6',
            marks: [],
            text: 'We kijken naar prijs per effectieve dosis via de affiliate-feed, niet naar de mooiste sticker. Mattisson scoort daar stevig , mits de shop op voorraad is. Wisselende stock is de trade-off die je meeneemt als je dit product kiest.',
          },
        ],
        markDefs: [],
      },
    ] as Post['body'],
  },
  {
    _id: 'fixture-art-magnesium-dosis',
    title: 'Hoeveel magnesium per dag heb je nodig?',
    slug: { current: 'hoeveel-magnesium-per-dag' },
    template: 'standard',
    publishedAt: '2026-04-19T10:00:00.000Z',
    updatedAt: '2026-04-19T10:00:00.000Z',
    excerpt: 'Dosering per situatie, elementair magnesium, en wanneer je beter naar de huisarts gaat.',
    category: cat('supplementen'),
    author: fixtureAuthor,
    topicGroup: 'Magnesium',
    coverImageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/37.png?v=1685112596',
    relatedCalculator: {
      title: 'Magnesium-check (rekentool)',
      href: '/voeding/calculators/magnesium/',
    },
    keyTakeaways: [
      'Volwassenen zitten vaak rond 300–350 mg elementair per dag via voeding + supplement.',
      'Oxide op het etiket ≠ dezelfde opname als bisglycinaat.',
    ],
    faq: [
      {
        question: 'Kan ik te veel magnesium slikken?',
        answer: 'Ja , vooral losse hoge doses oxide kunnen laxerend werken. Blijf bij aanbevolen doseringen.',
      },
    ],
    body: [
      {
        _type: 'block',
        _key: 'h2a',
        style: 'h2',
        children: [{ _type: 'span', _key: 's1', text: 'Waarom dosering lastig is', marks: [] }],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'p1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's2',
            marks: [],
            text: 'Etiketten noemen vaak het gewicht van de verbinding, niet het elementaire magnesium. Bisglycinaat en oxide zijn daardoor niet 1:1 te vergelijken.',
          },
        ],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'h2b',
        style: 'h2',
        children: [{ _type: 'span', _key: 's3', text: 'Praktische richtlijn', marks: [] }],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'p2',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 's4',
            marks: [],
            text: 'Gebruik onze magnesium-rekentool voor een snelle schatting, en lees de vergelijkingsgids als je een product kiest.',
          },
        ],
        markDefs: [],
      },
    ] as Post['body'],
  },
  {
    _id: 'fixture-art-elektrolyten',
    title: 'Beste elektrolyten poeder , waar let je op?',
    slug: { current: 'beste-elektrolyten-poeder' },
    template: 'comparison',
    publishedAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-08-12T10:00:00.000Z',
    excerpt:
      'Natrium, kalium, magnesium , en wanneer een poeder zinvol is na training of hitte. Hieronder: wat we aanraden en wat we lieten vallen.',
    category: cat('gezondheid'),
    author: fixtureAuthor,
    topicGroup: 'Elektrolyten',
    coverImageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/NanoMagnesium.png?v=1712758748',
    quickAnswer: 'Kies op natrium/kalium-verhouding en suiker , niet op marketing.',
    keyTakeaways: [
      'Voor de meeste rustige dagen is water + voeding genoeg.',
      'Bij lange training of hitte telt natrium het hardst.',
      'Suiker is optioneel , niet verplicht voor opname.',
    ],
    trustNarrative:
      'We filterden gangbare NL-poeders op etikethelderheid (natrium/kalium per scoop), zoetstoffen en prijs per training. Geen labpanel , wel inspecteerbare keuzes.',
    whoForProse:
      'Voor wie langer traint of in de hitte zweet. Niet voor wie alleen op smaak of neon-marketing afgaat.',
    comparisonDisclosure:
      'The Health Issue kan een commissie ontvangen via affiliate-links. Dat beïnvloedt onze redactionele keuzes niet.',
    comparisonSpecColumns: [
      { key: 'natrium', label: 'Natrium' },
      { key: 'kalium', label: 'Kalium' },
      { key: 'suiker', label: 'Suiker' },
      { key: 'prijsPortie', label: 'Prijs/portie' },
      { key: 'verkrijgbaar', label: 'Verkrijgbaar' },
    ],
    alsoConsidered: [
      {
        name: 'Suikerrijke “sport” sachets zonder kalium',
        blurb: 'Veel calorieën, weinig elektrolytenbalans. Vallen af voor deze gids.',
      },
      {
        name: 'Tabletten zonder dosering per scoop',
        blurb: 'Onduidelijk etiket , moeilijk eerlijk vergelijken.',
      },
    ],
    comparisonProducts: [
      {
        name: 'Elektrolyten Focus Training',
        badge: 'winner',
        tagline: 'Beste overall voor training',
        rating: 4.6,
        price: '€24,00',
        shop: 'Superfoodstore',
        affiliateUrl: 'https://example.com/elektrolyt-a',
        imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/NanoMagnesium.png?v=1712758748',
        pros: ['Heldere dosering', 'Weinig zoetstof', 'Goede Na/K-balans'],
        cons: ['Duurder per portie'],
        verdict:
          'Onze topkeuze voor lange sessies: helder etiket en weinig zoetstof , al betaal je iets meer per scoop.',
        specs: [
          { key: 'natrium', label: 'Natrium', value: '~500 mg' },
          { key: 'kalium', label: 'Kalium', value: '~200 mg' },
          { key: 'suiker', label: 'Suiker', value: 'Laag' },
          { key: 'prijsPortie', label: 'Prijs/portie', value: '~€0,80' },
          { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Superfoodstore' },
        ],
      },
      {
        name: 'Elektrolyten Budget Mix',
        badge: 'runner-up',
        tagline: 'Beste budget',
        rating: 4.2,
        price: '€16,00',
        shop: 'Myprotein',
        affiliateUrl: 'https://example.com/elektrolyt-b',
        imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/37.png?v=1685112596',
        pros: ['Lagere prijs', 'Grote pot'],
        cons: ['Meer smaakstoffen'],
        verdict:
          'Prima instapper als je budget telt , meer smaakstoffen is de trade-off.',
        specs: [
          { key: 'natrium', label: 'Natrium', value: '~400 mg' },
          { key: 'kalium', label: 'Kalium', value: '~150 mg' },
          { key: 'suiker', label: 'Suiker', value: 'Gemiddeld' },
          { key: 'prijsPortie', label: 'Prijs/portie', value: '~€0,45' },
          { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Myprotein' },
        ],
      },
    ],
    faq: [
      {
        question: 'Heb ik elke dag elektrolytenpoeder nodig?',
        answer: 'Nee. Voor rustige dagen volstaat water + voeding meestal.',
      },
    ],
    body: [],
  },
  {
    _id: 'fixture-art-eiwit',
    title: 'Hoeveel eiwit per dag heb je nodig?',
    slug: { current: 'hoeveel-eiwit-per-dag' },
    template: 'standard',
    publishedAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    excerpt: 'Van sedentair tot forceer-fase , praktische ranges en een rekentool.',
    category: cat('voeding'),
    author: fixtureAuthor,
    topicGroup: 'Eiwit',
    coverImageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/38.png?v=1685112638',
    relatedCalculator: {
      title: 'Eiwitrekenmachine',
      href: '/voeding/calculators/eiwit/',
    },
    keyTakeaways: [
      '0,8 g/kg is een minimum, geen optimum voor spierbehoud.',
      'Voor krachttraining landen veel mensen rond 1,6–2,2 g/kg.',
    ],
    body: [
      {
        _type: 'block',
        _key: 'h2e',
        style: 'h2',
        children: [{ _type: 'span', _key: 'e1', text: 'Snelle schatting', marks: [] }],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'pe',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'e2',
            marks: [],
            text: 'Gebruik de eiwitrekenmachine op deze site voor jouw gewicht en doel. Dit vervangt geen dieetadvies.',
          },
        ],
        markDefs: [],
      },
    ] as Post['body'],
    faq: [],
  },
  {
    _id: 'fixture-art-herstel',
    title: 'Herstel na krachttraining: wat werkt echt?',
    slug: { current: 'herstel-na-krachttraining' },
    template: 'standard',
    publishedAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
    excerpt: 'Slaap, eiwit, volume , en wat je kunt laten liggen.',
    category: cat('training'),
    author: fixtureAuthor,
    topicGroup: 'Herstel',
    coverImageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/37.png?v=1685112596',
    keyTakeaways: [
      'Slaap verslaat de meeste supplementen.',
      'Progressive overload + genoeg eiwit dekken 80% van herstel.',
    ],
    body: [],
    faq: [],
  },
  {
    _id: 'fixture-art-ashwagandha',
    title: 'Beste ashwagandha , waar let je op?',
    slug: { current: 'beste-ashwagandha' },
    template: 'comparison',
    publishedAt: '2026-06-15T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    excerpt:
      'KSM-66, Sensoril, dosering en wanneer ashwagandha überhaupt zinvol is , zonder hype.',
    category: cat('supplementen'),
    author: fixtureAuthor,
    topicGroup: 'Ashwagandha',
    coverImageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/38.png?v=1685112638',
    quickAnswer: 'Kies op gestandaardiseerd extract en dosering , niet op “stress weg”-claims.',
    keyTakeaways: [
      'Gestandaardiseerd extract > anonieme poederblend.',
      'Niet voor iedereen: bij twijfel arts.',
    ],
    comparisonDisclosure:
      'The Health Issue kan een commissie ontvangen via affiliate-links. Dat beïnvloedt onze redactionele keuzes niet.',
    comparisonSpecColumns: [
      { key: 'extract', label: 'Extract' },
      { key: 'dosering', label: 'Dosering' },
      { key: 'prijsDosis', label: 'Prijs/dosis' },
      { key: 'verkrijgbaar', label: 'Verkrijgbaar' },
    ],
    alsoConsidered: [
      {
        name: 'Anonieme “root powder” blends',
        blurb: 'Geen gestandaardiseerd extract , moeilijk te doseren of vergelijken.',
      },
    ],
    comparisonProducts: [
      {
        name: 'Ashwagandha KSM-66 capsule',
        badge: 'winner',
        tagline: 'Beste overall',
        rating: 4.7,
        price: '€22,95',
        shop: 'Superfoodstore',
        affiliateUrl: 'https://example.com/ashwa-a',
        imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/38.png?v=1685112638',
        pros: ['Gestandaardiseerd', 'Heldere dosering'],
        cons: ['Duurder dan huismerk'],
        verdict: 'Topkeuze als je een bekend extract wilt met een leesbaar etiket.',
        specs: [
          { key: 'extract', label: 'Extract', value: 'KSM-66' },
          { key: 'dosering', label: 'Dosering', value: '300 mg' },
          { key: 'prijsDosis', label: 'Prijs/dosis', value: '~€0,35' },
          { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'Superfoodstore' },
        ],
      },
      {
        name: 'Ashwagandha budget extract',
        badge: 'budget',
        tagline: 'Beste budget',
        rating: 4.1,
        price: '€14,95',
        shop: 'Voorbeeld',
        affiliateUrl: 'https://example.com/ashwa-b',
        imageUrl: 'https://cdn.shopify.com/s/files/1/1864/5043/files/37.png?v=1685112596',
        pros: ['Scherp geprijsd'],
        cons: ['Minder bekende standaard'],
        verdict: 'Budgetoptie als je toch wilt starten , check het etiket op extractpercentage.',
        specs: [
          { key: 'extract', label: 'Extract', value: 'Gestandaardiseerd' },
          { key: 'dosering', label: 'Dosering', value: '250–500 mg' },
          { key: 'prijsDosis', label: 'Prijs/dosis', value: '~€0,22' },
          { key: 'verkrijgbaar', label: 'Verkrijgbaar', value: 'NL-webshop' },
        ],
      },
    ],
    faq: [],
    body: [],
  },
];
