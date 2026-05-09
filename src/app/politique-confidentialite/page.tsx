export const metadata = {
  title: 'Politique de Confidentialité — BLVCréa',
  robots: 'noindex',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-blush-400 mb-3">Informations légales</p>
          <h1 className="font-serif text-5xl text-gray-800 mb-4">Politique de Confidentialité</h1>
          <p className="font-sans text-sm text-blush-400">Conforme au RGPD (Règlement Général sur la Protection des Données)</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-blush-200" />
            <span className="text-blush-300">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-blush-200" />
          </div>
        </div>

        <div className="space-y-6 font-sans text-gray-600 leading-relaxed">

          {/* Responsable */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">1. Responsable du traitement</h2>
            <p>Le responsable du traitement de vos données personnelles est :</p>
            <ul className="mt-3 space-y-1.5 list-none pl-0">
              <li><strong>Nom :</strong> [VOTRE NOM COMPLET]</li>
              <li><strong>Activité :</strong> BLVCréa — Macramé Artisanal</li>
              <li><strong>Email :</strong> contact@blvcrea.fr</li>
              <li><strong>Adresse :</strong> [VOTRE ADRESSE]</li>
            </ul>
          </section>

          {/* Données collectées */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">2. Données collectées</h2>
            <p>Nous collectons uniquement les données nécessaires au traitement de votre commande :</p>

            <div className="mt-4 space-y-3">
              {[
                {
                  title: 'Lors d\'une commande',
                  data: ['Nom et prénom', 'Adresse email', 'Adresse de livraison', 'Données de paiement (gérées par Stripe — nous n\'y avons pas accès)'],
                },
                {
                  title: 'Lors d\'une demande sur-mesure',
                  data: ['Nom et prénom', 'Adresse email', 'Numéro de téléphone (facultatif)', 'Description du projet', 'Photo d\'inspiration (facultative)'],
                },
                {
                  title: 'Automatiquement (navigation)',
                  data: ['Adresse IP', 'Type de navigateur', 'Pages visitées (données anonymes via Vercel Analytics)'],
                },
              ].map(({ title, data }) => (
                <div key={title} className="p-4 rounded-2xl bg-petal border border-rose-50">
                  <p className="font-medium text-gray-800 mb-2">{title} :</p>
                  <ul className="space-y-1 text-sm list-disc pl-4">
                    {data.map(d => <li key={d}>{d}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Finalités */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="mt-3 space-y-2 list-disc pl-5 text-sm">
              <li>Traiter et expédier votre commande</li>
              <li>Vous envoyer votre confirmation de commande</li>
              <li>Gérer votre demande de création sur-mesure</li>
              <li>Vous contacter en cas de problème avec votre commande</li>
              <li>Respecter nos obligations légales et comptables</li>
            </ul>
            <p className="mt-4 font-medium text-blush-600">
              🔒 Nous ne vendons jamais vos données à des tiers. Nous n&apos;envoyons pas de newsletter sans votre consentement explicite.
            </p>
          </section>

          {/* Base légale */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">4. Base légale</h2>
            <div className="space-y-3 text-sm">
              {[
                { base: 'Exécution du contrat', detail: 'Traitement de votre commande et livraison' },
                { base: 'Obligation légale',    detail: 'Conservation des données comptables (10 ans)' },
                { base: 'Intérêt légitime',     detail: 'Amélioration de notre service, sécurité du site' },
                { base: 'Consentement',         detail: 'Envoi d\'emails marketing (si vous y avez consenti)' },
              ].map(({ base, detail }) => (
                <div key={base} className="flex gap-3 items-start p-3 rounded-xl bg-petal">
                  <span className="text-blush-400 mt-0.5">✦</span>
                  <div>
                    <span className="font-medium text-gray-800">{base} : </span>
                    <span>{detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Conservation */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">5. Durée de conservation</h2>
            <div className="space-y-3 text-sm">
              {[
                { type: 'Données de commande',          duree: '10 ans (obligation comptable)' },
                { type: 'Données de demande sur-mesure', duree: '3 ans après la dernière interaction' },
                { type: 'Données de navigation',         duree: '13 mois maximum' },
              ].map(({ type, duree }) => (
                <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-petal border border-rose-50">
                  <span className="font-medium text-gray-700">{type}</span>
                  <span className="text-blush-500">{duree}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Partenaires */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">6. Partenaires et sous-traitants</h2>
            <p className="mb-4 text-sm">Vos données peuvent être transmises aux prestataires suivants, uniquement dans le cadre du service :</p>
            <div className="space-y-3">
              {[
                { nom: 'Stripe', role: 'Paiement sécurisé', pays: 'États-Unis (Privacy Shield)', lien: 'https://stripe.com/fr/privacy' },
                { nom: 'Vercel', role: 'Hébergement du site', pays: 'États-Unis', lien: 'https://vercel.com/legal/privacy-policy' },
                { nom: 'Sanity', role: 'Stockage des données produits', pays: 'États-Unis', lien: 'https://www.sanity.io/legal/privacy' },
                { nom: 'Resend', role: 'Envoi des emails transactionnels', pays: 'États-Unis', lien: 'https://resend.com/privacy' },
              ].map(({ nom, role, pays, lien }) => (
                <div key={nom} className="p-4 rounded-2xl bg-petal border border-rose-50 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-800">{nom}</p>
                      <p className="text-gray-500 mt-0.5">{role} · {pays}</p>
                    </div>
                    <a href={lien} target="_blank" rel="noopener noreferrer" className="text-blush-500 hover:text-blush-700 text-xs underline flex-shrink-0">
                      Politique →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Droits */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">7. Vos droits</h2>
            <p className="mb-4 text-sm">Conformément au RGPD, vous disposez des droits suivants sur vos données :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { droit: '📋 Droit d\'accès',         desc: 'Obtenir une copie de vos données' },
                { droit: '✏️ Droit de rectification', desc: 'Corriger des données inexactes' },
                { droit: '🗑 Droit à l\'effacement',  desc: 'Supprimer vos données ("droit à l\'oubli")' },
                { droit: '🚫 Droit d\'opposition',    desc: 'Vous opposer au traitement' },
                { droit: '📦 Droit à la portabilité', desc: 'Recevoir vos données dans un format lisible' },
                { droit: '⏸ Droit à la limitation',  desc: 'Limiter l\'utilisation de vos données' },
              ].map(({ droit, desc }) => (
                <div key={droit} className="p-3 rounded-xl bg-petal border border-rose-50 text-sm">
                  <p className="font-medium text-gray-800">{droit}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm">
              Pour exercer vos droits, contactez-nous à <strong>contact@blvcrea.fr</strong>.
              Nous répondrons dans un délai d&apos;un mois. En cas de litige, vous pouvez saisir la <strong>CNIL</strong> :
            </p>
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer"
              className="mt-2 inline-block text-blush-500 hover:text-blush-700 underline text-sm">
              www.cnil.fr →
            </a>
          </section>

          {/* Cookies */}
          <section className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
            <h2 className="font-serif text-2xl text-gray-800 mb-4">8. Cookies</h2>
            <p className="text-sm mb-3">
              Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement du site
              (session d&apos;administration, sécurité). Aucun cookie publicitaire ou de tracking n&apos;est utilisé.
            </p>
            <div className="space-y-2 text-sm">
              {[
                { nom: 'admin_session', usage: 'Maintenir la session administrateur', duree: '24 heures' },
              ].map(({ nom, usage, duree }) => (
                <div key={nom} className="flex items-center justify-between p-3 rounded-xl bg-petal text-sm">
                  <div>
                    <code className="text-blush-600 text-xs">{nom}</code>
                    <p className="text-gray-500 text-xs mt-0.5">{usage}</p>
                  </div>
                  <span className="text-blush-400 text-xs">{duree}</span>
                </div>
              ))}
            </div>
          </section>

          <p className="text-xs text-blush-400 text-center pt-4">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
