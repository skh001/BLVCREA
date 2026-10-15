// sanity/schemas/category.ts
export default {
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Nom',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(2).max(60),
    },
    {
      name: 'slug',
      title: 'Identifiant URL',
      description: 'Utilisé dans l’adresse /boutique/… et sur les produits. Ne pas modifier après création.',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'order',
      title: "Ordre d'affichage",
      type: 'number',
    },
  ],
  orderings: [{ title: 'Ordre', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
};
