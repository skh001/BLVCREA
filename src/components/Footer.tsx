import Link from 'next/link';
import { Instagram, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-rose-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <span className="font-serif italic text-4xl text-blush-600">BLVCréa</span>
            <p className="mt-3 font-sans text-sm text-blush-500 leading-relaxed max-w-xs">
              Chaque pièce est tissée avec amour et patience. Un art transmis, une passion partagée.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-blush-400 mb-4">Boutique</p>
            <ul className="space-y-3">
              {[
                { href: '/',                label: 'Accueil' },
                { href: '/boutique',        label: 'Boutique' },
                { href: '/personnalisation', label: 'Sur-mesure — 29 €' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-sm text-blush-600 hover:text-blush-800 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-blush-400 mb-4">Informations légales</p>
            <ul className="space-y-3">
              {[
                { href: '/cgv',                        label: 'Conditions générales de vente' },
                { href: '/politique-remboursement',     label: 'Politique de remboursement' },
                { href: '/politique-confidentialite',   label: 'Politique de confidentialité' },
                { href: '/mentions-legales',            label: 'Mentions légales' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-sm text-blush-600 hover:text-blush-800 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-blush-400 mb-4">Contact</p>
            <div className="space-y-3">
              <a href="mailto:contact@blvcrea.fr"
                className="flex items-center gap-2 font-sans text-sm text-blush-600 hover:text-blush-800 transition-colors">
                <Mail size={14} />
                contact@blvcrea.fr
              </a>
              <a href="https://instagram.com/blvcrea" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 font-sans text-sm text-blush-600 hover:text-blush-800 transition-colors">
                <Instagram size={14} />
                @blvcrea
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-rose-50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-blush-300">
            © {new Date().getFullYear()} BLVCréa. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/cgv" className="font-sans text-xs text-blush-300 hover:text-blush-500 transition-colors">CGV</Link>
            <span className="text-blush-200">·</span>
            <Link href="/politique-confidentialite" className="font-sans text-xs text-blush-300 hover:text-blush-500 transition-colors">Confidentialité</Link>
            <span className="text-blush-200">·</span>
            <Link href="/mentions-legales" className="font-sans text-xs text-blush-300 hover:text-blush-500 transition-colors">Mentions légales</Link>
          </div>
          <p className="flex items-center gap-1 font-sans text-xs text-blush-300">
            Fait avec <Heart size={10} className="text-blush-400 fill-blush-400" /> en France
          </p>
        </div>
      </div>
    </footer>
  );
}
