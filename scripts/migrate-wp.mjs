/**
 * WordPress → Sanity migration (The Health Issue)
 *
 * SAFE: writes Sanity only — never mutates WordPress / SiteGround.
 *
 * Default source: local export `../export/wp-2026-10-07/` (SG still live for media URLs).
 * Optional: `--live` fetches posts from WP REST.
 *
 *   node scripts/migrate-wp.mjs --dry-run
 *   node scripts/migrate-wp.mjs --import
 *   node scripts/migrate-wp.mjs --import --post beste-magnesium-bisglycinaat
 *   node scripts/migrate-wp.mjs --import --body-images
 *   node scripts/migrate-wp.mjs --import --limit 10
 *   node scripts/migrate-wp.mjs --import --skip-existing   # resume without wiping
 *   node scripts/migrate-wp.mjs --pages-only
 */

import { createClient } from '@sanity/client';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASTRO_ROOT = join(__dirname, '..');
const THI_ROOT = join(ASTRO_ROOT, '..');
const EXPORT_DIR = join(THI_ROOT, 'export', 'wp-2026-10-07');

function loadEnv() {
  const envPath = join(ASTRO_ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 0) continue;
    const key = trimmed.slice(0, i);
    const val = trimmed.slice(i + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const WP_BASE = 'https://thehealthissue.nl/wp-json/wp/v2';
const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 'e6out5at';
const DATASET = process.env.PUBLIC_SANITY_DATASET || 'production';
const WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--import');
const USE_LIVE = process.argv.includes('--live');
const BODY_IMAGES = process.argv.includes('--body-images');
const PAGES_ONLY = process.argv.includes('--pages-only');
const SKIP_EXISTING = process.argv.includes('--skip-existing');
const ONE_POST = (() => {
  const idx = process.argv.indexOf('--post');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();
const LIMIT = (() => {
  const idx = process.argv.indexOf('--limit');
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : null;
})();

const sanity = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: WRITE_TOKEN,
  useCdn: false,
});

const AUTHOR_ID = 'author-jouke-de-jong';

function log(msg) {
  process.stdout.write(msg + '\n');
}
function warn(msg) {
  process.stderr.write('⚠  ' + msg + '\n');
}

function generateKey() {
  return Math.random().toString(36).slice(2, 10);
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8243;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

/** Strip broken WP shortcodes; keep real HTML anchors (incl. partner.bol.com). */
function stripShortcodes(html) {
  let out = html || '';
  // Self-closing / paired content-egg + affiliate widgets
  out = out.replace(/\[affiliate[^\]]*\]/gi, '');
  out = out.replace(/\[\/?content-egg[^\]]*\]/gi, '');
  out = out.replace(/\[content-egg-block[^\]]*\][\s\S]*?\[\/content-egg-block\]/gi, '');
  out = out.replace(/\[content-egg[^\]]*\][\s\S]*?\[\/content-egg\]/gi, '');
  // Orphan closing tags
  out = out.replace(/\[\/[a-z0-9_-]+\]/gi, '');
  return out;
}

function stripTags(html) {
  return decodeEntities(String(html || '').replace(/<[^>]+>/g, '')).trim();
}

function normalizeUrl(url) {
  if (!url) return undefined;
  const u = decodeEntities(url).trim();
  if (!/^https?:\/\//i.test(u)) return undefined;
  return u;
}

async function wpFetch(path) {
  const res = await fetch(`${WP_BASE}${path}`);
  if (!res.ok) throw new Error(`WP API ${path}: ${res.status}`);
  return res.json();
}

function loadExportJson(name) {
  const p = join(EXPORT_DIR, name);
  if (!existsSync(p)) throw new Error(`Missing export ${p}`);
  return JSON.parse(readFileSync(p, 'utf-8'));
}

async function loadPostsAndCategories() {
  if (USE_LIVE) {
    log('📥 Live WP REST…');
    const headers = new Headers();
    const res = await fetch(`${WP_BASE}/posts?per_page=1`, { headers });
    const total = parseInt(res.headers.get('x-wp-total') || '0', 10);
    const pages = Math.ceil(total / 100);
    const posts = [];
    for (let page = 1; page <= pages; page++) {
      log(`  posts page ${page}/${pages}`);
      posts.push(...(await wpFetch(`/posts?per_page=100&page=${page}&_embed=1`)));
    }
    const cats = await wpFetch('/categories?per_page=100');
    return { posts, cats, source: 'live' };
  }

  log(`📥 Local export ${EXPORT_DIR}`);
  let posts = loadExportJson('posts.json');
  const cats = loadExportJson('categories.json');
  if (ONE_POST) posts = posts.filter(p => p.slug === ONE_POST);
  return { posts, cats, source: 'export' };
}

// ─── HTML → Portable Text ───────────────────────────────────────────────────
function htmlToBlocks(html) {
  if (!html) return [];
  let cleaned = stripShortcodes(html)
    .replace(/<!--\s*\/?wp:[^>]*?-->/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const blocks = [];
  const blockRegex = /<(p|h[2-4]|blockquote|ul|ol|figure|table)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = blockRegex.exec(cleaned)) !== null) {
    const tag = match[1].toLowerCase();
    const inner = match[2];
    switch (tag) {
      case 'p': {
        const b = parseTextBlock(inner, 'normal');
        if (b) blocks.push(b);
        break;
      }
      case 'h2':
      case 'h3':
      case 'h4': {
        const b = parseTextBlock(inner, tag);
        if (b) blocks.push(b);
        break;
      }
      case 'blockquote': {
        const text = inner.replace(/<p[^>]*>([\s\S]*?)<\/p>/i, '$1');
        const b = parseTextBlock(text, 'blockquote');
        if (b) blocks.push(b);
        break;
      }
      case 'ul':
        blocks.push(...extractListItems(inner, 'bullet'));
        break;
      case 'ol':
        blocks.push(...extractListItems(inner, 'number'));
        break;
      case 'figure': {
        const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        const captionMatch = inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
        if (imgMatch) {
          blocks.push({
            _type: '_externalImage',
            _key: generateKey(),
            url: decodeEntities(imgMatch[1]),
            caption: captionMatch ? stripTags(captionMatch[1]) : '',
          });
        }
        break;
      }
      case 'table': {
        const tableBlock = parseHtmlTable(inner);
        if (tableBlock) blocks.push(tableBlock);
        break;
      }
    }
  }

  if (blocks.length === 0 && cleaned.length > 0) {
    const plainText = stripTags(cleaned);
    if (plainText) {
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: generateKey(), text: plainText, marks: [] }],
      });
    }
  }
  return blocks;
}

function parseTextBlock(html, style) {
  const { children, markDefs } = parseInlineContent(html);
  if (!children.length) return null;
  return { _type: 'block', _key: generateKey(), style, markDefs, children };
}

function extractListItems(html, listItem) {
  const items = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = liRegex.exec(html)) !== null) {
    const { children, markDefs } = parseInlineContent(match[1]);
    if (children.length) {
      items.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        listItem,
        level: 1,
        markDefs,
        children,
      });
    }
  }
  return items;
}

function parseInlineContent(html) {
  const markDefs = [];
  const children = [];
  const text = decodeEntities(html);
  const tokenRegex = /<(\/?)(\w+)([^>]*)>|([^<]+)/g;
  const activeMarks = [];
  let match;
  while ((match = tokenRegex.exec(text)) !== null) {
    const [, closing, tag, attrs, plainText] = match;
    if (plainText !== undefined) {
      if (plainText) {
        children.push({
          _type: 'span',
          _key: generateKey(),
          text: plainText,
          marks: [...activeMarks],
        });
      }
    } else {
      const tagLower = tag.toLowerCase();
      if (closing) {
        if (['strong', 'b', 'em', 'i', 'code'].includes(tagLower)) {
          const mark = tagLower === 'b' ? 'strong' : tagLower === 'i' ? 'em' : tagLower;
          const idx = activeMarks.lastIndexOf(mark);
          if (idx !== -1) activeMarks.splice(idx, 1);
        } else if (tagLower === 'a') {
          const idx = activeMarks.findLastIndex(m => m.startsWith('link-'));
          if (idx !== -1) activeMarks.splice(idx, 1);
        }
      } else if (tagLower === 'strong' || tagLower === 'b') {
        activeMarks.push('strong');
      } else if (tagLower === 'em' || tagLower === 'i') {
        activeMarks.push('em');
      } else if (tagLower === 'code') {
        activeMarks.push('code');
      } else if (tagLower === 'a') {
        const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
        if (hrefMatch) {
          const href = normalizeUrl(hrefMatch[1]);
          if (href) {
            const key = `link-${generateKey()}`;
            // Keep Bol / Daisycon / Awin / merchant deep links as-is
            markDefs.push({ _key: key, _type: 'link', href });
            activeMarks.push(key);
          }
        }
      } else if (tagLower === 'br') {
        children.push({
          _type: 'span',
          _key: generateKey(),
          text: '\n',
          marks: [...activeMarks],
        });
      }
    }
  }
  return { children, markDefs };
}

function parseHtmlTable(inner) {
  const rows = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trRegex.exec(inner)) !== null) {
    const cells = [];
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(trMatch[1])) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }
    if (cells.length) rows.push({ cells });
  }
  if (!rows.length) return null;
  return { _type: 'table', _key: generateKey(), rows };
}

let _uploadCount = 0;
async function uploadImageUrl(imageUrl, altText = '') {
  if (!imageUrl) return null;
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      warn(`  image HTTP ${res.status}: ${imageUrl}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
    const mimeType = imageUrl.match(/\.png$/i)
      ? 'image/png'
      : imageUrl.match(/\.gif$/i)
        ? 'image/gif'
        : imageUrl.match(/\.webp$/i)
          ? 'image/webp'
          : imageUrl.match(/\.avif$/i)
            ? 'image/avif'
            : 'image/jpeg';

    const asset = await sanity.assets.upload('image', buffer, {
      filename,
      contentType: mimeType,
    });
    _uploadCount++;
    await new Promise(r => setTimeout(r, _uploadCount % 10 === 0 ? 1500 : 120));
    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: altText || '',
    };
  } catch (err) {
    warn(`  Could not upload ${imageUrl}: ${err.message}`);
    return null;
  }
}

function detectTemplate(wpPost) {
  const wpTemplate = wpPost.template || '';
  if (wpTemplate === 'comparison.php') return 'comparison';
  if (wpTemplate === 'honest-review.php') return 'honest-review';
  return 'standard';
}

function getCategoryRef(wpPost, catsById) {
  const ids = wpPost.categories || [];
  const cats = ids.map(id => catsById[id]).filter(Boolean);
  // Prefer first non-uncategorized when multiple; keep uncategorized when that's the only/real primary
  const primary =
    cats.find(c => c.slug !== 'uncategorized') ||
    cats[0] ||
    null;
  if (!primary) {
    return { _type: 'reference', _ref: 'category-uncategorized' };
  }
  return { _type: 'reference', _ref: `category-${primary.slug}` };
}

function mapProducts(products) {
  if (!Array.isArray(products) || !products.length) return undefined;
  return products.map(p => {
    // Prefer specialty affiliate (Daisycon/Awin); Bol partner link as fallback
    const primary =
      normalizeUrl(p.product_link) ||
      normalizeUrl(p.product_link2) ||
      undefined;
    const bol = normalizeUrl(p.product_link2);
    const row = {
      _key: generateKey(),
      name: p.product_name || '',
      badge: ['winner', 'runner-up', 'budget'].includes(p.product_badge)
        ? p.product_badge
        : undefined,
      tagline: p.product_tagline || undefined,
      rating: parseFloat(p.product_rating) || 0,
      price: p.product_price || undefined,
      priceNote: p.product_price_per || undefined,
      shop: p.product_shop || undefined,
      affiliateUrl: primary,
      _externalImageUrl: p.product_image || undefined,
      pros: Array.isArray(p.product_pros)
        ? p.product_pros.map(x => x.pro_text || x.text || String(x)).filter(Boolean)
        : undefined,
      cons: Array.isArray(p.product_cons)
        ? p.product_cons.map(x => x.con_text || x.text || String(x)).filter(Boolean)
        : undefined,
      verdict: p.product_verdict || undefined,
    };
    // tursoProductId left empty — wire Awin/Daisycon ids in a later pass
    if (bol && bol !== primary && bol.includes('partner.bol.com')) {
      // Keep Bol available as secondary URL in verdict note? Schema has no extraOffers in Sanity.
      // Primary already prefers specialty; Bol remains in WP body HTML links.
    }
    return row;
  });
}

function mapHonestReview(wpPost, products) {
  if (detectTemplate(wpPost) !== 'honest-review') return undefined;
  const first = Array.isArray(products) && products[0] ? products[0] : null;
  const affiliateUrl =
    normalizeUrl(first?.product_link) ||
    normalizeUrl(first?.product_link2) ||
    undefined;
  return {
    productName: stripTags(wpPost.title?.rendered || ''),
    affiliateUrl,
    shop: first?.product_shop || (affiliateUrl?.includes('partner.bol.com') ? 'Bol.com' : undefined),
    price: first?.product_price || undefined,
    // tursoProductId later
  };
}

async function buildSanityDoc(wpPost, catsById) {
  const template = detectTemplate(wpPost);
  const catRef = getCategoryRef(wpPost, catsById);
  const meta = wpPost.meta || {};

  const blocks = htmlToBlocks(wpPost.content?.rendered || '');
  const body = [];
  for (const block of blocks) {
    if (block._type === '_externalImage') {
      if (!DRY_RUN && BODY_IMAGES) {
        const sanityImg = await uploadImageUrl(block.url, block.caption);
        if (sanityImg) {
          body.push({
            _type: 'image',
            _key: block._key,
            ...sanityImg,
            caption: block.caption || undefined,
          });
        }
      } else if (block.caption || block.url) {
        // Placeholder paragraph so media URL is not silently lost
        body.push({
          _type: 'block',
          _key: block._key,
          style: 'normal',
          markDefs: block.url
            ? [{ _key: `link-${block._key}`, _type: 'link', href: block.url }]
            : [],
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: block.caption ? `[Afbeelding: ${block.caption}]` : '[Afbeelding]',
              marks: block.url ? [`link-${block._key}`] : [],
            },
          ],
        });
      }
    } else {
      body.push(block);
    }
  }

  const ktRaw = wpPost.thi_key_takeaways || wpPost.key_takeaways;
  const keyTakeaways =
    Array.isArray(ktRaw) && ktRaw.length
      ? ktRaw.map(x => x.item || x.text || String(x)).filter(Boolean)
      : undefined;

  const faqRaw = wpPost.thi_faq || wpPost.faq;
  const faq =
    Array.isArray(faqRaw) && faqRaw.length
      ? faqRaw
          .map(x => ({
            question: x.faq_q || x.question || '',
            answer: x.faq_a || x.answer || '',
          }))
          .filter(x => x.question)
      : undefined;

  const quickAnswer =
    (typeof wpPost.thi_quick_answer === 'string' && wpPost.thi_quick_answer.trim()) ||
    (typeof wpPost.qa_text === 'string' && wpPost.qa_text.trim()) ||
    undefined;

  const expertReviewer = wpPost.thi_expert_reviewer_name
    ? {
        name: wpPost.thi_expert_reviewer_name,
        title: wpPost.thi_expert_reviewer_title || undefined,
        quote: wpPost.thi_expert_reviewer_quote || undefined,
      }
    : undefined;

  const seoTitle = (meta._seopress_titles_title || '').trim() || undefined;
  const seoDescription = (meta._seopress_titles_desc || '').trim() || undefined;
  const excerpt = stripTags(wpPost.excerpt?.rendered || '') || undefined;

  let heroImage = null;
  const featuredMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
  const heroImgUrl = featuredMedia?.source_url || null;
  if (!DRY_RUN && heroImgUrl) {
    heroImage = await uploadImageUrl(heroImgUrl, stripTags(wpPost.title?.rendered || ''));
  }

  let comparisonProducts =
    template === 'comparison' ? mapProducts(wpPost.products) : undefined;
  if (comparisonProducts && !DRY_RUN) {
    for (const prod of comparisonProducts) {
      if (prod._externalImageUrl) {
        prod.image = await uploadImageUrl(prod._externalImageUrl, prod.name);
        delete prod._externalImageUrl;
      }
    }
  } else if (comparisonProducts) {
    comparisonProducts = comparisonProducts.map(p => {
      const { _externalImageUrl, ...rest } = p;
      return rest;
    });
  }

  const honestReview = mapHonestReview(wpPost, wpPost.products);

  const doc = {
    _id: `wp-${wpPost.id}`,
    _type: 'post',
    title: stripTags(wpPost.title?.rendered || ''),
    slug: { _type: 'slug', current: wpPost.slug },
    template,
    publishedAt: wpPost.date_gmt
      ? new Date(wpPost.date_gmt + 'Z').toISOString()
      : undefined,
    updatedAt: wpPost.modified_gmt
      ? new Date(wpPost.modified_gmt + 'Z').toISOString()
      : undefined,
    excerpt,
    seoTitle,
    seoDescription,
    body: body.length ? body : undefined,
    keyTakeaways,
    quickAnswer,
    faq,
    expertReviewer,
    comparisonProducts,
    comparisonDisclosure:
      (typeof wpPost.disclosure === 'string' && wpPost.disclosure.trim()) || undefined,
    honestReview,
    category: catRef,
    author: { _type: 'reference', _ref: AUTHOR_ID },
  };
  if (heroImage) doc.heroImage = heroImage;
  return JSON.parse(JSON.stringify(doc));
}

async function ensureAuthor() {
  const doc = {
    _id: AUTHOR_ID,
    _type: 'author',
    name: 'Jouke de Jong',
    slug: { _type: 'slug', current: 'jouke-de-jong' },
    bio: 'Oprichter van The Health Issue. Schrijft over training, voeding en supplementen op basis van eigen ervaring en onderzoek.',
    credentials: 'Oprichter The Health Issue',
  };
  if (DRY_RUN) {
    log(`  [dry-run] author ${AUTHOR_ID}`);
    return;
  }
  await sanity.createOrReplace(doc);
  log(`  ✅ Author: jouke-de-jong`);
}

async function ensureCategories(wpCategories) {
  // INCLUDE uncategorized + nieuws (URL parity)
  log(`\nCategories (${wpCategories.length}):`);
  for (const cat of wpCategories) {
    const doc = {
      _id: `category-${cat.slug}`,
      _type: 'category',
      title: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description?.trim() || undefined,
      order: typeof cat.id === 'number' ? cat.id : undefined,
    };
    const cleaned = JSON.parse(JSON.stringify(doc));
    if (DRY_RUN) {
      log(`  [dry-run] category: ${cat.slug}`);
    } else {
      await sanity.createOrReplace(cleaned);
      log(`  ✅ Category: ${cat.slug}`);
    }
  }
}

/** Write missing legal/static page bodies for Astro handoff (no Sanity page type). */
function exportPagesForAstro() {
  const pages = loadExportJson('pages.json');
  const outDir = join(ASTRO_ROOT, 'migration', 'wp-pages');
  mkdirSync(outDir, { recursive: true });
  const wanted = new Set([
    'algemene-voorwaarden',
    'cookiebeleid',
    'disclaimer',
    'privacybeleid',
    'over-ons',
    'contact',
    'affiliate-disclosure',
  ]);
  let n = 0;
  for (const page of pages) {
    if (!wanted.has(page.slug)) continue;
    const html = stripShortcodes(page.content?.rendered || '');
    const meta = {
      slug: page.slug,
      title: stripTags(page.title?.rendered || ''),
      modified: page.modified_gmt,
      link: page.link,
    };
    writeFileSync(join(outDir, `${page.slug}.html`), html, 'utf-8');
    writeFileSync(join(outDir, `${page.slug}.json`), JSON.stringify(meta, null, 2), 'utf-8');
    n++;
  }
  log(`  Pages exported for Astro: ${n} → migration/wp-pages/`);
  return n;
}

async function main() {
  log('');
  log('┌─────────────────────────────────────────────────────┐');
  log('│   THI WordPress → Sanity Migration                  │');
  log('└─────────────────────────────────────────────────────┘');
  log(`  Mode: ${DRY_RUN ? 'DRY-RUN' : 'IMPORT'} | source: ${USE_LIVE ? 'live WP' : 'local export'}`);
  log(`  Body images: ${BODY_IMAGES ? 'yes' : 'no (featured + product images only)'}`);
  if (SKIP_EXISTING) log(`  Skip existing: yes (resume, no wipe)`);
  if (ONE_POST) log(`  Post filter: ${ONE_POST}`);
  if (LIMIT) log(`  Limit: ${LIMIT}`);
  log('');

  if (!DRY_RUN && !WRITE_TOKEN) {
    log('❌ SANITY_API_WRITE_TOKEN ontbreekt');
    process.exit(1);
  }

  log(`  Sanity: ${PROJECT_ID} / ${DATASET}`);
  try {
    const ping = await sanity.fetch('count(*)');
    log(`  Sanity docs now: ${ping}`);
  } catch (err) {
    warn(`Sanity ping failed: ${err.message}`);
    if (!DRY_RUN) process.exit(1);
  }

  const pagesCount = exportPagesForAstro();
  if (PAGES_ONLY) {
    log(`Done pages-only (${pagesCount}).`);
    return;
  }

  const { posts: allPosts, cats, source } = await loadPostsAndCategories();
  let posts = allPosts;

  let existingIds = new Set();
  let existingSlugs = new Set();
  let skipped = 0;
  if (SKIP_EXISTING && !DRY_RUN) {
    const existing = await sanity.fetch(
      `*[_type=="post"]{ _id, "slug": slug.current }`,
    );
    existingIds = new Set(existing.map(p => p._id));
    existingSlugs = new Set(existing.map(p => p.slug).filter(Boolean));
    log(`  Already in Sanity: ${existing.length} posts (will skip)`);
  }

  if (SKIP_EXISTING) {
    const before = posts.length;
    posts = posts.filter(p => {
      const id = `wp-${p.id}`;
      if (existingIds.has(id) || existingSlugs.has(p.slug)) {
        skipped++;
        return false;
      }
      return true;
    });
    log(`  Pending after skip: ${posts.length} (filtered ${before - posts.length})`);
  }

  if (LIMIT) posts = posts.slice(0, LIMIT);
  log(`  ${posts.length} posts to process (${source}) | ${cats.length} categories`);

  const catsById = Object.fromEntries(cats.map(c => [c.id, c]));

  await ensureAuthor();
  await ensureCategories(cats);

  log(`\nPosts (${posts.length}):`);
  let success = 0;
  let errors = 0;
  const byTemplate = { standard: 0, comparison: 0, 'honest-review': 0 };
  const byCat = {};

  for (const wpPost of posts) {
    const slug = wpPost.slug;
    const template = detectTemplate(wpPost);
    try {
      const doc = await buildSanityDoc(wpPost, catsById);
      const catSlug = doc.category?._ref?.replace(/^category-/, '') || '?';
      byTemplate[template] = (byTemplate[template] || 0) + 1;
      byCat[catSlug] = (byCat[catSlug] || 0) + 1;

      if (DRY_RUN) {
        log(
          `  [dry-run] ${template.padEnd(14)} /${catSlug}/${slug}/  blocks=${doc.body?.length || 0} bolLinksKept=html`,
        );
        success++;
      } else {
        await sanity.createOrReplace(doc);
        log(`  ✅ [${template}] /${catSlug}/${slug}/`);
        success++;
      }
    } catch (err) {
      warn(`  ❌ ${slug}: ${err.message}`);
      errors++;
    }
  }

  log('');
  log('─────────────────────────────────────────────────────');
  log(`  ✅ OK: ${success}  ❌ errors: ${errors}${skipped ? `  ⏭ skipped: ${skipped}` : ''}`);
  log(`  templates: ${JSON.stringify(byTemplate)}`);
  log(`  categories: ${JSON.stringify(byCat)}`);
  log(`  pages exported: ${pagesCount}`);
  log(`  image uploads this run: ${_uploadCount}`);
  if (DRY_RUN) {
    log('  Next: node scripts/migrate-wp.mjs --import');
  } else {
    const postsNow = await sanity.fetch('count(*[_type=="post"])');
    const catsNow = await sanity.fetch('count(*[_type=="category"])');
    const assetsNow = await sanity.fetch('count(*[_type=="sanity.imageAsset"])');
    log(`  Sanity now: posts=${postsNow} categories=${catsNow} assets=${assetsNow}`);
  }
  log('');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
