'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

/** Shown when Stripe Checkout could not be opened (?error=paiement). Read client-side so the page stays static. */
export default function PaymentErrorNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(new URLSearchParams(window.location.search).get('error') === 'paiement');
  }, []);

  if (!visible) return null;

  return (
    <div role="alert" className="flex items-start gap-3 p-4 mb-8 rounded-2xl bg-red-50 border border-red-100 max-w-2xl mx-auto">
      <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <p className="font-sans text-sm text-red-700 flex-1">
        Le paiement n&apos;a pas pu être ouvert. Réessayez depuis le lien reçu par email, ou écrivez-nous à{' '}
        <a href="mailto:contact@blvcrea.fr" className="underline">contact@blvcrea.fr</a>.
      </p>
      <button onClick={() => setVisible(false)} aria-label="Fermer" className="text-red-400 hover:text-red-600">
        <X size={16} />
      </button>
    </div>
  );
}
