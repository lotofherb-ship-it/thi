import { defineField, defineType } from 'sanity';

export const comparisonProduct = defineType({
  name: 'comparisonProduct',
  title: 'Vergelijkingsproduct',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Productnaam',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'string',
      options: {
        list: [
          { title: 'Winnaar', value: 'winner' },
          { title: 'Runner-up', value: 'runner-up' },
          { title: 'Beste budget', value: 'budget' },
          { title: 'Geen badge', value: '' },
        ],
      },
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      validation: Rule => Rule.max(60),
    }),
    defineField({
      name: 'rating',
      title: 'Score (0–5)',
      type: 'number',
      validation: Rule => Rule.required().min(0).max(5),
    }),
    defineField({
      name: 'price',
      title: 'Prijs',
      type: 'string',
      description: 'bijv. €26,95',
    }),
    defineField({
      name: 'priceNote',
      title: 'Prijs toelichting',
      type: 'string',
      description: 'bijv. "per 60 capsules"',
    }),
    defineField({
      name: 'shop',
      title: 'Webshop',
      type: 'string',
      description: 'bijv. "Superfoodstore"',
    }),
    defineField({
      name: 'affiliateUrl',
      title: 'Affiliate URL',
      type: 'url',
    }),
    defineField({
      name: 'image',
      title: 'Productafbeelding',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'pros',
      title: 'Voordelen',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => Rule.min(2).max(5),
    }),
    defineField({
      name: 'cons',
      title: 'Nadelen',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => Rule.min(1).max(3),
    }),
    defineField({
      name: 'verdict',
      title: 'Verdict',
      type: 'text',
      rows: 2,
    }),
    // Affiliate DB koppeling (products.id in thi/affiliate/db/products.db — same as old WP)
    defineField({
      name: 'tursoProductId',
      title: 'Affiliate product ID',
      type: 'number',
      description:
        'products.id uit de Awin SQLite/Turso DB. Zoeken: node scripts/search-affiliate.mjs "productnaam". Vult prijs, URL en winkel bij build.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'badge',
      media: 'image',
      rating: 'rating',
    },
    prepare({ title, subtitle, media, rating }) {
      const badges: Record<string, string> = { winner: '🥇', 'runner-up': '🥈', budget: '💰' };
      return {
        title: `${badges[subtitle] ?? ''} ${title}`,
        subtitle: `★ ${rating ?? '?'}/5`,
        media,
      };
    },
  },
});
