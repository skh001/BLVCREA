import { getCustomRequests, getAllProducts, getCategories, getCustomSizes, sanityWriteClient } from '@/lib/sanity';
import { runDataMaintenance } from '@/lib/admin';
import { DEFAULT_CUSTOM_SIZES } from '@/lib/catalog';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tableau de bord — BLVCréa Admin',
  robots: 'noindex, nofollow',
};

export default async function AdminDashboardPage() {
  // Repairs duplicate slugs and seeds categories/settings. Idempotent and cheap;
  // a failure here must never prevent the dashboard from loading.
  await runDataMaintenance().catch((err) => console.error('[Admin maintenance]', err));

  const [requests, products, categories, sizes] = await Promise.all([
    getCustomRequests().catch(() => []),
    getAllProducts().catch(() => []),
    getCategories(sanityWriteClient).catch(() => []),
    getCustomSizes(sanityWriteClient).catch(() => DEFAULT_CUSTOM_SIZES),
  ]);

  return (
    <AdminDashboardClient
      initialRequests={requests}
      initialProducts={products}
      initialCategories={categories}
      initialSizes={sizes}
    />
  );
}
