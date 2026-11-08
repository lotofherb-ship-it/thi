/**
 * Build-time product offer fixtures.
 * Used when Awin/Daisycon keys are missing — keeps product cards renderable.
 * Replace / extend via resolveProductOffers() once live feeds are wired.
 */

export interface FixtureOffer {
  /** Match against ComparisonProduct.name (case-insensitive substring) or tursoProductId */
  matchName?: string;
  tursoProductId?: number;
  merchant: string;
  price: string;
  url: string;
  currency?: string;
}

export const PRODUCT_OFFER_FIXTURES: FixtureOffer[] = [
  {
    matchName: 'magnesium',
    merchant: 'Bol.com',
    price: '€24,95',
    url: 'https://example.com/fixture/magnesium-bol',
  },
  {
    matchName: 'magnesium',
    merchant: 'Holland & Barrett',
    price: '€22,49',
    url: 'https://example.com/fixture/magnesium-hb',
  },
  {
    matchName: 'ashwagandha',
    merchant: 'Bol.com',
    price: '€29,95',
    url: 'https://example.com/fixture/ashwagandha-bol',
  },
  {
    matchName: 'creatine',
    merchant: 'Body & Fit',
    price: '€19,99',
    url: 'https://example.com/fixture/creatine-bf',
  },
  {
    matchName: 'elektrolyt',
    merchant: 'Bol.com',
    price: '€18,95',
    url: 'https://example.com/fixture/elektrolyt-bol',
  },
];
