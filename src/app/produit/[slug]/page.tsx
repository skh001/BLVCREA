import { getProductBySlug, getAllProducts, urlFor, getCategoryLabel } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import { Truck, Package, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BuyButton from '@/components/BuyButton';
import ProductGallery, { type GalleryImage } from '@/components/ProductGallery';
import FormattedText from '@/components/FormattedText';
import { formatPrice, getSiteUrl, toSingleLine, truncate } from '@/lib/utils';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getAllProducts().catch(() => []);
  return products.filter((p) => p.slug?.current).map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) return { title: 'Produit introuvable' };
  const description = product.description
    ? truncate(toSingleLine(product.description), 160)
    : `${product.title}, création macramé fait main.`;
  const ogImage = product.images[0] ? urlFor(product.images[0]).width(1200).height(630).url() : undefined;
  return {
    title: `${product.title} — BLVCréa`,
    description,
    alternates: { canonical: `/produit/${product.slug.current}` },
    openGraph: { title: product.title, description, images: ogImage ? [ogImage] : undefined },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) notFound();

  // Every URL is derived from this product's own image assets.
  const gallery: GalleryImage[] = product.images.map((img) => ({
    id: img._key || img.asset._ref,
    src: urlFor(img).width(900).height(1100).url(),
    thumb: urlFor(img).width(200).height(240).url(),
  }));
  const categoryLabel = getCategoryLabel(product);

  // schema.org structured data (rich results in Google)
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/produit/${product.slug.current}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description ? truncate(toSingleLine(product.description), 500) : undefined,
      image: product.images.map((img) => urlFor(img).width(1200).url()),
      category: categoryLabel || undefined,
      brand: { '@type': 'Brand', name: 'BLVCréa' },
      url: productUrl,
      offers: {
        '@type': 'Offer',
        price: product.price.toFixed(2),
        priceCurrency: 'EUR',
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: productUrl,
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'EUR' },
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Boutique', item: `${siteUrl}/boutique` },
        ...(product.category
          ? [{ '@type': 'ListItem', position: 2, name: categoryLabel, item: `${siteUrl}/boutique/${product.category}` }]
          : []),
        { '@type': 'ListItem', position: product.category ? 3 : 2, name: product.title, item: productUrl },
      ],
    },
  ];

  return (
    <div className="pt-28 pb-24">
      <script
        type="application/ld+json"
        // `<` is escaped so product text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 font-sans text-sm text-blush-500 mb-10" aria-label="Fil d'Ariane">
          <Link href="/boutique" className="inline-flex items-center gap-2 hover:text-blush-700 transition-colors">
            <ArrowLeft size={16} />
            Boutique
          </Link>
          {product.category && (
            <>
              <span className="text-blush-300">/</span>
              <Link href={`/boutique/${product.category}`} className="hover:text-blush-700 transition-colors">
                {categoryLabel}
              </Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Gallery */}
          <ProductGallery key={product._id} images={gallery} title={product.title} />

          {/* Details */}
          <div className="lg:pt-8 flex flex-col gap-6">
            {product.category && (
              <Link
                href={`/boutique/${product.category}`}
                className="font-sans text-xs tracking-[0.35em] uppercase text-blush-400 hover:text-blush-600 transition-colors w-fit"
              >
                {categoryLabel}
              </Link>
            )}

            <h1 className="font-serif text-4xl sm:text-5xl text-gray-800 leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-4xl text-blush-600 font-light">
                {formatPrice(product.price)}
              </span>
              <span className="font-sans text-xs text-blush-400">TTC · livraison offerte</span>
            </div>

            <div className="h-px bg-rose-100" />

            {/* Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-petal">
                <Truck size={18} className="text-blush-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-sans text-xs font-medium text-gray-800">Livraison offerte</p>
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
                <FormattedText
                  text={product.description}
                  className="font-sans text-sm text-gray-600 leading-relaxed"
                />
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
              Paiement sécurisé par Stripe · Livraison offerte et soigneusement emballée · Satisfait ou remboursé 14 jours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
