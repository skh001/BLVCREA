// sanity/schemas/product.ts
export default {
  name: 'product',
  title: 'Produit',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Nom du produit',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(2).max(100),
    },
    {
      name: 'slug',
      title: 'URL du produit',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Prix (€)',
      type: 'number',
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    },
    {
      name: 'image',
      title: 'Photo principale',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Suspension murale', value: 'suspension' },
          { title: 'Rideau & Séparateur', value: 'rideau' },
          { title: 'Cadre décoratif', value: 'cadre' },
          { title: 'Table & Vase', value: 'table' },
          { title: 'Bijou & Accessoire', value: 'bijou' },
        ],
      },
    },
    {
      name: 'inStock',
      title: 'En stock',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: { title: 'title', media: 'image', subtitle: 'price' },
    prepare({ title, media, subtitle }: any) {
      return { title, media, subtitle: `${subtitle} €` };
    },
  },
};
