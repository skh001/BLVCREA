'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/boutique', label: 'Boutique' },
  { href: '/personnalisation', label: 'Sur-mesure' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm shadow-rose-100/60' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none group">
          <span className="font-script text-3xl text-blush-600 group-hover:text-blush-700 transition-colors">
            BLVCréa
          </span>
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-blush-400 -mt-1">
            Macramé Artisanal
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-sm tracking-widest uppercase text-blush-700 hover:text-blush-500 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-blush-400 after:transition-all hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/boutique" className="btn-primary text-xs py-2.5 px-6">
            <ShoppingBag size={14} />
            Commander
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-blush-600 hover:text-blush-800 transition-colors"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-rose-100 px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-sans text-base tracking-widest uppercase text-blush-700 hover:text-blush-500 transition-colors"
            >
              {l.label}
            </Link>
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
