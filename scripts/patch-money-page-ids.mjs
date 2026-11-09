#!/usr/bin/env node
/**
 * Patch Sanity money-page pointers: tursoProductId (Awin/Daisycon) or affiliateUrl.
 * Priority: Awin → Daisycon → Bol partner last. No TradeTracker preference. No Catalog API.
 *
 * Usage (from thi-astro/):
 *   node scripts/patch-money-page-ids.mjs --dry-run
 *   node scripts/patch-money-page-ids.mjs
 */
import { createClient } from '@sanity/client';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2];
  }
}

const DRY = process.argv.includes('--dry-run');

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

function bolSearchPartner(searchtext, name) {
  // + for spaces → single-encoded TXL param (same style as existing Bol partner links)
  const q = searchtext.trim().replace(/\s+/g, '+');
  const dest = `https://www.bol.com/nl/nl/s/?searchtext=${q}`;
  return (
    `https://partner.bol.com/click/click?p=2&t=url&s=1121688&f=TXL&url=${encodeURIComponent(dest)}` +
    `&name=${encodeURIComponent(name)}`
  );
}

/** @type {{docId: string, patches: object[]}[]} */
const jobs = [
  // Honest reviews
  {
    docId: 'wp-15414',
    note: 'Vitakruid Ashwagandha KSM-66 review → Awin Superfoodstore',
    set: {
      'honestReview.productName': 'Vitakruid Ashwagandha KSM-66 & Bioperine',
      'honestReview.tursoProductId': 27508,
      'honestReview.shop': 'Superfoodstore',
      'honestReview.affiliateUrl':
        'https://ds1.nl/c/?si=5676&li=1266442&wi=419928&dl=product%2Fvitakruid-ashwagandha-ksm-66-bioperine-vegicaps-1306118',
    },
  },
  {
    docId: 'wp-7725',
    note: 'PLNKTN review → official affiliate shortlink',
    set: {
      'honestReview.productName': 'PLNKTN. Marine Fytoplankton',
      'honestReview.affiliateUrl': 'https://tidd.ly/42jGd44',
      'honestReview.shop': 'PLNKTN',
    },
  },
  {
    docId: 'wp-10472',
    note: 'Inkoherb review → Lot of Herb PDP (own shop; not in Awin/Daisycon)',
    set: {
      'honestReview.productName': 'Inkoherb',
      'honestReview.affiliateUrl': 'https://lotofherb.nl/products/inkoherb',
      'honestReview.shop': 'Lot of Herb',
    },
  },

  // Concept2 → Daisycon Fitwinkel (exact RowErg)
  {
    docId: 'wp-4088',
    note: 'Concept2 RowErg → Daisycon Fitwinkel id 53678',
    set: {
      'comparisonProducts[_key=="swhsws8b"].tursoProductId': 53678,
      'comparisonProducts[_key=="swhsws8b"].shop': 'Fitwinkel',
      'comparisonProducts[_key=="swhsws8b"].affiliateUrl': null,
    },
  },

  // Ashwagandha comparison → Awin IDs (fixes Bol-shop + non-partner URL reject)
  {
    docId: 'wp-15319',
    note: 'beste-ashwagandha-kopen Awin IDs',
    set: {
      'comparisonProducts[_key=="kvb89mlw"].tursoProductId': 27508,
      'comparisonProducts[_key=="kvb89mlw"].shop': 'Superfoodstore',
      'comparisonProducts[_key=="5x6tpebv"].tursoProductId': 7,
      'comparisonProducts[_key=="5x6tpebv"].shop': 'Myprotein',
      'comparisonProducts[_key=="7et03t41"].tursoProductId': 7202,
      'comparisonProducts[_key=="7et03t41"].shop': 'Superfoodstore',
      'comparisonProducts[_key=="t8kpcbry"].tursoProductId': 41441,
      'comparisonProducts[_key=="t8kpcbry"].shop': 'Superfoodstore',
      'comparisonProducts[_key=="z3bdmkth"].shop': 'WeightWorld',
      // WeightWorld: keep existing affiliateUrl (manual); no Awin/Daisycon hit
    },
  },

  // Yogamat Bol-only picks → partner.bol.com TXL search (no Catalog API; not in Awin/Daisycon)
  {
    docId: 'wp-5176',
    note: 'beste-yogamat Bol partner search wraps for missing picks',
    set: {
      'comparisonProducts[_key=="6jtqz40h"].affiliateUrl': bolSearchPartner(
        'liforme yoga mat',
        'Liforme Yoga Mat',
      ),
      'comparisonProducts[_key=="6jtqz40h"].shop': 'Bol.com',
      'comparisonProducts[_key=="pcoo840h"].affiliateUrl': bolSearchPartner(
        'FLXBL yoga mat',
        'FLXBL Yoga Mat',
      ),
      'comparisonProducts[_key=="pcoo840h"].shop': 'Bol.com',
      'comparisonProducts[_key=="ygpsh760"].affiliateUrl': bolSearchPartner(
        'YoZenga yogamat kurk',
        'YoZenga Premium (kurk)',
      ),
      'comparisonProducts[_key=="ygpsh760"].shop': 'Bol.com',
      'comparisonProducts[_key=="9ts1qdjw"].affiliateUrl': bolSearchPartner(
        'Tunturi TPE yogamat',
        'Tunturi TPE',
      ),
      'comparisonProducts[_key=="9ts1qdjw"].shop': 'Bol.com',
      'comparisonProducts[_key=="047faamq"].affiliateUrl': bolSearchPartner(
        'Rockerz Deluxe yogamat',
        'Rockerz Deluxe',
      ),
      'comparisonProducts[_key=="047faamq"].shop': 'Bol.com',
      'comparisonProducts[_key=="kedmmlna"].affiliateUrl': bolSearchPartner(
        'Navaris opvouwbare yogamat',
        'Navaris opvouwbaar',
      ),
      'comparisonProducts[_key=="kedmmlna"].shop': 'Bol.com',
      'comparisonProducts[_key=="u58gz3sy"].affiliateUrl': bolSearchPartner(
        'yogamat 15mm dik',
        'Extra dikke mat (8–15 mm)',
      ),
      'comparisonProducts[_key=="u58gz3sy"].shop': 'Bol.com',
    },
  },
];

console.log(DRY ? 'DRY RUN' : 'APPLYING', jobs.length, 'docs');

for (const job of jobs) {
  console.log(`\n→ ${job.docId}: ${job.note}`);
  const unset = Object.entries(job.set)
    .filter(([, v]) => v === null)
    .map(([k]) => k);
  const set = Object.fromEntries(Object.entries(job.set).filter(([, v]) => v !== null));
  console.log('  set', set);
  if (unset.length) console.log('  unset', unset);
  if (DRY) continue;
  let tx = client.patch(job.docId).set(set);
  if (unset.length) tx = tx.unset(unset);
  const res = await tx.commit({ autoGenerateArrayKeys: false });
  console.log('  ok', res._id, res._rev);
}

console.log('\nDone.');
