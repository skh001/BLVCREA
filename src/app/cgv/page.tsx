export const metadata = {
  title: 'Conditions Générales de Vente — BLVCréa',
  robots: 'noindex',
};

export default function CGVPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">Informations légales</p>
          <h1 className="font-serif text-5xl text-gray-800 mb-4">Conditions Générales de Vente</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blush-200" />
            <span className="text-blush-300">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blush-200" />
          </div>
        </div>

        <div className="space-y-6 font-sans text-gray-600 leading-relaxed">

          {/* Préambule */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">1. Préambule</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les ventes effectuées sur le site
              <strong> blvcrea.fr</strong>, exploité par [VOTRE NOM], auto-entrepreneur, SIRET [VOTRE SIRET].
            </p>
            <p className="mt-3">
              Toute commande passée sur le site implique l&apos;acceptation pleine et entière des présentes CGV.
              BLVCréa se réserve le droit de les modifier à tout moment.
            </p>
          </section>

          {/* Produits */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">2. Produits</h2>
            <p>
              BLVCréa propose des créations artisanales en macramé faites à la main. Chaque pièce est unique.
              De légères variations de couleur ou de forme peuvent exister entre les photos et le produit livré —
              c&apos;est la beauté du fait main.
            </p>
            <p className="mt-3">
              Les produits sont disponibles dans la limite des stocks disponibles.
              BLVCréa se réserve le droit de retirer un produit à tout moment.
            </p>
          </section>

          {/* Prix */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">3. Prix</h2>
            <p>
              Les prix sont indiqués en euros (€) toutes taxes comprises (TTC).
              BLVCréa, en tant que micro-entreprise, n&apos;est pas assujettie à la TVA (article 293B du CGI).
            </p>
            <p className="mt-3">
              Les frais de livraison sont indiqués avant validation de la commande et varient selon la destination.
            </p>
            <p className="mt-3">
              BLVCréa se réserve le droit de modifier ses prix à tout moment. Les produits sont facturés au prix
              en vigueur au moment de la validation de la commande.
            </p>
          </section>

          {/* Commande */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">4. Commande et paiement</h2>
            <p>
              La commande est validée après paiement complet via notre prestataire sécurisé <strong>Stripe</strong>.
              Les données bancaires ne sont jamais stockées sur nos serveurs.
            </p>
            <p className="mt-3">Modes de paiement acceptés :</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Carte bancaire (Visa, Mastercard, American Express)</li>
              <li>Apple Pay / Google Pay</li>
            </ul>
            <p className="mt-3">
              Un email de confirmation est envoyé après validation du paiement.
            </p>
          </section>

          {/* Commandes personnalisées */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">5. Créations sur-mesure</h2>
            <p>
              Le prix d&apos;une création sur-mesure est fixé à <strong>29 €</strong>, livraison incluse vers la France métropolitaine, la Belgique, la Suisse, le Luxembourg et Monaco.
            </p>
            <p className="mt-3">
              La fabrication commence après réception du paiement. Le délai de réalisation est de <strong>7 jours ouvrés</strong>.
            </p>
            <p className="mt-3">
              Les créations sur-mesure étant fabriquées spécifiquement pour le client, le droit de rétractation
              de 14 jours ne s&apos;applique pas conformément à l&apos;article L.221-28 du Code de la consommation,
              sauf accord commercial de BLVCréa.
            </p>
          </section>

          {/* Livraison */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">6. Livraison</h2>
            <p>Les commandes sont expédiées vers :</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>France métropolitaine</li>
              <li>Belgique, Suisse, Luxembourg, Monaco</li>
            </ul>
            <p className="mt-3">
              Le délai de livraison est de <strong>5 à 7 jours ouvrés</strong> après expédition.
              Un numéro de suivi vous sera communiqué par email dès l&apos;expédition.
            </p>
            <p className="mt-3">
              BLVCréa ne peut être tenu responsable des retards de livraison causés par le transporteur
              ou des événements indépendants de sa volonté (grève, intempéries, etc.).
            </p>
          </section>

          {/* Droit de rétractation */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">7. Droit de rétractation</h2>
            <p>
              Conformément à l&apos;article L.221-18 du Code de la consommation, vous disposez d&apos;un délai de
              <strong> 14 jours calendaires</strong> à compter de la réception de votre commande pour exercer
              votre droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
            </p>
            <p className="mt-3">
              Pour exercer ce droit, contactez-nous à <strong>contact@blvcrea.fr</strong> en indiquant votre
              numéro de commande. Le produit doit être retourné dans son état d&apos;origine, non utilisé et
              soigneusement emballé.
            </p>
            <p className="mt-3 font-medium text-blush-600">
              ⚠ Exception : Les créations sur-mesure réalisées selon les spécifications du client ne peuvent
              pas faire l&apos;objet d&apos;un droit de rétractation (article L.221-28 du Code de la consommation).
            </p>
            <p className="mt-3">
              Les frais de retour sont à la charge du client. Le remboursement sera effectué dans les
              <strong> 14 jours</strong> suivant réception du produit retourné.
            </p>
          </section>

          {/* Garanties */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">8. Garanties légales</h2>
            <p>Tous nos produits bénéficient des garanties légales suivantes :</p>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li>
                <strong>Garantie légale de conformité</strong> (articles L.217-4 à L.217-14 du Code de la
                consommation) : 2 ans à compter de la livraison.
              </li>
              <li>
                <strong>Garantie contre les vices cachés</strong> (articles 1641 à 1648 du Code civil).
              </li>
            </ul>
            <p className="mt-3">
              En cas de produit défectueux ou non conforme, contactez-nous à <strong>contact@blvcrea.fr</strong> avec
              des photos du problème. Nous procéderons à un échange ou un remboursement selon les cas.
            </p>
          </section>

          {/* Litiges */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">9. Litiges et médiation</h2>
            <p>
              En cas de litige, une solution amiable sera recherchée en priorité. Vous pouvez nous contacter
              à <strong>contact@blvcrea.fr</strong>.
            </p>
            <p className="mt-3">
              À défaut de résolution amiable, vous pouvez recourir gratuitement à un médiateur de la
              consommation. Conformément à l&apos;article L.612-1 du Code de la consommation, BLVCréa propose
              le recours à la médiation via la plateforme européenne de règlement en ligne des litiges :
            </p>
            <p className="mt-2">
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"
                className="text-blush-500 hover:text-blush-700 underline">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="mt-3">
              Les présentes CGV sont soumises au droit français. En cas de litige non résolu à l&apos;amiable,
              les tribunaux français seront compétents.
            </p>
          </section>

          <p className="text-xs text-blush-400 text-center pt-4">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
