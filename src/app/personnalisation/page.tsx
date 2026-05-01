import CustomOrderForm from '@/components/CustomOrderForm';
import { Sparkles, Clock, Mail } from 'lucide-react';

export const metadata = {
  title: 'Création Sur-Mesure — BLVCréa',
  description: 'Commandez une création macramé personnalisée aux couleurs et dimensions de vos rêves.',
};

const steps = [
  { icon: Mail, num: '01', title: 'Décrivez votre idée', desc: 'Remplissez le formulaire ci-dessous avec vos envies.' },
  { icon: Sparkles, num: '02', title: 'Nous créons pour vous', desc: 'Votre pièce est tissée avec soin en 7 jours.' },
  { icon: Clock, num: '03', title: 'Livraison à domicile', desc: 'Emballée avec amour, livrée chez vous.' },
];

export default function PersonnalisationPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">
            Création unique
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-gray-800 mb-4">
            Votre pièce <em className="text-blush-500">sur-mesure</em>
          </h1>
          <div className="divider max-w-xs mx-auto mb-6">
            <span className="font-script text-blush-300 text-lg">personnalisation</span>
          </div>
          <p className="font-sans text-base text-blush-500 max-w-lg mx-auto leading-relaxed">
            Chaque foyer est unique. Partagez votre vision et nous créerons une pièce en macramé à votre image, dans les couleurs et dimensions qui vous correspondent.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map(({ icon: Icon, num, title, desc }, i) => (
            <div
              key={num}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-rose-50 shadow-sm animate-fade-up"
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'forwards' }}
            >
              <span className="font-script text-5xl text-blush-100 absolute top-4 right-6 leading-none select-none">
                {num}
              </span>
              <div className="w-14 h-14 rounded-2xl bg-petal flex items-center justify-center mb-4">
                <Icon size={22} className="text-blush-500" />
              </div>
              <h3 className="font-serif text-lg text-gray-800 mb-2">{title}</h3>
              <p className="font-sans text-xs text-blush-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Main form card */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left: context */}
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blush-50 to-rose-50 border border-rose-100">
              <h2 className="font-serif text-2xl text-gray-800 mb-4">
                Pourquoi choisir le sur-mesure ?
              </h2>
              <ul className="space-y-4">
                {[
                  '✦ Couleurs assorties à votre intérieur',
                  '✦ Dimensions adaptées à votre espace',
                  '✦ Motifs et nœuds personnalisés',
                  '✦ Cadeau unique et inoubliable',
                  '✦ Devis gratuit sous 48h',
                ].map((item) => (
                  <li key={item} className="font-sans text-sm text-blush-600 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-rose-100">
                <p className="font-sans text-xs text-blush-400 leading-relaxed">
                  <strong className="text-blush-600">Délai estimé :</strong> 7 jours ouvrés après validation du devis.
                </p>
                <p className="font-sans text-xs text-blush-400 leading-relaxed mt-2">
                  <strong className="text-blush-600">Tarif :</strong> À partir de 45 € selon les dimensions et la complexité.
                </p>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-rose-50 shadow-sm">
              <h2 className="font-serif text-2xl text-gray-800 mb-2">
                Dites-nous tout 🌸
              </h2>
              <p className="font-sans text-sm text-blush-400 mb-8">
                Plus vous partagez de détails, plus nous pouvons créer la pièce parfaite pour vous.
              </p>
              <CustomOrderForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
