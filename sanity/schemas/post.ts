import { defineField, defineType } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Artikel',
  type: 'document',
  groups: [
    { name: 'content', title: 'Inhoud', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'meta', title: 'Meta' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'template',
      title: 'Template',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'Informatief (standaard)', value: 'standard' },
          { title: 'Vergelijkingsartikel', value: 'comparison' },
          { title: 'Honest Review', value: 'honest-review' },
          { title: 'Nutriënten / Calculator', value: 'nutrient' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'meta',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'meta',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publicatiedatum',
      type: 'datetime',
      group: 'meta',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Bijgewerkt op',
      type: 'datetime',
      group: 'meta',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero afbeelding',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt-tekst' }),
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Samenvatting (excerpt)',
      type: 'text',
      rows: 3,
      group: 'content',
    }),

    // ── Quick Answer (ACF equivalent)
    defineField({
      name: 'quickAnswer',
      title: 'Quick Answer',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'Kort antwoord op de hoofdvraag van het artikel. Verschijnt boven de content.',
    }),

    // ── Key Takeaways
    defineField({
      name: 'keyTakeaways',
      title: 'Key Takeaways',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      validation: Rule => Rule.max(6),
    }),

    // ── Body content (Portable Text)
    defineField({
      name: 'body',
      title: 'Artikel inhoud',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt-tekst' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
        { type: 'table' },
      ],
    }),

    // ── FAQ
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            { name: 'question', type: 'string', title: 'Vraag', validation: (R) => R.required() },
            { name: 'answer', type: 'text', title: 'Antwoord', validation: (R) => R.required() },
          ],
          preview: { select: { title: 'question' } },
        },
      ],
    }),

    // ── Expert reviewer
    defineField({
      name: 'expertReviewer',
      title: 'Expert Reviewer',
      type: 'object',
      group: 'content',
      fields: [
        { name: 'name', type: 'string', title: 'Naam' },
        { name: 'title', type: 'string', title: 'Functie / Instelling' },
        { name: 'quote', type: 'text', title: 'Quote' },
      ],
    }),

    // ── Comparison products (alleen bij template: comparison)
    defineField({
      name: 'comparisonProducts',
      title: 'Vergelijkingsproducten',
      type: 'array',
      group: 'content',
      hidden: ({ document }) => document?.template !== 'comparison',
      of: [{ type: 'comparisonProduct' }],
      validation: Rule => Rule.max(8),
    }),
    defineField({
      name: 'comparisonDisclosure',
      title: 'Affiliate disclosure',
      type: 'string',
      group: 'content',
      hidden: ({ document }) => document?.template !== 'comparison',
      initialValue: 'Dit artikel bevat affiliate links. Als je via onze links koopt, ontvangen wij een kleine commissie — zonder extra kosten voor jou.',
    }),

    // ── Honest review fields (alleen bij template: honest-review)
    defineField({
      name: 'honestReview',
      title: 'Honest Review',
      type: 'object',
      group: 'content',
      hidden: ({ document }) => document?.template !== 'honest-review',
      fields: [
        { name: 'productName', type: 'string', title: 'Productnaam' },
        { name: 'testPeriod', type: 'string', title: 'Testperiode (bijv. "8 weken")' },
        { name: 'bestFor', type: 'string', title: 'Best voor (bijv. "Sporters die beter willen herstellen")' },
        { name: 'overallScore', type: 'number', title: 'Eindscore (0–10)', validation: R => R.min(0).max(10) },
        {
          name: 'tursoProductId',
          type: 'number',
          title: 'Turso / products.db id (Awin of Daisycon)',
          description: 'Primair: live prijs + affiliate URL uit feed. Verplicht of affiliateUrl.',
        },
        {
          name: 'affiliateUrl',
          type: 'url',
          title: 'Handmatige affiliate-URL',
          description:
            'Last resort of Bol-only. Bol = partner.bol.com deep link (s=1121688). Geen bare bol.com PDP. Catalog API niet in v1.',
        },
        { name: 'shop', type: 'string', title: 'Shop-label (bij handmatige URL)' },
        { name: 'price', type: 'string', title: 'Prijs-label (bij handmatige URL)' },
        {
          name: 'scores',
          type: 'object',
          title: 'Deelscores',
          fields: [
            { name: 'ingredients', type: 'number', title: 'Ingrediënten (0–10)' },
            { name: 'dosage', type: 'number', title: 'Dosering (0–10)' },
            { name: 'effect', type: 'number', title: 'Effect (0–10)' },
            { name: 'value', type: 'number', title: 'Prijs/kwaliteit (0–10)' },
            { name: 'taste', type: 'number', title: 'Smaak (0–10)' },
          ],
        },
        {
          name: 'weeklyEntries',
          type: 'array',
          title: 'Weekentries',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'week', type: 'string', title: 'Week (bijv. "Week 1–2")' },
                { name: 'title', type: 'string', title: 'Titel' },
                { name: 'text', type: 'text', title: 'Ervaringen' },
              ],
              preview: { select: { title: 'week', subtitle: 'title' } },
            },
          ],
        },
      ],
    }),

    // ── SEO
    defineField({
      name: 'seoTitle',
      title: 'SEO Titel',
      type: 'string',
      group: 'seo',
      validation: Rule => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Beschrijving',
      type: 'text',
      rows: 2,
      group: 'seo',
      validation: Rule => Rule.max(155),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'category.title',
      media: 'heroImage',
      template: 'template',
    },
    prepare({ title, subtitle, media, template }) {
      const icons: Record<string, string> = {
        standard: '📄',
        comparison: '⚖️',
        'honest-review': '🔬',
        nutrient: '🥦',
      };
      return {
        title: `${icons[template] ?? '📄'} ${title}`,
        subtitle,
        media,
      };
    },
  },
});
