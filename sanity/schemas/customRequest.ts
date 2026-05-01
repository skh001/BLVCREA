// sanity/schemas/customRequest.ts
export default {
  name: 'customRequest',
  title: 'Demande personnalisée',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nom du client',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'phone',
      title: 'Téléphone',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'color',
      title: 'Couleur choisie',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'description',
      title: 'Description du projet',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'imageUrl',
      title: "URL de l'image d'inspiration",
      type: 'url',
      readOnly: true,
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: '🆕 Nouveau', value: 'nouveau' },
          { title: '🔄 En cours', value: 'en_cours' },
          { title: '✅ Terminé', value: 'termine' },
        ],
        layout: 'radio',
      },
      initialValue: 'nouveau',
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'email' },
  },
};
