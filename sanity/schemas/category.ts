import { defineField, defineType } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Categorie',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Naam',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
      description: 'bijv. "gezondheid" → thehealthissue.nl/gezondheid/',
    }),
    defineField({
      name: 'description',
      title: 'Beschrijving',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero afbeelding',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt-tekst' }],
    }),
    defineField({
      name: 'color',
      title: 'Accentkleur (optioneel)',
      type: 'string',
      description: 'CSS kleurwaarde voor categorie-badge, bijv. #3d7a30',
    }),
    defineField({
      name: 'order',
      title: 'Volgorde in navigatie',
      type: 'number',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current', media: 'heroImage' },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: `/${subtitle}/`, media };
    },
  },
  orderings: [
    { title: 'Naam A–Z', name: 'titleAsc', by: [{ field: 'title', direction: 'asc' }] },
    { title: 'Volgorde', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
});
