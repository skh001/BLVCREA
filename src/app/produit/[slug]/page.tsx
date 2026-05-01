import { getProductBySlug, getAllProducts, urlFor } from '@/lib/sanity';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Clock, Package, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BuyButton from '@/components/BuyButton';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getAllProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: `${product.title} — BLVCréa`,
    description: product.description || `${product.title}, création macramé fait main.`,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) notFound();

  const imageUrl = product.image ? urlFor(product.image).width(900).height(1100).url() : null;

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Back link */}
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 font-sans text-sm text-blush-500 hover:text-blush-700 transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Retour à la boutique
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Image */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-petal shadow-xl shadow-blush-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-script text-8xl text-blush-200">BLV</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:pt-8 flex flex-col gap-6">
            {product.category && (
              <p className="font-sans text-xs tracking-[0.35em] uppercase text-blush-400">
                {product.category}
              </p>
            )}

            <h1 className="font-serif text-4xl sm:text-5xl text-gray-800 leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-4xl text-blush-600 font-light">
                {product.price.toFixed(2)} €
              </span>
              <span className="font-sans text-xs text-blush-400">TTC</span>
            </div>

            <div className="h-px bg-rose-100" />

            {/* Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-petal">
                <Clock size={18} className="text-blush-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs font-medium text-gray-800">Livraison</p>
                  <p className="font-sans text-xs text-blush-400">7 jours ouvrés</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-petal">
                <Package size={18} className="text-blush-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs font-medium text-gray-800">Emballage</p>
                  <p className="font-sans text-xs text-blush-400">Soigné & cadeau</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-petal">
                <Star size={18} className="text-blush-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs font-medium text-gray-800">Fait main</p>
                  <p className="font-sans text-xs text-blush-400">Pièce unique</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="font-sans text-xs tracking-widest uppercase text-blush-400 mb-3">
                  Description
                </h2>
                <p className="font-sans text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Buy button - client component */}
            {product.inStock ? (
              <BuyButton product={product} />
            ) : (
              <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="font-sans text-sm text-gray-500">Ce produit est actuellement indisponible.</p>
                <Link href="/personnalisation" className="btn-secondary mt-4 text-xs">
                  Demander une création similaire
                </Link>
              </div>
            )}

            {/* Additional info */}
            <p className="font-sans text-xs text-blush-400 text-center leading-relaxed">
              Paiement sécurisé par Stripe · Livraison soigneusement emballée · Satisfait ou remboursé 14 jours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
