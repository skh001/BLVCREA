import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BLVCréa — Macramé Artisanal Fait Main',
  description:
    'Découvrez nos créations en macramé faites à la main avec amour. Suspensions murales, rideaux, cadres décoratifs et commandes personnalisées.',
  keywords: ['macramé', 'artisanal', 'fait main', 'décoration', 'suspension murale'],
  openGraph: {
    title: 'BLVCréa — Macramé Artisanal',
    description: 'Créations en macramé faites à la main',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-purple-100 via-fuchsia-100 to-purple-300 text-gray-800">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}