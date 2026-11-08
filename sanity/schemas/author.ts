import { defineField, defineType } from 'sanity';

export const author = defineType({
  name: 'author',
  title: 'Auteur',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Naam', type: 'string', validation: R => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } }),
    defineField({
      name: 'avatar',
      title: 'Profielfoto',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 4 }),
    defineField({ name: 'credentials', title: 'Kwalificaties', type: 'string', description: 'bijv. "MSc Voedingswetenschappen, Certified Personal Trainer"' }),
    defineField({ name: 'instagram', title: 'Instagram URL', type: 'url' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'credentials', media: 'avatar' },
  },
});
