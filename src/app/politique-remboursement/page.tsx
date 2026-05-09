export const metadata = {
  title: 'Politique de Remboursement — BLVCréa',
  robots: 'noindex',
};

export default function PolitiqueRemboursementPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">Informations légales</p>
          <h1 className="font-serif text-5xl text-gray-800 mb-4">Politique de Remboursement</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blush-200" />
            <span className="text-blush-300">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blush-200" />
          </div>
        </div>

        <div className="space-y-6 font-sans text-gray-600 leading-relaxed">

          {/* Engagement */}
          <section className="bg-gradient-to-br from-blush-50 to-rose-50 rounded-3xl p-8 border border-rose-100">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🌸</span>
              <div>
                <h2 className="font-serif text-2xl text-gray-800 mb-3">Notre engagement</h2>
                <p>
                  Chez BLVCréa, votre satisfaction est notre priorité. Chaque création est fabriquée avec soin.
                  Si toutefois vous n&apos;êtes pas entièrement satisfait(e), voici comment nous procédons.
                </p>
              </div>
            </div>
          </section>

          {/* Produits du catalogue */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">
              Produits de la boutique
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 border border-green-100">
                <span className="text-xl mt-0.5">✅</span>
                <div>
                  <p className="font-medium text-green-800 mb-1">Retour accepté sous 14 jours</p>
                  <p className="text-sm text-green-700">
                    Vous avez 14 jours calendaires après réception pour nous retourner votre produit,
                    sans justification. Le produit doit être dans son état d&apos;origine, non utilisé et non lavé.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Comment procéder :</h3>
                <ol className="space-y-2 list-decimal pl-5 text-sm">
                  <li>Envoyez un email à <strong>contact@blvcrea.fr</strong> avec votre numéro de commande et la raison du retour</li>
                  <li>Nous vous confirmons la prise en charge sous 48h</li>
                  <li>Renvoyez le colis soigneusement emballé à notre adresse</li>
                  <li>Remboursement effectué sous <strong>14 jours</strong> après réception du retour</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-800">
                <strong>⚠ Frais de retour :</strong> Les frais de retour sont à la charge du client, sauf en cas
                de produit défectueux ou non conforme à la commande.
              </div>
            </div>
          </section>

          {/* Créations sur-mesure */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">
              Créations sur-mesure (29 €)
            </h2>
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 mb-5 text-sm text-red-800">
              <strong>⚠ Exception légale :</strong> Les créations personnalisées, fabriquées spécifiquement
              selon vos instructions, ne peuvent pas être retournées ni remboursées conformément à
              l&apos;article L.221-28 du Code de la consommation.
            </div>
            <p className="text-sm">
              Cependant, si votre création est <strong>défectueuse</strong> ou ne correspond pas à ce qui
              a été convenu, nous nous engageons à trouver une solution (remplacement ou remboursement).
              Contactez-nous à <strong>contact@blvcrea.fr</strong> avec des photos.
            </p>
          </section>

          {/* Produit défectueux */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">Produit défectueux ou endommagé</h2>
            <p className="mb-3">
              Si votre colis est arrivé endommagé ou si le produit présente un défaut, contactez-nous
              <strong> dans les 48h suivant la réception</strong> à <strong>contact@blvcrea.fr</strong> avec :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Votre numéro de commande</li>
              <li>Des photos du produit endommagé</li>
              <li>Des photos de l&apos;emballage si celui-ci est également abîmé</li>
            </ul>
            <p className="mt-4 text-sm">
              Nous prendrons en charge les frais de retour et procéderons à un <strong>remplacement ou
              remboursement intégral</strong> selon votre préférence.
            </p>
          </section>

          {/* Délais de remboursement */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">Délais de remboursement</h2>
            <div className="space-y-3">
              {[
                { label: 'Confirmation du retour',     delay: '48h après votre demande par email' },
                { label: 'Traitement après réception', delay: '14 jours ouvrés' },
                { label: 'Crédit sur votre compte',    delay: '3 à 5 jours bancaires selon votre banque' },
              ].map(({ label, delay }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-petal border border-rose-50">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-sm text-blush-500">{delay}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Le remboursement est effectué via le même moyen de paiement utilisé lors de la commande (carte bancaire).
            </p>
          </section>

          {/* Contact */}
          <section className="bg-petal rounded-3xl p-8 border border-rose-100 text-center">
            <h2 className="font-serif text-2xl text-gray-800 mb-3">Une question ?</h2>
            <p className="text-sm mb-4">Notre équipe répond dans les 48 heures.</p>
            <a href="mailto:contact@blvcrea.fr"
              className="btn-primary text-sm">
              ✉️ Nous contacter
            </a>
          </section>

          <p className="text-xs text-blush-400 text-center pt-4">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
