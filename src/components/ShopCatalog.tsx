import Link from 'next/link';
import { Palette } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/sanity';
import type { Category } from '@/lib/catalog';

interface ShopCatalogProps {
  products: Product[];
  categories: Category[];
  /** Active category slug — null for "Tout voir" */
  activeSlug: string | null;
  title: string;
  eyebrow?: string;
}

/** Shared layout for /boutique and /boutique/[categorie] */
export default function ShopCatalog({ products, categories, activeSlug, title, eyebrow = 'Créations faites main' }: ShopCatalogProps) {
  // Only show categories that contain products (plus the one being viewed),
  // so a filter never leads to an empty page.
  const visible = categories.filter((c) => (c.count ?? 0) > 0 || c.slug === activeSlug);
  const totalCount = categories.reduce((sum, c) => sum + (c.count ?? 0), 0);

  const pill = (active: boolean) =>
    `font-sans text-xs tracking-widest uppercase px-5 py-2.5 rounded-full border transition-all duration-200 ${
      active
        ? 'bg-purple-500 text-white border-purple-500'
        : 'border-purple-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50'
    }`;

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">{eyebrow}</p>
          <h1 className="font-serif text-5xl sm:text-6xl text-gray-800 mb-4">{title}</h1>
          <div className="divider max-w-xs mx-auto">
            <span className="font-script text-blush-300 text-lg">collection</span>
          </div>
        </div>

        {/* Category filters */}
        <nav aria-label="Catégories" className="flex flex-wrap justify-center gap-3 mb-12">
          <Link href="/boutique" className={pill(activeSlug === null)} aria-current={activeSlug === null ? 'page' : undefined}>
            Tout voir
          </Link>
          {visible.map((cat) => (
            <Link
              key={cat.slug}
              href={`/boutique/${cat.slug}`}
              className={pill(activeSlug === cat.slug)}
              aria-current={activeSlug === cat.slug ? 'page' : undefined}
            >
              {cat.title}
              {(cat.count ?? 0) > 0 && <span className="ml-1.5 opacity-60">({cat.count})</span>}
            </Link>
          ))}
        </nav>

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} delay={Math.min(i, 8) * 80} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-script text-6xl text-purple-200 mb-4">Vide pour l&apos;instant</p>
            <p className="font-sans text-purple-400 mb-8">
              {activeSlug === null
                ? 'Aucun produit disponible pour le moment.'
                : 'Aucun produit dans cette catégorie pour le moment.'}
            </p>
            {activeSlug !== null && totalCount > 0 && (
              <Link href="/boutique" className="btn-secondary">
                Voir tous les produits
              </Link>
            )}
          </div>
        )}

        {/* Custom order CTA */}
        <div className="mt-20 text-center p-12 rounded-3xl bg-white/40 backdrop-blur-sm border border-purple-100 shadow-sm">
          <h2 className="font-serif text-3xl text-gray-800 mb-3">
            Vous ne trouvez pas ce que vous cherchez ?
          </h2>
          <p className="font-sans text-sm text-purple-600 mb-7">
            Le tarif s&apos;adapte à la taille de votre création — livraison offerte.
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
