import CustomOrderForm from '@/components/CustomOrderForm';
import PaymentErrorNotice from '@/components/PaymentErrorNotice';
import { Sparkles, Clock, Mail, Tag } from 'lucide-react';
import { getCustomSizes } from '@/lib/sanity';
import { DEFAULT_CUSTOM_SIZES, minSizePrice } from '@/lib/catalog';

// Prices come from the admin "Tarifs" page; admin saves purge this cache immediately.
export const revalidate = 60;

export const metadata = {
  title: 'Création Sur-Mesure — BLVCréa',
  description: 'Commandez une création macramé personnalisée. Tarif selon la taille, livraison offerte.',
  alternates: { canonical: '/personnalisation' },
};

const steps = [
  { icon: Mail,     num: '01', title: 'Votre demande',    desc: 'Décrivez vos envies (dimensions, couleurs, style) via le formulaire.' },
  { icon: Sparkles, num: '02', title: 'Paiement & Création', desc: 'Vous recevez le lien de paiement, puis votre pièce est tissée avec soin.' },
  { icon: Clock,    num: '03', title: 'Livraison offerte', desc: 'Emballée avec amour et livrée gratuitement chez vous.' },
];

export default async function PersonnalisationPage() {
  const sizes = await getCustomSizes().catch(() => DEFAULT_CUSTOM_SIZES);
  const fromPrice = minSizePrice(sizes);

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-purple-400 mb-3">Création unique</p>
          <h1 className="font-serif text-5xl sm:text-6xl text-gray-800 mb-4">
            Votre pièce <em className="text-purple-500">sur-mesure</em>
          </h1>
          <div className="divider max-w-xs mx-auto mb-6">
            <span className="font-script text-purple-300 text-lg">personnalisation</span>
          </div>

          {/* Badge prix selon la taille */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-full px-8 py-3 shadow-sm shadow-purple-100">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-purple-500" />
              <span className="font-sans text-sm text-purple-600 font-medium">
                Tarif selon la taille{fromPrice !== null && <> · dès {fromPrice.toLocaleString('fr-FR')} €</>}
              </span>
            </div>
            <span className="hidden sm:block text-purple-300">|</span>
            <span className="font-sans text-xs text-purple-500 uppercase tracking-wider">Livraison incluse</span>
          </div>
        </div>

        <PaymentErrorNotice />

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {steps.map(({ icon: Icon, num, title, desc }, i) => (
            <div key={num} className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-purple-100 shadow-sm animate-fade-up"
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'forwards' }}>
              <span className="font-script text-5xl text-purple-100 absolute top-4 right-6 leading-none select-none">{num}</span>
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                <Icon size={22} className="text-purple-500" />
              </div>
              <h3 className="font-serif text-lg text-gray-800 mb-2">{title}</h3>
              <p className="font-sans text-xs text-purple-500/80 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left sidebar */}
          <div className="lg:col-span-2 lg:sticky lg:top-28 space-y-5">

            {/* Comment ça marche detail */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 shadow-sm">
              <h2 className="font-serif text-xl text-gray-800 mb-4">Comment ça marche ?</h2>
              <ul className="space-y-4">
                {[
                  '✦ Vous détaillez votre projet (taille, couleur...)',
                  '✦ Le prix dépend de la taille choisie',
                  '✦ Vous réglez via un lien Stripe sécurisé',
                  '✦ Création 100% artisanale et unique',
                  '✦ Livraison France offerte',
                ].map(item => (
                  <li key={item} className="font-sans text-sm text-purple-700 leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            {/* Délai */}
            <div className="p-5 rounded-3xl bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-purple-500" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-gray-800">Délai de fabrication</p>
                  <p className="font-sans text-xs text-purple-500/80 mt-0.5 leading-relaxed">
                    Variable selon la complexité, débuté après réception du paiement. Expédition en colissimo suivi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-sm">
              <h2 className="font-serif text-2xl text-gray-800 mb-2">Dites-nous tout ✨</h2>
              <p className="font-sans text-sm text-purple-500/80 mb-8">
                Choisissez la taille, puis partagez vos envies (couleurs, motif, occasion…) pour une création parfaite.
              </p>
              <CustomOrderForm sizes={sizes} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}