'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { MAX_CUSTOM_SIZES, type CustomSize } from '@/lib/catalog';

interface PricingManagerProps {
  initialSizes: CustomSize[];
  notify: (msg: string, type?: 'success' | 'error') => void;
}

interface Row {
  _key: string;
  label: string;
  details: string;
  price: string;
}

const toRows = (sizes: CustomSize[]): Row[] =>
  sizes.map((s) => ({ _key: s._key, label: s.label, details: s.details ?? '', price: String(s.price) }));

const serialize = (rows: Row[]) => JSON.stringify(rows.map(({ _key, label, details, price }) => [_key, label, details, price]));

export default function PricingManager({ initialSizes, notify }: PricingManagerProps) {
  const [rows, setRows]       = useState<Row[]>(() => toRows(initialSizes));
  const [saved, setSaved]     = useState(() => serialize(toRows(initialSizes)));
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const dirty = serialize(rows) !== saved;

  const update = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const move = (i: number, to: number) =>
    setRows((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[to]] = [next[to], next[i]];
      return next;
    });

  const add = () =>
    setRows((prev) => [...prev, { _key: `new-${Date.now()}`, label: '', details: '', price: '' }]);

  const save = async () => {
    setError('');
    if (!rows.length) return setError('Ajoutez au moins une taille.');
    const invalid = rows.findIndex((r) => {
      const price = parseFloat(r.price.replace(',', '.'));
      return !r.label.trim() || isNaN(price) || price <= 0;
    });
    if (invalid !== -1) {
      return setError(`Ligne ${invalid + 1} : indiquez le nom de la taille et un prix supérieur à 0 €.`);
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sizes: rows.map((r) => ({
            _key: r._key.startsWith('new-') ? undefined : r._key,
            label: r.label.trim(),
            details: r.details.trim(),
            price: parseFloat(r.price.replace(',', '.')),
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      const fresh = toRows(data.sizes);
      setRows(fresh);
      setSaved(serialize(fresh));
      notify('Tarifs enregistrés — le site est à jour ✅');
    } catch (err: any) {
      setError(err.message);
      notify("Les tarifs n'ont pas pu être enregistrés.", 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl text-gray-800">Tarifs sur-mesure</h2>
          <p className="font-sans text-sm text-blush-400 mt-1">
            Prix affichés sur le formulaire « Créer ma pièce sur-mesure » selon la taille choisie. Livraison toujours offerte.
          </p>
        </div>
        <a href="/personnalisation" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-blush-500 hover:text-blush-700 flex-shrink-0">
          <ExternalLink size={14} /> Voir le formulaire
        </a>
      </div>

      <div className="bg-white rounded-3xl border border-rose-50 shadow-sm divide-y divide-rose-50">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_140px_120px] gap-3 px-5 py-3 font-sans text-xs uppercase tracking-widest text-blush-400">
          <span>Taille</span><span>Précision (facultatif)</span><span>Prix (€)</span><span />
        </div>
        {rows.map((row, i) => (
          <div key={row._key} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_140px_120px] gap-3 p-4 sm:px-5 items-center">
            <input
              value={row.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="ex : Moyen"
              className="input-field"
              maxLength={40}
              aria-label={`Nom de la taille ${i + 1}`}
            />
            <input
              value={row.details}
              onChange={(e) => update(i, { details: e.target.value })}
              placeholder="ex : 20 à 35 cm"
              className="input-field"
              maxLength={60}
              aria-label={`Précision de la taille ${i + 1}`}
            />
            <div className="relative">
              <input
                type="number" min="0.01" step="0.01" inputMode="decimal"
                value={row.price}
                onChange={(e) => update(i, { price: e.target.value })}
                placeholder="39"
                className="input-field pr-8 text-lg"
                aria-label={`Prix de la taille ${i + 1}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-sm text-gray-400">€</span>
            </div>
            <div className="flex gap-1 justify-end">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-blush-600 disabled:opacity-30" aria-label="Monter">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === rows.length - 1}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-blush-600 disabled:opacity-30" aria-label="Descendre">
                <ArrowDown size={14} />
              </button>
              <button type="button" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} disabled={rows.length === 1}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30" aria-label="Supprimer la taille">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {rows.length < MAX_CUSTOM_SIZES && (
          <div className="p-4 sm:px-5">
            <button type="button" onClick={add}
              className="inline-flex items-center gap-2 font-sans text-sm text-blush-500 hover:text-blush-700">
              <Plus size={16} /> Ajouter une taille
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="p-4 rounded-2xl bg-red-50 border border-red-100 font-sans text-sm text-red-600" role="alert">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {dirty && <span className="font-sans text-sm text-amber-600 text-center">Modifications non enregistrées</span>}
        <button onClick={save} disabled={saving || !dirty} className="btn-primary py-4 disabled:opacity-50">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Enregistrer les tarifs
        </button>
      </div>
    </section>
  );
}
