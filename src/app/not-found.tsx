import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-md">
        <span className="font-script text-8xl text-blush-200 block mb-4">404</span>
        <h1 className="font-serif text-3xl text-gray-800 mb-4">Page introuvable</h1>
        <p className="font-sans text-blush-500 mb-8">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link href="/" className="btn-primary">
          <ArrowLeft size={16} />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
