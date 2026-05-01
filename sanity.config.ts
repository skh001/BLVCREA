import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'blvcrea',
  title: 'BLVCréa — Boutique',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('BLVCréa')
          .items([
            S.listItem()
              .title('🛍 Produits')
              .child(S.documentTypeList('product').title('Tous les produits')),
            S.divider(),
            S.listItem()
              .title('📬 Demandes personnalisées')
              .child(
                S.documentTypeList('customRequest')
                  .title('Demandes reçues')
                  .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
