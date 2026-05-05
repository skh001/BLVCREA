import CustomOrderForm from '@/components/CustomOrderForm';
import { Sparkles, Clock, Mail, Tag } from 'lucide-react';

export const metadata = {
  title: 'Création Sur-Mesure — BLVCréa',
  description: 'Commandez une création macramé personnalisée. Prix fixe : 29 €. Livraison 7 jours.',
};

const steps = [
  { icon: Mail,     num: '01', title: 'Décrivez votre idée',    desc: 'Remplissez le formulaire avec vos envies, couleurs et une photo si vous avez.' },
  { icon: Sparkles, num: '02', title: 'Nous créons pour vous',  desc: 'Votre pièce unique est tissée avec soin en 7 jours ouvrés.' },
  { icon: Clock,    num: '03', title: 'Livraison à domicile',   desc: 'Emballée avec amour et livrée directement chez vous.' },
];

export default function PersonnalisationPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">Création unique</p>
          <h1 className="font-serif text-5xl sm:text-6xl text-gray-800 mb-4">
            Votre pièce <em className="text-blush-500">sur-mesure</em>
          </h1>
          <div className="divider max-w-xs mx-auto mb-6">
            <span className="font-script text-blush-300 text-lg">personnalisation</span>
          </div>

          {/* Prix fixe hero badge */}
          <div className="inline-flex items-center gap-3 bg-white border-2 border-blush-200 rounded-full px-8 py-4 shadow-sm shadow-blush-100">
            <Tag size={20} className="text-blush-500" />
            <span className="font-sans text-sm text-blush-500 font-medium">Prix unique pour toute création</span>
            <span className="font-serif text-3xl text-blush-600 font-light">29 €</span>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {steps.map(({ icon: Icon, num, title, desc }, i) => (
            <div key={num} className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-rose-50 shadow-sm animate-fade-up"
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'forwards' }}>
              <span className="font-script text-5xl text-blush-100 absolute top-4 right-6 leading-none select-none">{num}</span>
              <div className="w-14 h-14 rounded-2xl bg-petal flex items-center justify-center mb-4">
                <Icon size={22} className="text-blush-500" />
              </div>
              <h3 className="font-serif text-lg text-gray-800 mb-2">{title}</h3>
              <p className="font-sans text-xs text-blush-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left sidebar */}
          <div className="lg:col-span-2 lg:sticky lg:top-28 space-y-5">

            {/* Prix detail */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blush-50 to-rose-50 border border-rose-100">
              <h2 className="font-serif text-xl text-gray-800 mb-4">Ce qui est inclus</h2>
              <ul className="space-y-3">
                {[
                  '✦ Création 100% faite main',
                  '✦ Couleur de votre choix',
                  '✦ Motifs adaptés à votre description',
                  '✦ Dimensions personnalisées',
                  '✦ Emballage cadeau soigné',
                  '✦ Livraison France incluse',
                ].map(item => (
                  <li key={item} className="font-sans text-sm text-blush-600 leading-relaxed">{item}</li>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t border-rose-100 flex items-center justify-between">
                <span className="font-sans text-sm text-blush-500">Prix total</span>
                <span className="font-serif text-4xl text-blush-600 font-light">29 €</span>
              </div>
              <p className="font-sans text-xs text-blush-400 mt-1">Paiement après envoi du formulaire, par lien sécurisé.</p>
            </div>

            {/* Délai */}
            <div className="p-5 rounded-3xl bg-white border border-rose-50 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-petal flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-blush-500" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-gray-800">Délai de fabrication</p>
                  <p className="font-sans text-xs text-blush-400 mt-0.5 leading-relaxed">
                    7 jours ouvrés après réception du paiement. Expédition en colissimo suivi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-rose-50 shadow-sm">
              <h2 className="font-serif text-2xl text-gray-800 mb-2">Dites-nous tout 🌸</h2>
              <p className="font-sans text-sm text-blush-400 mb-8">
                Plus vous partagez de détails, plus nous créons la pièce parfaite pour vous.
              </p>
              <CustomOrderForm />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
