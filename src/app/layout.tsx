import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCategories } from '@/lib/sanity';
import { getSiteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  // Makes canonical and Open Graph URLs absolute
  metadataBase: new URL(getSiteUrl()),
  title: 'BLVCréa — Macramé Artisanal Fait Main',
  description:
    'Découvrez nos créations en macramé faites à la main avec amour. Suspensions murales, rideaux, cadres décoratifs et commandes personnalisées.',
  keywords: ['macramé', 'artisanal', 'fait main', 'décoration', 'suspension murale'],
  openGraph: {
    title: 'BLVCréa — Macramé Artisanal',
    description: 'Créations en macramé faites à la main',
    siteName: 'BLVCréa',
    locale: 'fr_FR',
    type: 'website',
  },
};

// The navigation lists categories from Sanity: refresh static pages at least every minute
// (admin changes purge the cache immediately).
export const revalidate = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Only categories that currently contain products are shown in the navigation.
  const categories = (await getCategories().catch(() => []))
    .filter((c) => (c.count ?? 0) > 0)
    .map(({ title, slug }) => ({ title, slug }));

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-purple-100 via-fuchsia-100 to-purple-300 text-gray-800">
        <Navbar categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
      </body>
    </html>
  );
}