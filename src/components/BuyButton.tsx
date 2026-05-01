'use client';

import { useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/sanity';

interface BuyButtonProps {
  product: Product;
}

export default function BuyButton({ product }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          title: product.title,
          price: product.price,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la création du paiement');
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      alert('Une erreur est survenue. Veuillez réessayer ou nous contacter.');
    } finally {
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
          Acheter — {product.price.toFixed(2)} €
        </>
      )}
    </button>
  );
}
