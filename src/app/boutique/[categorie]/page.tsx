import { notFound } from 'next/navigation';
import { getCategories, getProductsByCategory } from '@/lib/sanity';
import ShopCatalog from '@/components/ShopCatalog';

export const revalidate = 60;

type Params = { params: { categorie: string } };

export async function generateStaticParams() {
  const categories = await getCategories().catch(() => []);
  return categories.map((c) => ({ categorie: c.slug }));
}

export async function generateMetadata({ params }: Params) {
  const categories = await getCategories().catch(() => []);
  const category = categories.find((c) => c.slug === params.categorie);
  if (!category) return { title: 'Catégorie introuvable — BLVCréa' };
  return {
    title: `${category.title} — Boutique BLVCréa`,
    description: `${category.title} en macramé, faits main avec amour par BLVCréa. Livraison offerte.`,
    alternates: { canonical: `/boutique/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Params) {
  const slug = decodeURIComponent(params.categorie);
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProductsByCategory(slug).catch(() => []),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <ShopCatalog
      products={products}
      categories={categories}
      activeSlug={category.slug}
      title={category.title}
      eyebrow="La Boutique"
    />
  );
}
