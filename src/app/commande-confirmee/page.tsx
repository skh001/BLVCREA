import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Commande confirmée — BLVCréa',
};

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-24 px-6">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 mb-8">
          <CheckCircle size={44} className="text-green-500" />
        </div>

        <span className="font-script text-5xl text-blush-400 block mb-4">Merci !</span>
        <h1 className="font-serif text-4xl text-gray-800 mb-4">Commande confirmée</h1>
        <p className="font-sans text-blush-500 leading-relaxed mb-4">
          Votre paiement a bien été reçu. Votre création en macramé est maintenant en préparation.
        </p>
        <p className="font-sans text-blush-400 text-sm leading-relaxed mb-10">
          Vous recevrez un email de confirmation et un numéro de suivi dès l&apos;expédition. Livraison estimée : <strong className="text-blush-600">7 jours ouvrés</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/boutique" className="btn-secondary">
            Continuer mes achats
          </Link>
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
