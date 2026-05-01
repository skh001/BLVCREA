import { getAllProducts } from '@/lib/sanity';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { Palette } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Boutique — BLVCréa',
  description: 'Découvrez toutes nos créations en macramé faites à la main.',
};

const categories = [
  { value: 'all', label: 'Tout voir' },
  { value: 'suspension', label: 'Suspensions' },
  { value: 'rideau', label: 'Rideaux' },
  { value: 'cadre', label: 'Cadres' },
  { value: 'table', label: 'Table & Vase' },
  { value: 'bijou', label: 'Bijoux' },
];

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: { categorie?: string };
}) {
  const allProducts = await getAllProducts().catch(() => []);
  const activeCategory = searchParams.categorie || 'all';

  const products =
    activeCategory === 'all'
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">
            Créations faites main
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-gray-800 mb-4">La Boutique</h1>
          <div className="divider max-w-xs mx-auto">
            <span className="font-script text-blush-300 text-lg">collection</span>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={cat.value === 'all' ? '/boutique' : `/boutique?categorie=${cat.value}`}
              className={`font-sans text-xs tracking-widest uppercase px-5 py-2.5 rounded-full border transition-all duration-200 ${
                activeCategory === cat.value
                  ? 'bg-blush-500 text-white border-blush-500'
                  : 'border-rose-200 text-blush-600 hover:border-blush-300 hover:bg-petal'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} delay={i * 80} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-script text-6xl text-blush-200 mb-4">Vide pour l&apos;instant</p>
            <p className="font-sans text-blush-400 mb-8">
              {activeCategory === 'all'
                ? 'Aucun produit disponible pour le moment.'
                : 'Aucun produit dans cette catégorie.'}
            </p>
            {activeCategory !== 'all' && (
              <Link href="/boutique" className="btn-secondary">
                Voir tous les produits
              </Link>
            )}
          </div>
        )}

        {/* Custom order CTA */}
        <div className="mt-20 text-center p-12 rounded-3xl bg-gradient-to-r from-blush-50 to-rose-50 border border-rose-100">
          <h2 className="font-serif text-3xl text-gray-800 mb-3">
            Vous ne trouvez pas ce que vous cherchez ?
          </h2>
          <p className="font-sans text-sm text-blush-500 mb-7">
            Chaque création peut être adaptée à vos couleurs et dimensions.
          </p>
          <Link href="/personnalisation" className="btn-primary">
            <Palette size={16} />
            Demander une création sur-mesure
          </Link>
        </div>
      </div>
    </div>
  );
}
