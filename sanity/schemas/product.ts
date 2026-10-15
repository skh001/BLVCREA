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
      description: 'Les retours à la ligne sont conservés. Laissez une ligne vide pour un nouveau paragraphe.',
      type: 'text',
      rows: 8,
    },
    {
      name: 'images',
      title: 'Photos',
      description: 'La première photo est la photo principale.',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
      validation: (Rule: any) => Rule.max(10),
    },
    {
      // Legacy single image — kept read-only so older products still display.
      // Saving a product from the admin dashboard moves it into `images`.
      name: 'image',
      title: 'Photo principale (ancien champ)',
      type: 'image',
      readOnly: true,
      hidden: ({ document }: any) => !document?.image,
    },
    {
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'inStock',
      title: 'En stock',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: { title: 'title', media: 'images.0', legacyMedia: 'image', subtitle: 'price' },
    prepare({ title, media, legacyMedia, subtitle }: any) {
      return { title, media: media || legacyMedia, subtitle: `${subtitle} €` };
    },
  },
};
