import Link from 'next/link';
import Image from 'next/image';
import { urlFor, getMainImage, getCategoryLabel, type Product } from '@/lib/sanity';
import { ShoppingBag, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  delay?: number;
}

export default function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const mainImage = getMainImage(product);
  const imageUrl = mainImage ? urlFor(mainImage).width(600).height(700).url() : null;
  const categoryLabel = getCategoryLabel(product);

  return (
    <article
      className="product-card animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <Link href={`/produit/${product.slug.current}`}>
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-petal">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-script text-5xl text-blush-200">BLV</span>
            </div>
          )}

          {/* Badge out of stock */}
          {!product.inStock && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-blush-500 text-xs font-sans font-medium px-3 py-1 rounded-full">
              Indisponible
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <span className="bg-white text-blush-700 font-sans text-xs tracking-widest uppercase px-5 py-2.5 rounded-full">
              Voir le produit
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-serif text-lg text-gray-800 mb-1 line-clamp-1">{product.title}</h3>
          {categoryLabel && (
            <p className="font-sans text-xs text-blush-400 uppercase tracking-wider mb-3">
              {categoryLabel}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl text-blush-600 font-light">
              {formatPrice(product.price)}
            </span>
            <div className="flex items-center gap-1 text-blush-400">
              <Clock size={12} />
              <span className="font-sans text-xs">7 jours</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Buy button */}
      <div className="px-5 pb-5">
        {product.inStock ? (
          <Link href={`/produit/${product.slug.current}`} className="btn-primary w-full text-xs py-3">
            <ShoppingBag size={14} />
            Acheter
          </Link>
        ) : (
          <button disabled className="w-full py-3 rounded-full bg-gray-100 text-gray-400 font-sans text-xs tracking-widest uppercase cursor-not-allowed">
            Indisponible
          </button>
        )}
      </div>
    </article>
  );
}
