'use client';

import { useState } from 'react';
import { Check, ExternalLink, Loader2, Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import type { Category } from '@/lib/catalog';

interface CategoryManagerProps {
  categories: Category[];
  onChange: (categories: Category[]) => void;
  notify: (msg: string, type?: 'success' | 'error') => void;
}

async function send(method: 'POST' | 'PUT' | 'DELETE', body: unknown): Promise<Category[]> {
  const res = await fetch('/api/admin/categories', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
  return data.categories;
}

export default function CategoryManager({ categories, onChange, notify }: CategoryManagerProps) {
  const [newTitle, setNewTitle]   = useState('');
  const [creating, setCreating]   = useState(false);
  const [editing, setEditing]     = useState<string | null>(null); // slug
  const [editTitle, setEditTitle] = useState('');
  const [busy, setBusy]           = useState<string | null>(null); // slug
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [error, setError]         = useState('');

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (title.length < 2) return setError('Le nom doit contenir au moins 2 caractères.');
    setError('');
    setCreating(true);
    try {
      onChange(await send('POST', { title }));
      setNewTitle('');
      notify(`Catégorie « ${title} » créée ✅`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const rename = async (cat: Category) => {
    const title = editTitle.trim();
    if (title === cat.title) return setEditing(null);
    if (title.length < 2) return setError('Le nom doit contenir au moins 2 caractères.');
    setError('');
    setBusy(cat.slug);
    try {
      onChange(await send('PUT', { id: cat._id, slug: cat.slug, title }));
      setEditing(null);
      notify(`Catégorie renommée en « ${title} » ✅`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (cat: Category) => {
    setBusy(cat.slug);
    setError('');
    try {
      onChange(await send('DELETE', { id: cat._id }));
      notify(`Catégorie « ${cat.title} » supprimée.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
      setConfirmDelete(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="font-serif text-3xl text-gray-800">Catégories ({categories.length})</h2>
        <p className="font-sans text-sm text-blush-400">Les catégories vides sont masquées sur le site.</p>
      </div>

      {/* Create */}
      <form onSubmit={create} className="bg-white rounded-3xl p-5 border border-rose-50 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nouvelle catégorie (ex : Attrapes-rêves)"
          className="input-field flex-1"
          maxLength={60}
          aria-label="Nom de la nouvelle catégorie"
        />
        <button type="submit" disabled={creating || newTitle.trim().length < 2} className="btn-primary text-sm py-3 disabled:opacity-50">
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Créer
        </button>
      </form>

      {error && (
        <p className="p-4 rounded-2xl bg-red-50 border border-red-100 font-sans text-sm text-red-600" role="alert">{error}</p>
      )}

      {/* List */}
      <div className="bg-white rounded-3xl border border-rose-50 shadow-sm divide-y divide-rose-50">
        {categories.length === 0 && (
          <p className="p-8 text-center font-sans text-blush-400">Aucune catégorie. Créez-en une ci-dessus.</p>
        )}
        {categories.map((cat) => {
          const isEditing = editing === cat.slug;
          const count = cat.count ?? 0;
          return (
            <div key={cat.slug} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-petal flex items-center justify-center flex-shrink-0">
                  <Tag size={16} className="text-blush-400" />
                </div>
                {isEditing ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); rename(cat); }
                      if (e.key === 'Escape') setEditing(null);
                    }}
                    className="input-field py-2"
                    maxLength={60}
                    aria-label="Nouveau nom"
                  />
                ) : (
                  <div className="min-w-0">
                    <p className="font-serif text-xl text-gray-800 truncate">{cat.title}</p>
                    <p className="font-sans text-xs text-blush-400">
                      {count} produit{count !== 1 ? 's' : ''} · /boutique/{cat.slug}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                {isEditing ? (
                  <>
                    <button onClick={() => rename(cat)} disabled={busy === cat.slug}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blush-500 text-white font-sans text-sm hover:bg-blush-600 disabled:opacity-60">
                      {busy === cat.slug ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Enregistrer
                    </button>
                    <button onClick={() => setEditing(null)} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" aria-label="Annuler">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    {count > 0 && (
                      <a href={`/boutique/${cat.slug}`} target="_blank" rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-blush-600 hover:border-blush-200" title="Voir sur le site">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button onClick={() => { setEditing(cat.slug); setEditTitle(cat.title); setError(''); }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blush-200 text-blush-600 font-sans text-sm hover:bg-petal">
                      <Pencil size={14} /> Renommer
                    </button>
                    {cat._id && (
                      <button
                        onClick={() => setConfirmDelete(cat)}
                        disabled={count > 0}
                        title={count > 0 ? 'Déplacez d’abord les produits de cette catégorie' : 'Supprimer'}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200 disabled:cursor-not-allowed"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-serif text-2xl text-gray-800 mb-3">Supprimer « {confirmDelete.title} » ?</h3>
            <p className="font-sans text-sm text-gray-500 mb-7">Cette catégorie ne contient aucun produit.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 font-sans text-sm font-medium text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={() => remove(confirmDelete)} disabled={!!busy}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 font-sans text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60">
                {busy ? 'Suppression…' : '🗑 Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
