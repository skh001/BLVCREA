'use client';

import { useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/sanity';
import { formatPrice } from '@/lib/utils';

interface BuyButtonProps {
  product: Pick<Product, '_id' | 'price'>;
}

export default function BuyButton({ product }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      // Only the id is sent — the server reads the real price from Sanity.
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du paiement');
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      alert(err?.message || 'Une erreur est survenue. Veuillez réessayer ou nous contacter.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Redirection vers le paiement…
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          Acheter — {formatPrice(product.price)}
        </>
      )}
    </button>
  );
}
