import { getAllProducts, getCategories } from '@/lib/sanity';
import ShopCatalog from '@/components/ShopCatalog';

// Legacy /boutique?categorie=… URLs are redirected by the middleware, so this
// page needs no searchParams and can be statically cached like the others.
export const revalidate = 60;

export const metadata = {
  title: 'Boutique — BLVCréa',
  description: 'Découvrez toutes nos créations en macramé faites à la main. Livraison offerte.',
  alternates: { canonical: '/boutique' },
};

export default async function BoutiquePage() {
  const [products, categories] = await Promise.all([
    getAllProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  return <ShopCatalog products={products} categories={categories} activeSlug={null} title="La Boutique" />;
}
