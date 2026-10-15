'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { urlFor, type Product } from '@/lib/sanity';
import type { Category } from '@/lib/catalog';
import ImageManager, { type AdminImage } from './ImageManager';

interface ProductFormProps {
  /** Existing product to edit — omitted when creating */
  product?: Product;
  categories: Category[];
  onSaved: (product: Product) => void;
  onCancel: () => void;
}

const DESCRIPTION_MAX = 5000;

function toAdminImages(product?: Product): AdminImage[] {
  return (product?.images ?? []).map((img, i) => ({
    id: img._key || `${img.asset._ref}-${i}`,
    assetId: img.asset._ref,
    previewUrl: urlFor(img).width(400).height(400).url(),
  }));
}

export default function ProductForm({ product, categories, onSaved, onCancel }: ProductFormProps) {
  const isEdit = !!product;

  const initial = useMemo(() => ({
    title:       product?.title ?? '',
    price:       product ? String(product.price) : '',
    description: product?.description ?? '',
    category:    product?.category ?? categories[0]?.slug ?? '',
    inStock:     product?.inStock ?? true,
    images:      toAdminImages(product),
  }), [product, categories]);

  const [title,       setTitle]       = useState(initial.title);
  const [price,       setPrice]       = useState(initial.price);
  const [description, setDescription] = useState(initial.description);
  const [category,    setCategory]    = useState(initial.category);
  const [inStock,     setInStock]     = useState(initial.inStock);
  const [images,      setImages]      = useState<AdminImage[]>(initial.images);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // Keep the product's current category selectable even if it is not in the list.
  const categoryOptions = useMemo(() => {
    if (!category || categories.some((c) => c.slug === category)) return categories;
    return [...categories, { slug: category, title: category }];
  }, [categories, category]);

  const isDirty =
    title !== initial.title ||
    price !== initial.price ||
    description !== initial.description ||
    category !== initial.category ||
    inStock !== initial.inStock ||
    images.map((i) => i.assetId ?? i.id).join() !== initial.images.map((i) => i.assetId).join();

  const handleCancel = () => {
    if (isDirty && !window.confirm('Quitter sans enregistrer vos modifications ?')) return;
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (title.trim().length < 2) return setError('Le nom du produit est obligatoire (2 caractères minimum).');
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) return setError('Entrez un prix valide.');
    if (!category) return setError('Choisissez une catégorie (créez-en une dans l’onglet Catégories si besoin).');
    if (description.length > DESCRIPTION_MAX) return setError(`Description trop longue (${DESCRIPTION_MAX} caractères max).`);
    if (images.some((i) => i.uploading)) return setError('Patientez, des photos sont encore en cours d’envoi…');
    if (images.some((i) => i.error)) return setError('Certaines photos n’ont pas pu être envoyées : retirez-les ou remplacez-les.');

    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/products?id=${encodeURIComponent(product!._id)}` : '/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          price: parsedPrice,
          description,
          category,
          inStock,
          images: images.map((i) => ({ assetId: i.assetId })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      onSaved(data.product);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  const uploading = images.some((i) => i.uploading);

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-rose-50">
        <button onClick={handleCancel} className="p-2 rounded-xl hover:bg-petal transition-colors text-blush-400" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-serif text-2xl text-gray-800 min-w-0 truncate">
          {isEdit ? `Modifier « ${product!.title} »` : 'Ajouter un nouveau produit'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
        {/* Images */}
        <div>
          <label className="block font-sans text-sm font-medium text-gray-700 mb-3">
            📸 Photos du produit
          </label>
          <ImageManager images={images} setImages={setImages} />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="pf-title" className="block font-sans text-sm font-medium text-gray-700 mb-2">
            ✏️ Nom du produit <span className="text-red-400">*</span>
          </label>
          <input
            id="pf-title"
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="ex: Suspension Bohème Naturelle"
            className="input-field text-lg"
            maxLength={100}
            required
          />
        </div>

        {/* Price + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pf-price" className="block font-sans text-sm font-medium text-gray-700 mb-2">
              💶 Prix (€) <span className="text-red-400">*</span>
            </label>
            <input
              id="pf-price"
              type="number" min="0.01" step="0.01" inputMode="decimal"
              value={price} onChange={e => setPrice(e.target.value)}
              placeholder="68.00"
              className="input-field text-lg"
              required
            />
          </div>
          <div>
            <label htmlFor="pf-category" className="block font-sans text-sm font-medium text-gray-700 mb-2">
              🏷️ Catégorie <span className="text-red-400">*</span>
            </label>
            <select id="pf-category" value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              {!category && <option value="">— Choisir —</option>}
              {categoryOptions.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="pf-description" className="block font-sans text-sm font-medium text-gray-700 mb-2">
            📝 Description
          </label>
          <textarea
            id="pf-description"
            value={description} onChange={e => setDescription(e.target.value)}
            rows={8} placeholder={'Décrivez votre création : matières, dimensions, style…\n\nLaissez une ligne vide pour créer un nouveau paragraphe.'}
            className="input-field resize-y min-h-[160px] leading-relaxed"
            maxLength={DESCRIPTION_MAX}
          />
          <div className="mt-1.5 flex justify-between gap-4 font-sans text-xs text-gray-400">
            <span>Les retours à la ligne et paragraphes sont conservés sur le site.</span>
            <span>{description.length}/{DESCRIPTION_MAX}</span>
          </div>
        </div>

        {/* In stock toggle */}
        <div>
          <label className="block font-sans text-sm font-medium text-gray-700 mb-3">📦 Disponibilité</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setInStock(true)}
              className={`flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-2 transition-all ${inStock ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
              ✅ En stock
            </button>
            <button type="button" onClick={() => setInStock(false)}
              className={`flex-1 py-3 rounded-2xl font-sans text-sm font-medium border-2 transition-all ${!inStock ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
              ❌ Indisponible
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl" role="alert">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
            <p className="font-sans text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button type="button" onClick={handleCancel}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-200 font-sans text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={loading || uploading}
            className="flex-1 btn-primary py-4 text-base disabled:opacity-60">
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Enregistrement…</>
              : uploading
                ? <><Loader2 size={18} className="animate-spin" /> Envoi des photos…</>
                : isEdit ? '💾 Enregistrer les modifications' : '✅ Ajouter le produit'}
          </button>
        </div>
      </form>
    </div>
  );
}
