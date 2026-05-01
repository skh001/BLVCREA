'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center bg-cream px-6">
        <div className="text-center max-w-md">
          <span className="font-script text-7xl text-blush-200 block mb-4">Erreur</span>
          <h2 className="font-serif text-3xl text-gray-800 mb-4">
            Quelque chose s&apos;est mal passé
          </h2>
          <p className="font-sans text-blush-500 mb-8">
            Une erreur inattendue est survenue. Veuillez réessayer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={reset} className="btn-primary">
              Réessayer
            </button>
            <Link href="/" className="btn-secondary">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
