// sanity/schemas/siteSettings.ts — singleton (_id: "siteSettings")
export default {
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  fields: [
    {
      name: 'customSizes',
      title: 'Tarifs sur-mesure (par taille)',
      type: 'array',
      of: [
        {
          name: 'customSize',
          type: 'object',
          fields: [
            { name: 'label',   title: 'Taille',    type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'details', title: 'Précision', type: 'string' },
            { name: 'price',   title: 'Prix (€)',  type: 'number', validation: (Rule: any) => Rule.required().positive() },
          ],
          preview: {
            select: { title: 'label', details: 'details', price: 'price' },
            prepare({ title, details, price }: any) {
              return { title: `${title}${details ? ` (${details})` : ''}`, subtitle: `${price} €` };
            },
          },
        },
      ],
    },
    {
      name: 'categoriesSeeded',
      title: 'Catégories initialisées',
      type: 'boolean',
      readOnly: true,
      hidden: true,
    },
  ],
  preview: { prepare: () => ({ title: 'Réglages du site' }) },
};
