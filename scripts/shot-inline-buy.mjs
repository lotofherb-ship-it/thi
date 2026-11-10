/**
 * Local after-shots for THI-31 money-page UI.
 * Usage: node scripts/shot-inline-buy.mjs
 * Requires: preview on 127.0.0.1:4321 + Chrome.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(
  __dirname,
  '../../../../Library/Application Support/Cursor/AgentStores/cursor_agent_stores/bc-c7db13d0-c9ff-423d-833d-ad5d19eafc34/files/media',
);
mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:4321';

const shots = [
  {
    file: 'inline-product-block-after.png',
    url: `${BASE}/supplementen/plnkt-review/`,
    wait: '.inline-buy',
    clipSel: '.inline-buy',
    full: false,
  },
  {
    file: 'koopoptie-row-after.png',
    url: `${BASE}/supplementen/vitakruid-ashwagandha-ksm66-review/`,
    wait: '.guide-atf-cue',
    clipSel: '.guide-atf-cue',
  },
  {
    file: 'product-image-after.png',
    url: `${BASE}/supplementen/vitakruid-ashwagandha-ksm66-review/`,
    wait: '.pick-media img',
    clipSel: '.pick.pick-callout, .pick#beoordeling .pick-callout, #beoordeling .pick-callout',
  },
  {
    file: 'author-byline-after.png',
    url: `${BASE}/supplementen/vitakruid-ashwagandha-ksm66-review/`,
    wait: '.guide-byline img',
    clipSel: '.guide-byline',
  },
  {
    file: 'author-box-after.png',
    url: `${BASE}/supplementen/vitakruid-ashwagandha-ksm66-review/`,
    wait: '.author-box',
    clipSel: 'aside.author-box:not(.author-box--compact)',
  },
  {
    file: 'toc-overflow-after.png',
    url: `${BASE}/training/beste-roeitrainer-met-waterweerstand-2026-onze-top-5-vergeleken/`,
    wait: '.guide-tocbar',
    clipSel: '.guide-tocbar',
  },
  {
    file: 'eyebrow-removed-after.png',
    url: `${BASE}/supplementen/vitakruid-ashwagandha-ksm66-review/`,
    wait: 'h1.guide-h1',
    // crumb + h1 + byline — prove no SUPPLEMENTEN eyebrow
    y: 0,
    height: 420,
  },
];

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });

for (const s of shots) {
  await page.goto(s.url, { waitUntil: 'networkidle' });
  if (s.wait) await page.waitForSelector(s.wait, { timeout: 15000 });
  const out = resolve(OUT, s.file);

  if (s.clipSel) {
    const loc = page.locator(s.clipSel).first();
    await loc.scrollIntoViewIfNeeded();
    await loc.screenshot({ path: out });
  } else if (s.height) {
    await page.screenshot({
      path: out,
      clip: { x: 0, y: s.y || 0, width: 1100, height: s.height },
    });
  } else {
    await page.screenshot({ path: out, fullPage: !!s.full });
  }
  console.log('wrote', out);
}

await browser.close();
