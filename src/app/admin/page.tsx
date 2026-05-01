'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Mot de passe incorrect. Veuillez réessayer.');
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-petal via-cream to-rose-50">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blush-100 p-10 border border-rose-50">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="font-script text-5xl text-blush-500 block">BLVCréa</span>
            <p className="font-sans text-xs tracking-[0.35em] uppercase text-blush-400 mt-1">
              Espace Administration
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-petal flex items-center justify-center">
              <Lock size={28} className="text-blush-400" />
            </div>
          </div>

          <h1 className="font-serif text-2xl text-gray-800 text-center mb-8">
            Connexion à votre espace
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-sans text-sm text-blush-600 font-medium mb-3">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="input-field text-lg pr-12 py-4"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blush-400 hover:text-blush-600 transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                <p className="font-sans text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connexion…
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 font-sans text-xs text-blush-400">
          Accès réservé à la propriétaire de BLVCréa
        </p>
      </div>
    </div>
  );
}
