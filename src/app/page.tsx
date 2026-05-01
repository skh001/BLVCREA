import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts } from '@/lib/sanity';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Star, Truck, Palette, Shield } from 'lucide-react';

export const revalidate = 60;

const features = [
  { icon: Star, title: 'Fait main', desc: 'Chaque pièce est unique, tissée avec soin et amour.' },
  { icon: Truck, title: 'Livraison 7 jours', desc: 'Votre création arrive chez vous en une semaine.' },
  { icon: Palette, title: 'Sur-mesure', desc: 'Couleurs et dimensions adaptées à vos envies.' },
  { icon: Shield, title: 'Qualité garantie', desc: 'Matières naturelles et cordages de qualité supérieure.' },
];

export default async function HomePage() {
  const products = await getAllProducts().catch(() => []);
  const featuredProducts = products.filter((p) => p.inStock).slice(0, 6);

  return (
    <>
      {/* ── Hero Section ──────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain-overlay">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-petal via-cream to-rose-50" />

        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blush-100/40 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/6 w-64 h-64 rounded-full bg-rose-100/30 blur-2xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Decorative macramé pattern lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" aria-hidden="true">
          <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c07088" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <p className="animate-fade-up stagger-1 font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-6">
            ✦ Macramé Artisanal Français ✦
          </p>

          {/* Main headline */}
          <h1 className="animate-fade-up stagger-2 font-serif text-5xl sm:text-7xl lg:text-8xl text-gray-800 leading-[1.05] mb-6">
            L&apos;art du fil,
            <br />
            <em className="text-blush-500 font-light">tissé avec amour</em>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-up stagger-3 font-sans text-base sm:text-lg text-blush-600/80 max-w-xl mx-auto leading-relaxed mb-10">
            Suspensions murales, rideaux et créations sur-mesure en macramé. Chaque nœud raconte une histoire.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/boutique" className="btn-primary text-sm px-10 py-4">
              Découvrir la boutique
              <ArrowRight size={16} />
            </Link>
            <Link href="/personnalisation" className="btn-secondary text-sm px-10 py-4">
              Créer ma pièce unique
            </Link>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-up stagger-5 mt-16 flex flex-wrap items-center justify-center gap-6 text-blush-400">
            {['✦ Fait main en France', '✦ Livraison soignée', '✦ Sur-mesure possible'].map((b) => (
              <span key={b} className="font-sans text-xs tracking-wider">{b}</span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="font-sans text-xs text-blush-300 tracking-widest uppercase">Défiler</span>
          <div className="w-px h-8 bg-gradient-to-b from-blush-300 to-transparent" />
        </div>
      </section>

      {/* ── Features strip ───────────────────────────── */}
      <section className="bg-white py-16 border-y border-rose-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}>
              <div className="w-12 h-12 rounded-2xl bg-petal flex items-center justify-center">
                <Icon size={20} className="text-blush-500" />
              </div>
              <h3 className="font-serif text-base text-gray-800">{title}</h3>
              <p className="font-sans text-xs text-blush-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">Nos créations</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-gray-800 mb-4">
            La boutique
          </h2>
          <div className="divider max-w-xs mx-auto">
            <span className="font-script text-blush-300 text-lg">artisanat</span>
          </div>
        </div>

        {featuredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product._id} product={product} delay={i * 100} />
              ))}
            </div>
            <div className="text-center mt-14">
              <Link href="/boutique" className="btn-secondary">
                Voir toute la collection
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="font-script text-5xl text-blush-200 mb-4">Bientôt disponible</p>
            <p className="font-sans text-blush-400">La boutique est en cours de préparation.</p>
          </div>
        )}
      </section>

      {/* ── Custom order CTA banner ───────────────────── */}
      <section className="bg-gradient-to-r from-blush-50 to-rose-50 py-20 border-y border-rose-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-4">Sur-mesure</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-gray-800 mb-5">
            Votre rêve, <em className="text-blush-500">notre création</em>
          </h2>
          <p className="font-sans text-base text-blush-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Vous avez une idée en tête ? Partagez votre inspiration et nous créerons une pièce unique rien que pour vous.
          </p>
          <Link href="/personnalisation" className="btn-primary text-sm px-12 py-4">
            <Palette size={16} />
            Demander une création sur-mesure
          </Link>
        </div>
      </section>
    </>
  );
}
