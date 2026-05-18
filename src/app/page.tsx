import Link from 'next/link';
import { getAllProducts } from '@/lib/sanity';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Star, Truck, Palette, Shield } from 'lucide-react';

export const revalidate = 60;

const features = [
  { icon: Star,    title: 'Fait main',         desc: 'Chaque pièce est unique, tissée avec soin et amour.' },
  { icon: Truck,   title: 'Livraison 7 jours', desc: 'Votre création arrive chez vous en une semaine.' },
  { icon: Palette, title: 'Sur-mesure',         desc: 'Couleurs et dimensions adaptées à vos envies.' },
  { icon: Shield,  title: 'Qualité garantie',   desc: 'Matières naturelles et cordages de qualité supérieure.' },
];

export default async function HomePage() {
  const products = await getAllProducts().catch(() => []);
  const featuredProducts = products.filter((p) => p.inStock).slice(0, 6);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">

        {/* Le fond global est maintenant géré dans layout.tsx */}

        {/* Animated blobs */}
        <div className="absolute top-1/4 right-1/5 w-[500px] h-[500px] rounded-full bg-blush-100/50 blur-[80px] animate-float" />
        <div className="absolute bottom-1/4 left-1/6  w-[350px] h-[350px] rounded-full bg-rose-100/40  blur-[60px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3   right-1/3  w-[200px] h-[200px] rounded-full bg-blush-200/30 blur-[40px] animate-float" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c07088" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Decorative SVG macramé knot — top right */}
        <div className="absolute top-24 right-8 lg:right-20 opacity-10 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <circle cx="60" cy="60" r="55" stroke="#c07088" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="60" cy="60" r="38" stroke="#c07088" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="60" cy="60" r="20" stroke="#c07088" strokeWidth="1.5" />
            <line x1="60" y1="5"  x2="60"  y2="115" stroke="#c07088" strokeWidth="0.8" strokeDasharray="3 5" />
            <line x1="5"  y1="60" x2="115" y2="60"  stroke="#c07088" strokeWidth="0.8" strokeDasharray="3 5" />
            <line x1="20" y1="20" x2="100" y2="100" stroke="#c07088" strokeWidth="0.6" strokeDasharray="2 6" />
            <line x1="100" y1="20" x2="20" y2="100" stroke="#c07088" strokeWidth="0.6" strokeDasharray="2 6" />
          </svg>
        </div>

        {/* Decorative hanging threads — left */}
        <div className="absolute left-8 lg:left-16 top-32 flex gap-3 opacity-15 pointer-events-none animate-float" style={{ animationDelay: '3s' }}>
          {[80, 120, 60, 100, 75].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-0.5 bg-gradient-to-b from-blush-400 to-transparent rounded-full" style={{ height: h }} />
              <div className="w-2 h-2 rounded-full bg-blush-300" />
            </div>
          ))}
        </div>

        {/* Decorative hanging threads — right bottom */}
        <div className="absolute right-12 lg:right-24 bottom-32 flex gap-2.5 opacity-10 pointer-events-none animate-float" style={{ animationDelay: '2.5s' }}>
          {[60, 90, 45, 70].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-0.5 bg-gradient-to-b from-rose-300 to-transparent rounded-full" style={{ height: h }} />
              <div className="w-1.5 h-1.5 rounded-full bg-rose-200" />
            </div>
          ))}
        </div>

        {/* Small floating sparkles */}
        {[
          { top: '20%', left: '15%', size: 6,  delay: '0s'   },
          { top: '35%', right: '12%', size: 4, delay: '1.5s' },
          { top: '65%', left: '22%', size: 5,  delay: '3s'   },
          { top: '75%', right: '18%', size: 4, delay: '2s'   },
          { top: '15%', left: '45%', size: 3,  delay: '4s'   },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blush-300/60 animate-float pointer-events-none"
            style={{
              top: s.top, left: (s as any).left, right: (s as any).right,
              width: s.size, height: s.size,
              animationDelay: s.delay,
              filter: 'blur(1px)',
            }}
          />
        ))}

        {/* Main content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

          {/* Eyebrow with decorative lines */}
          <div className="animate-fade-up stagger-1 flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blush-300" />
            <p className="font-sans text-xs tracking-[0.45em] uppercase text-blush-400">
              Macramé Artisanal Français
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blush-300" />
          </div>

          {/* Main headline */}
          <h1 className="animate-fade-up stagger-2 font-serif leading-[1.05] mb-6">
            <span className="block text-5xl sm:text-7xl lg:text-8xl text-gray-800">L&apos;art du fil,</span>
            <span className="block text-5xl sm:text-7xl lg:text-8xl">
              <em className="text-blush-500 font-light italic">tissé avec amour</em>
            </span>
          </h1>

          {/* Script accent */}
          <div className="animate-fade-up stagger-2 flex justify-center mb-6">
            <span className="font-script text-3xl text-blush-300/80">BLVCréa</span>
          </div>

          {/* Sub-headline */}
          <p className="animate-fade-up stagger-3 font-sans text-base sm:text-lg text-blush-600/75 max-w-xl mx-auto leading-relaxed mb-10">
            Suspensions murales, rideaux et créations sur-mesure en macramé.
            <br className="hidden sm:block" />
            Chaque nœud raconte une histoire.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/boutique" className="btn-primary text-sm px-10 py-4 group">
              Découvrir la boutique
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/personnalisation" className="btn-secondary text-sm px-10 py-4">
              Créer ma pièce sur-mesure
            </Link>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-up stagger-5 flex flex-wrap items-center justify-center gap-6">
            {['✦ Fait main en France', '✦ Livraison offerte', '✦ Créations personnalisées'].map((b) => (
              <span key={b} className="font-sans text-xs tracking-wider text-blush-400/80">{b}</span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-sans text-[10px] text-blush-300 tracking-[0.3em] uppercase">Défiler</span>
          <div className="w-px h-10 bg-gradient-to-b from-blush-300 to-transparent animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-blush-300 animate-bounce" />
        </div>
      </section>

      {/* ── Features strip ───────────────────────────── */}
      <section className="relative bg-white/50 py-16 border-y border-rose-50 overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#fdf0f2_0%,_transparent_70%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-3 animate-fade-up group"
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'forwards' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-petal flex items-center justify-center transition-all duration-300 group-hover:bg-blush-100 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-blush-100">
                <Icon size={22} className="text-blush-500" />
              </div>
              <h3 className="font-serif text-base text-gray-800">{title}</h3>
              <p className="font-sans text-xs text-blush-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ─────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-12 py-24 overflow-hidden">

        {/* Decorative background blob */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blush-50/60 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-rose-50/60 blur-[60px] pointer-events-none" />

        <div className="relative text-center mb-16">
          {/* Top ornament */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blush-200" />
            <span className="text-blush-300 text-lg">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blush-200" />
          </div>

          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">Nos créations</p>
          <h2 className="font-serif text-4xl sm:text-5xl text-gray-800 mb-5">La boutique</h2>

          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-blush-200" />
            <span className="font-script text-2xl text-blush-300">artisanat</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-blush-200" />
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
              <Link href="/boutique" className="btn-secondary group">
                Voir toute la collection
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              {/* Decorative hanging threads placeholder */}
              <div className="flex gap-3 opacity-20 mb-4">
                {[60, 90, 50, 80, 65, 75].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-0.5 bg-gradient-to-b from-blush-400 to-transparent rounded-full" style={{ height: h }} />
                    <div className="w-2 h-2 rounded-full bg-blush-300" />
                  </div>
                ))}
              </div>
              <p className="font-script text-5xl text-blush-200">Bientôt disponible</p>
              <p className="font-sans text-blush-400 text-sm">La boutique est en cours de préparation.</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Custom order CTA banner ───────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />

        {/* Top border ornament */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blush-200 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blush-200 to-transparent" />

        {/* Decorative large script behind */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-script text-[160px] sm:text-[220px] text-blush-100/50 whitespace-nowrap leading-none">
            sur-mesure
          </span>
        </div>

        {/* Decorative knot left */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none animate-float hidden lg:block">
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none" aria-hidden="true">
            <circle cx="80" cy="80" r="72" stroke="#c07088" strokeWidth="1.5" strokeDasharray="8 5" />
            <circle cx="80" cy="80" r="50" stroke="#c07088" strokeWidth="1" strokeDasharray="5 8" />
            <circle cx="80" cy="80" r="28" stroke="#c07088" strokeWidth="2" />
            <circle cx="80" cy="80" r="8"  fill="#c07088" />
            <line x1="80" y1="8"   x2="80"  y2="152" stroke="#c07088" strokeWidth="0.8" strokeDasharray="4 6" />
            <line x1="8"  y1="80"  x2="152" y2="80"  stroke="#c07088" strokeWidth="0.8" strokeDasharray="4 6" />
            <line x1="28" y1="28"  x2="132" y2="132" stroke="#c07088" strokeWidth="0.6" strokeDasharray="3 7" />
            <line x1="132" y1="28" x2="28"  y2="132" stroke="#c07088" strokeWidth="0.6" strokeDasharray="3 7" />
          </svg>
        </div>

        {/* Decorative knot right */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <circle cx="60" cy="60" r="55" stroke="#c07088" strokeWidth="1.5" strokeDasharray="6 4" />
            <circle cx="60" cy="60" r="35" stroke="#c07088" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="60" cy="60" r="15" stroke="#c07088" strokeWidth="2" />
            <circle cx="60" cy="60" r="5"  fill="#c07088" />
            <line x1="60" y1="5"   x2="60"  y2="115" stroke="#c07088" strokeWidth="0.8" strokeDasharray="3 5" />
            <line x1="5"  y1="60"  x2="115" y2="60"  stroke="#c07088" strokeWidth="0.8" strokeDasharray="3 5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-4">Sur-mesure</p>

          <h2 className="font-serif text-4xl sm:text-5xl text-gray-800 mb-5 leading-tight">
            Votre rêve,{' '}
            <em className="text-blush-500">notre création</em>
          </h2>

          {/* Info pill */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blush-200 rounded-full px-6 py-2.5 mb-6 shadow-sm">
            <span className="font-sans text-sm text-blush-500 font-medium">Prix sur devis</span>
            <span className="font-sans text-xs text-blush-400">· livraison gratuite incluse</span>
          </div>

          <p className="font-sans text-base text-blush-500/80 max-w-lg mx-auto mb-10 leading-relaxed">
            Le tarif s'adaptera selon la taille et la complexité de votre demande. Partagez votre inspiration (diamètre, longueur, couleurs) et nous créerons une pièce unique rien que pour vous.
          </p>

          <Link href="/personnalisation" className="btn-primary text-sm px-12 py-4 group">
            <Palette size={16} />
            Demander une création sur-mesure
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Small trust row */}
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {['🧵 Fait main', '🚚 7 jours', '💳 Paiement sécurisé', '↩ Satisfait ou remboursé'].map(t => (
              <span key={t} className="font-sans text-xs text-blush-400">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}