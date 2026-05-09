export const metadata = {
  title: 'Mentions Légales — BLVCréa',
  robots: 'noindex',
};

export default function MentionsLegalesPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">Informations légales</p>
          <h1 className="font-serif text-5xl text-gray-800 mb-4">Mentions Légales</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blush-200" />
            <span className="text-blush-300">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blush-200" />
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-10 font-sans text-gray-600 leading-relaxed">

          {/* Éditeur */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">1. Éditeur du site</h2>
            <p>Le site <strong>blvcrea.fr</strong> est édité par :</p>
            <ul className="mt-3 space-y-1.5 list-none pl-0">
              <li><strong>Nom :</strong> [VOTRE NOM COMPLET]</li>
              <li><strong>Statut :</strong> Auto-entrepreneur / Micro-entreprise</li>
              <li><strong>SIRET :</strong> [VOTRE NUMÉRO SIRET]</li>
              <li><strong>Adresse :</strong> [VOTRE ADRESSE COMPLÈTE]</li>
              <li><strong>Email :</strong> contact@blvcrea.fr</li>
              <li><strong>Téléphone :</strong> [VOTRE NUMÉRO DE TÉLÉPHONE]</li>
            </ul>
          </section>

          {/* Hébergement */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">2. Hébergement</h2>
            <p>Ce site est hébergé par :</p>
            <ul className="mt-3 space-y-1.5 list-none pl-0">
              <li><strong>Société :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</li>
              <li><strong>Site web :</strong> vercel.com</li>
            </ul>
          </section>

          {/* Propriété intellectuelle */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">3. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, photographies, créations macramé, logo, identité visuelle)
              est protégé par le droit d&apos;auteur et appartient exclusivement à BLVCréa.
            </p>
            <p className="mt-3">
              Toute reproduction, copie, diffusion ou utilisation, même partielle, sans autorisation écrite préalable est
              strictement interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code
              de la Propriété Intellectuelle.
            </p>
          </section>

          {/* Responsabilité */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">4. Limitation de responsabilité</h2>
            <p>
              BLVCréa s&apos;efforce de maintenir les informations publiées sur ce site aussi précises et à jour que possible.
              Cependant, BLVCréa ne peut garantir l&apos;exactitude, la complétude et l&apos;actualité des informations diffusées.
            </p>
            <p className="mt-3">
              BLVCréa décline toute responsabilité pour tout dommage résultant d&apos;une intrusion frauduleuse d&apos;un tiers ayant
              entraîné une modification des informations mises à disposition sur le site.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-petal rounded-3xl p-8 border border-rose-100">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">5. Contact</h2>
            <p>Pour toute question relative aux mentions légales, vous pouvez nous contacter à :</p>
            <p className="mt-3 font-medium text-blush-600">contact@blvcrea.fr</p>
          </section>

          <p className="text-xs text-blush-400 text-center pt-4">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
