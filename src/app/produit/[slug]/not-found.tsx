import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="text-center max-w-md">
        <span className="font-script text-7xl text-blush-200 block mb-4">Oups !</span>
        <h1 className="font-serif text-3xl text-gray-800 mb-4">Produit introuvable</h1>
        <p className="font-sans text-blush-500 mb-8 leading-relaxed">
          Ce produit n&apos;existe pas ou n&apos;est plus disponible. Découvrez nos autres créations dans la boutique.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/boutique" className="btn-primary">
            <ShoppingBag size={16} />
            Voir la boutique
          </Link>
          <Link href="/" className="btn-secondary">
            <ArrowLeft size={16} />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
