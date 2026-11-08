/**
 * WordPress → Sanity migration script for The Health Issue
 *
 * SAFE: alleen schrijft naar Sanity, raakt WordPress nooit aan.
 *
 * Gebruik:
 *   node scripts/migrate-wp.mjs --dry-run     (preview, niets opgeslagen)
 *   node scripts/migrate-wp.mjs --import      (echte import naar Sanity)
 *   node scripts/migrate-wp.mjs --import --post beste-magnesium-bisglycinaat  (1 post)
 *
 * Vereist env vars (in .env of als shell exports):
 *   SANITY_API_WRITE_TOKEN=...   (lees hieronder hoe je dit aanmaakt)
 */

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && !process.env[key]) {
      process.env[key] = rest.join('=').trim();
    }
  }
}
loadEnv();

// ─── Config ───────────────────────────────────────────────────────────────────
const WP_BASE   = 'https://thehealthissue.nl/wp-json/wp/v2';
const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || 'e6out5at';
const DATASET    = process.env.PUBLIC_SANITY_DATASET    || 'production';
const WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

const DRY_RUN  = process.argv.includes('--dry-run') || !process.argv.includes('--import');
const ONE_POST = (() => {
  const idx = process.argv.indexOf('--post');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

// ─── Sanity client ────────────────────────────────────────────────────────────
const sanity = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: WRITE_TOKEN,
  useCdn: false,
});

// ─── WP API helpers ───────────────────────────────────────────────────────────
async function wpFetch(path) {
  const res = await fetch(`${WP_BASE}${path}`);
  if (!res.ok) throw new Error(`WP API ${path}: ${res.status}`);
  return res.json();
}

async function fetchAllPosts() {
  const headers = new Headers();
  const res = await fetch(`${WP_BASE}/posts?per_page=1`, { headers });
  const total = parseInt(res.headers.get('x-wp-total') || '0');
  const pages = Math.ceil(total / 100);

  const posts = [];
  for (let page = 1; page <= pages; page++) {
    log(`  Fetching WP posts page ${page}/${pages}...`);
    const batch = await wpFetch(`/posts?per_page=100&page=${page}&_embed=1`);
    posts.push(...batch);
  }
  return posts;
}

async function fetchWpCategories() {
  const cats = await wpFetch('/categories?per_page=100');
  return cats;
}

// ─── HTML → Portable Text converter ──────────────────────────────────────────
function generateKey() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Converts WordPress HTML content to Sanity Portable Text blocks.
 * Handles: p, h2, h3, h4, ul, ol, blockquote.
 * Inline: strong, em, a (links become markDefs).
 * Gutenberg comments are stripped.
 */
function htmlToBlocks(html) {
  if (!html) return [];

  // Strip Gutenberg block comments and extra whitespace
  let cleaned = html
    .replace(/<!--\s*wp:[^>]*?-->/g, '')
    .replace(/<!--\s*\/wp:[^>]*?-->/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const blocks = [];

  // Split into block-level segments
  // We'll extract blocks one at a time by finding opening tags
  const blockRegex = /<(p|h[2-4]|blockquote|ul|ol|figure|table)[^>]*>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(cleaned)) !== null) {
    const tag = match[1].toLowerCase();
    const inner = match[2];

    switch (tag) {
      case 'p': {
        const block = parseTextBlock(inner, 'normal');
        if (block) blocks.push(block);
        break;
      }
      case 'h2':
      case 'h3':
      case 'h4': {
        const block = parseTextBlock(inner, tag);
        if (block) blocks.push(block);
        break;
      }
      case 'blockquote': {
        // Strip inner <p> if present
        const text = inner.replace(/<p[^>]*>([\s\S]*?)<\/p>/i, '$1');
        const block = parseTextBlock(text, 'blockquote');
        if (block) blocks.push(block);
        break;
      }
      case 'ul': {
        const items = extractListItems(inner, 'bullet');
        blocks.push(...items);
        break;
      }
      case 'ol': {
        const items = extractListItems(inner, 'number');
        blocks.push(...items);
        break;
      }
      case 'figure': {
        // Extract image from figure
        const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        const captionMatch = inner.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
        if (imgMatch) {
          // We store external image URLs as a special block we'll handle later
          blocks.push({
            _type: '_externalImage',
            _key: generateKey(),
            url: imgMatch[1],
            caption: captionMatch ? stripTags(captionMatch[1]) : '',
          });
        }
        break;
      }
      case 'table': {
        // Parse <table> → Sanity table block
        // Expects first row to be <thead><tr><th>...</th></tr></thead> or first <tr> as header
        const tableBlock = parseHtmlTable(inner);
        if (tableBlock) blocks.push(tableBlock);
        break;
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // If no block-level tags found at all, treat entire content as a paragraph
  if (blocks.length === 0 && cleaned.length > 0) {
    const plainText = stripTags(cleaned).trim();
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
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    markDefs,
    children,
  };
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

/**
 * Parse inline HTML into Portable Text spans + markDefs.
 * Handles: <strong>, <b>, <em>, <i>, <a href>, <code>.
 */
function parseInlineContent(html) {
  const markDefs = [];
  const children = [];

  // Replace HTML entities first
  let text = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));

  // Simple inline parser: tokenize spans between tags
  const tokenRegex = /<(\/?)(\w+)([^>]*)>|([^<]+)/g;
  const activeMarks = [];
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    const [, closing, tag, attrs, plainText] = match;

    if (plainText !== undefined) {
      // Text node
      const trimmed = plainText;
      if (trimmed) {
        children.push({
          _type: 'span',
          _key: generateKey(),
          text: trimmed,
          marks: [...activeMarks],
        });
      }
    } else {
      const tagLower = tag.toLowerCase();

      if (closing) {
        // Closing tag: pop the matching mark
        if (['strong', 'b', 'em', 'i', 'code'].includes(tagLower)) {
          const mark = tagLower === 'b' ? 'strong' : tagLower === 'i' ? 'em' : tagLower;
          const idx = activeMarks.lastIndexOf(mark);
          if (idx !== -1) activeMarks.splice(idx, 1);
        } else if (tagLower === 'a') {
          // Remove link mark (it's a key, not a type name)
          const idx = activeMarks.findLastIndex(m => m.startsWith('link-'));
          if (idx !== -1) activeMarks.splice(idx, 1);
        }
      } else {
        // Opening tag
        if (tagLower === 'strong' || tagLower === 'b') {
          activeMarks.push('strong');
        } else if (tagLower === 'em' || tagLower === 'i') {
          activeMarks.push('em');
        } else if (tagLower === 'code') {
          activeMarks.push('code');
        } else if (tagLower === 'a') {
          const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
          if (hrefMatch) {
            const key = `link-${generateKey()}`;
            markDefs.push({ _key: key, _type: 'link', href: hrefMatch[1] });
            activeMarks.push(key);
          }
        }
        // br → add newline to last span or push a newline span
        else if (tagLower === 'br') {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text: '\n',
            marks: [...activeMarks],
          });
        }
      }
    }
  }

  return { children, markDefs };
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/**
 * Parse an HTML table into a Sanity table block.
 * Supports <thead>/<tbody> and plain <tr><th>/<tr><td> structures.
 * Returns null if no rows found.
 */
function parseHtmlTable(inner) {
  const rows = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;

  while ((trMatch = trRegex.exec(inner)) !== null) {
    const rowHtml = trMatch[1];
    const cells = [];
    // Match both <th> and <td>
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(stripTags(cellMatch[1]).trim());
    }
    if (cells.length > 0) rows.push({ cells });
  }

  if (rows.length === 0) return null;

  return {
    _type: 'table',
    _key: generateKey(),
    rows,
  };
}

// ─── Image upload to Sanity ───────────────────────────────────────────────────
let _uploadCount = 0;

async function uploadImageUrl(imageUrl, altText = '') {
  if (!imageUrl) return null;
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
    const mimeType = imageUrl.match(/\.(png)$/i) ? 'image/png'
                   : imageUrl.match(/\.(gif)$/i) ? 'image/gif'
                   : imageUrl.match(/\.(webp)$/i) ? 'image/webp'
                   : 'image/jpeg';

    const asset = await sanity.assets.upload('image', buffer, {
      filename,
      contentType: mimeType,
    });

    // Rate limiting: pause every 10 uploads to avoid Sanity asset API throttling
    _uploadCount++;
    if (_uploadCount % 10 === 0) {
      await new Promise(r => setTimeout(r, 1500));
    } else {
      await new Promise(r => setTimeout(r, 150));
    }

    return {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: altText || '',
    };
  } catch (err) {
    warn(`  Could not upload image ${imageUrl}: ${err.message}`);
    return null;
  }
}

// ─── Template detection ───────────────────────────────────────────────────────
function detectTemplate(wpPost) {
  // Prefer the WP template field — most reliable signal
  const wpTemplate = wpPost.template || '';
  if (wpTemplate === 'comparison.php')    return 'comparison';
  if (wpTemplate === 'honest-review.php') return 'honest-review';

  // Fallback: URL patterns (for older posts that may lack the template field)
  const link = wpPost.link || '';
  if (link.includes('/vergelijken/'))     return 'comparison';
  if (link.includes('/review/'))          return 'honest-review';

  // Last resort: presence of products array
  if (Array.isArray(wpPost.products) && wpPost.products.length > 0) return 'comparison';

  return 'standard';
}

// ─── Map WP category to Sanity category ──────────────────────────────────────
function getCategoryRef(wpPost, wpCategories) {
  const embedded = wpPost._embedded?.['wp:term'] || [];
  const catTerms = embedded.flat().filter(t => t.taxonomy === 'category' && t.slug !== 'uncategorized');

  if (!catTerms.length) return null;

  // Use first (primary) category
  const wpCat = catTerms[0];
  return {
    _type: 'reference',
    _ref: `category-${wpCat.slug}`,
  };
}

// ─── Map WP products → Sanity comparisonProducts ─────────────────────────────
function mapProducts(products) {
  if (!Array.isArray(products) || !products.length) return undefined;

  return products.map(p => ({
    _key: generateKey(),
    name: p.product_name || '',
    badge: ['winner', 'runner-up', 'budget'].includes(p.product_badge) ? p.product_badge : undefined,
    tagline: p.product_tagline || undefined,
    rating: parseFloat(p.product_rating) || 0,
    price: p.product_price || undefined,
    priceNote: p.product_price_per || undefined,
    shop: p.product_shop || undefined,
    affiliateUrl: p.product_link || undefined,
    // product_image is an external URL — we'll upload it separately
    _externalImageUrl: p.product_image || undefined,
    pros: Array.isArray(p.product_pros)
      ? p.product_pros.map(x => x.pro_text || x.text || String(x)).filter(Boolean)
      : undefined,
    cons: Array.isArray(p.product_cons)
      ? p.product_cons.map(x => x.con_text || x.text || String(x)).filter(Boolean)
      : undefined,
    verdict: p.product_verdict || undefined,
  }));
}

// ─── Build Sanity document from WP post ──────────────────────────────────────
async function buildSanityDoc(wpPost, wpCategories) {
  const template = detectTemplate(wpPost);
  const catRef   = getCategoryRef(wpPost, wpCategories);
  const meta     = wpPost.meta || {};

  // Body: HTML → Portable Text
  const rawBody = wpPost.content?.rendered || '';
  const blocks  = htmlToBlocks(rawBody);

  // Upload inline images from body (replace _externalImage blocks)
  const body = [];
  for (const block of blocks) {
    if (block._type === '_externalImage') {
      if (!DRY_RUN) {
        const sanityImg = await uploadImageUrl(block.url, block.caption);
        if (sanityImg) {
          body.push({
            _type: 'image',
            _key: block._key,
            ...sanityImg,
            caption: block.caption || undefined,
          });
        }
      }
      // In dry-run: skip external image blocks
    } else {
      body.push(block);
    }
  }

  // Key takeaways (both standard and comparison use same WP field names)
  const ktRaw = wpPost.thi_key_takeaways || wpPost.key_takeaways;
  const keyTakeaways = Array.isArray(ktRaw) && ktRaw.length
    ? ktRaw.map(x => x.item || x.text || String(x)).filter(Boolean)
    : undefined;

  // FAQ — WP API exposes fields as faq_q/faq_a (comparison) or question/answer (standard)
  const faqRaw = wpPost.thi_faq || wpPost.faq;
  const faq = Array.isArray(faqRaw) && faqRaw.length
    ? faqRaw
        .map(x => ({
          question: x.faq_q || x.question || '',
          answer:   x.faq_a || x.answer   || '',
        }))
        .filter(x => x.question)
    : undefined;

  // Quick answer
  const quickAnswer = (wpPost.thi_quick_answer || wpPost.qa_text || '').trim() || undefined;

  // Expert reviewer
  const expertReviewer = wpPost.thi_expert_reviewer_name ? {
    name: wpPost.thi_expert_reviewer_name,
    title: wpPost.thi_expert_reviewer_title || undefined,
    quote: wpPost.thi_expert_reviewer_quote || undefined,
  } : undefined;

  // SEO (from SEOPress meta fields)
  const seoTitle = (meta._seopress_titles_title || '').trim() || undefined;
  const seoDescription = (meta._seopress_titles_desc || '').trim() || undefined;

  // Excerpt
  const excerpt = stripTags(wpPost.excerpt?.rendered || '').trim() || undefined;

  // Featured image
  let heroImage = null;
  const featuredMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
  const heroImgUrl = featuredMedia?.source_url || null;

  if (!DRY_RUN && heroImgUrl) {
    heroImage = await uploadImageUrl(heroImgUrl, wpPost.title?.rendered || '');
  }

  // Comparison products
  let comparisonProducts = template === 'comparison'
    ? mapProducts(wpPost.products)
    : undefined;

  // Upload product images
  if (comparisonProducts && !DRY_RUN) {
    for (const prod of comparisonProducts) {
      if (prod._externalImageUrl) {
        prod.image = await uploadImageUrl(prod._externalImageUrl, prod.name);
        delete prod._externalImageUrl;
      }
    }
  } else if (comparisonProducts) {
    // dry-run: remove the temp field
    comparisonProducts = comparisonProducts.map(p => {
      const { _externalImageUrl, ...rest } = p;
      return rest;
    });
  }

  // Sanity document
  const doc = {
    _id: `wp-${wpPost.id}`,
    _type: 'post',
    title: stripTags(wpPost.title?.rendered || ''),
    slug: { _type: 'slug', current: wpPost.slug },
    template,
    publishedAt: wpPost.date_gmt ? new Date(wpPost.date_gmt + 'Z').toISOString() : undefined,
    updatedAt: wpPost.modified_gmt ? new Date(wpPost.modified_gmt + 'Z').toISOString() : undefined,
    excerpt,
    seoTitle,
    seoDescription,
    body: body.length ? body : undefined,
    keyTakeaways,
    quickAnswer,
    faq,
    expertReviewer,
    comparisonProducts,
    comparisonDisclosure: wpPost.disclosure?.trim() || undefined,
  };

  // Add category ref if found
  if (catRef) doc.category = catRef;

  // Add hero image if found
  if (heroImage) doc.heroImage = heroImage;

  // Remove undefined fields
  return JSON.parse(JSON.stringify(doc));
}

// ─── Ensure Sanity categories exist ──────────────────────────────────────────
async function ensureCategories(wpCategories) {
  const toCreate = wpCategories.filter(c => c.slug !== 'uncategorized');

  log(`\nCategories (${toCreate.length}):`);
  for (const cat of toCreate) {
    const doc = {
      _id: `category-${cat.slug}`,
      _type: 'category',
      title: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description?.trim() || undefined,
    };
    const cleaned = JSON.parse(JSON.stringify(doc));

    if (DRY_RUN) {
      log(`  [dry-run] Would upsert category: ${cat.slug}`);
    } else {
      await sanity.createOrReplace(cleaned);
      log(`  ✅ Category: ${cat.slug}`);
    }
  }
}

// ─── Logging helpers ──────────────────────────────────────────────────────────
function log(msg)  { process.stdout.write(msg + '\n'); }
function warn(msg) { process.stderr.write('⚠  ' + msg + '\n'); }

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log('');
  log('┌─────────────────────────────────────────────────────┐');
  log('│   THI WordPress → Sanity Migration                 │');
  log('└─────────────────────────────────────────────────────┘');
  log(`  Mode: ${DRY_RUN ? '🔍 DRY-RUN (niets opgeslagen)' : '🚀 IMPORT'}`);
  if (ONE_POST) log(`  Post filter: ${ONE_POST}`);
  log('');

  // Guard: require write token for real import
  if (!DRY_RUN && !WRITE_TOKEN) {
    log('❌ SANITY_API_WRITE_TOKEN ontbreekt in .env');
    log('');
    log('Maak een write token aan:');
    log('  1. Ga naar https://sanity.io/manage → project e6out5at');
    log('  2. API → Tokens → Add API token');
    log('  3. Name: "Migration", Permissions: Editor');
    log('  4. Voeg toe aan .env: SANITY_API_WRITE_TOKEN=sk...');
    process.exit(1);
  }

  if (!WRITE_TOKEN) {
    warn('SANITY_API_WRITE_TOKEN ontbreekt — dry-run kan wel, echte import niet.');
  }

  log(`  Sanity project: ${PROJECT_ID} / ${DATASET}`);
  try {
    const ping = await sanity.fetch('count(*)');
    log(`  Sanity bereikbaar — ${ping} documenten in dataset`);
  } catch (err) {
    warn(`Sanity ping mislukt: ${err instanceof Error ? err.message : err}`);
    if (!DRY_RUN) process.exit(1);
  }

  // Fetch WP data
  log('📥 WordPress data ophalen...');
  const [wpPosts, wpCategories] = await Promise.all([
    ONE_POST
      ? wpFetch(`/posts?slug=${ONE_POST}&_embed=1`).then(r => Array.isArray(r) ? r : [r])
      : fetchAllPosts(),
    fetchWpCategories(),
  ]);

  log(`  ${wpPosts.length} posts gevonden`);
  log(`  ${wpCategories.length} categorieën gevonden`);

  // Upsert categories first
  await ensureCategories(wpCategories);

  // Migrate posts
  log(`\nPosts (${wpPosts.length}):`);
  let success = 0, skipped = 0, errors = 0;

  for (const wpPost of wpPosts) {
    const slug = wpPost.slug;
    const template = detectTemplate(wpPost);

    try {
      const doc = await buildSanityDoc(wpPost, wpCategories);

      if (DRY_RUN) {
        const catSlug = wpPost._embedded?.['wp:term']?.flat()
          .find(t => t.taxonomy === 'category')?.slug || '?';
        log(`  [dry-run] ${template.padEnd(12)} /${catSlug}/${slug}/`);
        log(`             title: ${doc.title}`);
        log(`             body blocks: ${doc.body?.length || 0} | kt: ${doc.keyTakeaways?.length || 0} | faq: ${doc.faq?.length || 0}`);
        if (doc.comparisonProducts) log(`             products: ${doc.comparisonProducts.length}`);
        success++;
      } else {
        await sanity.createOrReplace(doc);
        log(`  ✅ [${template}] /${slug}/`);
        success++;
      }
    } catch (err) {
      warn(`  ❌ ${slug}: ${err.message}`);
      errors++;
    }
  }

  // Summary
  log('');
  log('─────────────────────────────────────────────────────');
  log(`  ✅ Succesvol: ${success}`);
  if (skipped) log(`  ⏭  Overgeslagen: ${skipped}`);
  if (errors)  log(`  ❌ Fouten: ${errors}`);
  log('');

  if (DRY_RUN) {
    log('💡 Tevreden? Start de echte import met:');
    log('   node scripts/migrate-wp.mjs --import');
  } else {
    log('✅ Migratie klaar. Controleer je content op:');
    log('   https://thehealthissue.sanity.studio/');
  }
  log('');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
