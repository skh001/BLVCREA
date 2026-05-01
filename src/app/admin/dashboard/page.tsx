import { getCustomRequests, getAllProducts } from '@/lib/sanity';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tableau de bord — BLVCréa Admin',
  robots: 'noindex, nofollow',
};

export default async function AdminDashboardPage() {
  const [requests, products] = await Promise.all([
    getCustomRequests().catch(() => []),
    getAllProducts().catch(() => []),
  ]);

  return (
    <AdminDashboardClient
      initialRequests={requests}
      initialProducts={products}
    />
  );
}
