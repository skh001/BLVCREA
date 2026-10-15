'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, ChevronDown } from 'lucide-react';

export interface NavCategory {
  title: string;
  slug: string;
}

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/boutique', label: 'Boutique' },
  { href: '/personnalisation', label: 'Sur-mesure' },
];

export default function Navbar({ categories = [] }: { categories?: NavCategory[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the mobile menu after any navigation
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm shadow-purple-100/60' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span className="font-serif italic font-medium text-3xl text-purple-950 group-hover:text-purple-700 transition-colors">
            BLVCréa
          </span>
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-purple-600 -mt-1">
            Macramé Artisanal
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) =>
            l.href === '/boutique' && categories.length > 0 ? (
              <div key={l.href} className="relative group">
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-1 font-sans text-sm tracking-widest uppercase text-purple-900 hover:text-purple-600 transition-colors"
                >
                  {l.label}
                  <ChevronDown size={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200">
                  <div className="min-w-[220px] bg-white rounded-2xl shadow-xl shadow-purple-100/60 border border-purple-50 py-2">
                    <Link href="/boutique" className="block px-5 py-2.5 font-sans text-sm text-purple-900 hover:bg-purple-50 transition-colors">
                      Tout voir
                    </Link>
                    <div className="h-px bg-purple-50 my-1" />
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/boutique/${c.slug}`}
                        className={`block px-5 py-2.5 font-sans text-sm hover:bg-purple-50 transition-colors ${
                          pathname === `/boutique/${c.slug}` ? 'text-purple-600 font-medium' : 'text-purple-900'
                        }`}
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="font-sans text-sm tracking-widest uppercase text-purple-900 hover:text-purple-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-purple-500 after:transition-all hover:after:w-full"
              >
                {l.label}
              </Link>
            )
          )}
          <Link href="/boutique" className="btn-primary text-xs py-2.5 px-6">
            <ShoppingBag size={14} />
            Commander
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-purple-900 hover:text-purple-600 transition-colors"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden bg-white/98 backdrop-blur-md border-t border-purple-100 px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <div key={l.href} className="flex flex-col gap-3">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-sans text-base tracking-widest uppercase text-purple-900 hover:text-purple-600 transition-colors"
              >
                {l.label}
              </Link>
              {l.href === '/boutique' && categories.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-1">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/boutique/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="font-sans text-xs px-3 py-1.5 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href="/boutique" onClick={() => setOpen(false)} className="btn-primary mt-2 text-sm">
            <ShoppingBag size={16} />
            Commander maintenant
          </Link>
        </div>
      )}
    </header>
  );
}