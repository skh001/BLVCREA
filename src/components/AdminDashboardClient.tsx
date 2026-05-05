'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomRequest, Product } from '@/lib/sanity';
import { urlFor } from '@/lib/sanity';
import Image from 'next/image';
import {
  Plus, Trash2, LogOut, Mail, Phone, Palette,
  RefreshCw, ChevronDown, ChevronUp, PackageX, PackageCheck,
  AlertTriangle, X, CheckCircle, Loader2, ImageIcon, ArrowLeft,
} from 'lucide-react';

interface Props {
  initialRequests: CustomRequest[];
  initialProducts: Product[];
}

const statusConfig = {
  nouveau:  { emoji: '🆕', label: 'Nouveau',  bg: 'bg-blue-50',  text: 'text-blue-700',  next: 'en_cours', nextLabel: 'Marquer en cours' },
  en_cours: { emoji: '🔄', label: 'En cours', bg: 'bg-amber-50', text: 'text-amber-700', next: 'termine',  nextLabel: 'Marquer terminé' },
  termine:  { emoji: '✅', label: 'Terminé',  bg: 'bg-green-50', text: 'text-green-700', next: 'nouveau',  nextLabel: 'Remettre en nouveau' },
} as const;

type StatusKey = keyof typeof statusConfig;

const CATEGORIES = [
  { value: 'suspension', label: 'Suspension murale' },
  { value: 'rideau',     label: 'Rideau & Séparateur' },
  { value: 'cadre',      label: 'Cadre décoratif' },
  { value: 'table',      label: 'Table & Vase' },
  { value: 'bijou',      label: 'Bijou & Accessoire' },
];

// ── Add Product Form ─────────────────────────────────────────────────────────
function AddProductForm({ onSuccess, onCancel }: { onSuccess: (p: Product) => void; onCancel: () => void }) {
  const [title,       setTitle]       = useState('');
  const [price,       setPrice]       = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('suspension');
  const [inStock,     setInStock]     = useState(true);
  const [imageFile,   setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Image trop grande (max 10 Mo).'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le nom du produit est obligatoire.'); return; }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) { setError('Entrez un prix valide.'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('price', price);
      fd.append('description', description);
      fd.append('category', category);
      fd.append('inStock', String(inStock));
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch('/api/admin/products', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');

      // Build a minimal product object to update UI instantly
      const newProduct: Product = {
        _id: data.id,
        title: title.trim(),
        slug: { current: title.toLowerCase().replace(/\s+/g, '-') },
        price: parseFloat(price),
        description,
        category,
        inStock,
        image: null,
        createdAt: new Date().toISOString(),
      };
      onSuccess(newProduct);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-rose-50">
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-petal transition-colors text-blush-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-serif text-2xl text-gray-800">Ajouter un nouveau produit</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Image upload */}
        <div>
          <label className="block font-sans text-sm font-medium text-gray-700 mb-3">
            📸 Photo du produit
          </label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Aperçu" className="w-40 h-40 object-cover rounded-2xl border-2 border-blush-200" />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-rose-200 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 shadow-sm">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 w-full sm:w-64 h-40 border-2 border-dashed border-rose-200 rounded-2xl text-blush-400 hover:border-blush-300 hover:bg-petal transition-all">
              <ImageIcon size={28} />
              <span className="font-sans text-sm">Cliquez pour ajouter une photo</span>
              <span className="font-sans text-xs text-blush-300">JPG, PNG — max 10 Mo</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
        </div>

        {/* Title */}
        <div>
          <label className="block font-sans text-sm font-medium text-gray-700 mb-2">
            ✏️ Nom du produit <span className="text-red-400">*</span>
          </label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="ex: Suspension Bohème Naturelle"
            className="input-field text-lg"
            required
          />
        </div>

        {/* Price + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-sans text-sm font-medium text-gray-700 mb-2">
              💶 Prix (€) <span className="text-red-400">*</span>
            </label>
            <input
              type="number" min="0" step="0.01"
              value={price} onChange={e => setPrice(e.target.value)}
              placeholder="68.00"
              className="input-field text-lg"
              required
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-gray-700 mb-2">
              🏷️ Catégorie
            </label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-sans text-sm font-medium text-gray-700 mb-2">
            📝 Description
          </label>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            rows={4} placeholder="Décrivez votre création : matières, dimensions, style..."
            className="input-field resize-none"
          />
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
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
            <p className="font-sans text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-200 font-sans text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 btn-primary py-4 text-base disabled:opacity-60">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Ajout en cours…</> : '✅ Ajouter le produit'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboardClient({ initialRequests, initialProducts }: Props) {
  const router = useRouter();
  const [requests, setRequests]   = useState<CustomRequest[]>(initialRequests);
  const [products, setProducts]   = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'products'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [loggingOut, setLoggingOut]   = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [updatingReqId, setUpdatingReqId] = useState<string | null>(null);
  const [toastMsg, setToastMsg]       = useState<string | null>(null);

  const newCount = requests.filter(r => r.status === 'nouveau').length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const handleProductAdded = (p: Product) => {
    setProducts(prev => [p, ...prev]);
    setShowAddForm(false);
    setActiveTab('products');
    showToast(`"${p.title}" ajouté avec succès ! ✅`);
    // Refresh to get full product data from Sanity (with image URL)
    setTimeout(() => router.refresh(), 1500);
  };

  const handleStockToggle = async (product: Product) => {
    const newStock = !product.inStock;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, inStock: newStock }),
      });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, inStock: newStock } : p));
      showToast(newStock ? `"${product.title}" remis en stock ✅` : `"${product.title}" marqué indisponible`);
    } catch {
      showToast('Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = async (productId: string, productTitle: string) => {
    setDeletingId(productId);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.filter(p => p._id !== productId));
      showToast(`"${productTitle}" supprimé.`);
    } catch {
      showToast('Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleStatusToggle = async (req: CustomRequest) => {
    const sc = statusConfig[req.status as StatusKey] ?? statusConfig.nouveau;
    setUpdatingReqId(req._id);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: req._id, status: sc.next }),
      });
      if (!res.ok) throw new Error();
      setRequests(prev => prev.map(r => r._id === req._id ? { ...r, status: sc.next } : r));
      showToast(`Statut mis à jour : ${statusConfig[sc.next].label}`);
    } catch {
      showToast('Erreur lors de la mise à jour.');
    } finally {
      setUpdatingReqId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-petal via-cream to-rose-50">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-3 bg-white border border-green-200 shadow-xl rounded-2xl px-5 py-4 animate-fade-in max-w-sm">
          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
          <span className="font-sans text-sm text-gray-700">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="font-serif text-2xl text-gray-800 mb-3">Supprimer ce produit ?</h3>
            <p className="font-sans text-sm text-gray-500 mb-7 leading-relaxed">
              Le produit sera <strong>définitivement supprimé</strong> de la boutique et de Sanity.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 font-sans text-sm font-medium text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={() => { const p = products.find(x => x._id === confirmDeleteId); if (p) handleDelete(p._id, p.title); }}
                disabled={!!deletingId}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 font-sans text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60">
                {deletingId ? 'Suppression…' : '🗑 Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <span className="font-script text-3xl text-blush-500 block leading-none">BLVCréa</span>
            <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-blush-400">Administration</span>
          </div>

          {!showAddForm && (
            <nav className="hidden sm:flex items-center gap-1 bg-rose-50 rounded-2xl p-1 flex-1 max-w-md mx-auto">
              {([
                { key: 'overview', label: '🏠 Accueil' },
                { key: 'requests', label: newCount > 0 ? `✉️ Demandes (${newCount})` : '✉️ Demandes' },
                { key: 'products', label: '🛍 Produits' },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-3 py-2 rounded-xl font-sans text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-blush-700 shadow-sm' : 'text-blush-400 hover:text-blush-600'}`}>
                  {tab.label}
                </button>
              ))}
            </nav>
          )}

          <button onClick={handleLogout} disabled={loggingOut}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-sans text-sm font-medium transition-all">
            <LogOut size={16} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>

        {!showAddForm && (
          <div className="sm:hidden flex border-t border-rose-50">
            {(['overview', 'requests', 'products'] as const).map((tab, i) => {
              const labels = ['Accueil', `Demandes${newCount > 0 ? ` (${newCount})` : ''}`, 'Produits'];
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 font-sans text-xs font-medium border-b-2 transition-colors ${activeTab === tab ? 'text-blush-600 border-blush-500' : 'text-blush-400 border-transparent'}`}>
                  {labels[i]}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── ADD PRODUCT FORM ── */}
        {showAddForm && (
          <AddProductForm
            onSuccess={handleProductAdded}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* ═══════════ OVERVIEW ═══════════ */}
        {!showAddForm && activeTab === 'overview' && (
          <>
            <div className="bg-white rounded-3xl p-8 border border-rose-50 shadow-sm">
              <h1 className="font-serif text-4xl text-gray-800 mb-2">Bonjour ! 👋</h1>
              <p className="font-sans text-lg text-blush-500 mb-4">Bienvenue dans votre espace boutique.</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-petal border border-rose-100 font-sans text-sm text-blush-600">
                  🛍 {products.length} produit{products.length !== 1 ? 's' : ''}
                </span>
                <span className="px-4 py-2 rounded-full bg-petal border border-rose-100 font-sans text-sm text-blush-600">
                  ✉️ {requests.length} demande{requests.length !== 1 ? 's' : ''}
                </span>
                {newCount > 0 && (
                  <span className="px-4 py-2 rounded-full bg-blue-50 border border-blue-100 font-sans text-sm font-semibold text-blue-700">
                    🆕 {newCount} nouvelle{newCount > 1 ? 's' : ''} !
                  </span>
                )}
              </div>
            </div>

            {/* BIG ACTION BUTTONS */}
            <div>
              <h2 className="font-serif text-3xl text-gray-800 mb-5">Que souhaitez-vous faire ?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <button onClick={() => { setShowAddForm(true); }}
                  className="btn-admin bg-blush-500 text-white hover:bg-blush-600 hover:shadow-lg hover:shadow-blush-200">
                  <Plus size={32} />
                  <div className="text-left">
                    <p className="text-xl font-semibold">Ajouter un produit</p>
                    <p className="text-sm opacity-75 mt-0.5">Photo, prix, description</p>
                  </div>
                </button>

                <button onClick={() => setActiveTab('products')}
                  className="btn-admin bg-white border-2 border-rose-200 text-blush-700 hover:border-blush-400">
                  <Trash2 size={32} className="text-blush-400" />
                  <div className="text-left">
                    <p className="text-xl font-semibold">Gérer les produits</p>
                    <p className="text-sm text-blush-400 mt-0.5">Modifier le stock, supprimer</p>
                  </div>
                </button>

                <button onClick={() => setActiveTab('requests')}
                  className="btn-admin bg-amber-50 border-2 border-amber-100 text-amber-800 hover:border-amber-300">
                  <Mail size={32} className="text-amber-500" />
                  <div className="text-left">
                    <p className="text-xl font-semibold">Voir les demandes</p>
                    <p className="text-sm text-amber-600 mt-0.5">
                      {newCount > 0 ? `${newCount} nouvelle${newCount > 1 ? 's' : ''} !` : `${requests.length} au total`}
                    </p>
                  </div>
                </button>

                <button onClick={() => router.refresh()}
                  className="btn-admin bg-green-50 border-2 border-green-100 text-green-800 hover:border-green-300">
                  <RefreshCw size={32} className="text-green-500" />
                  <div className="text-left">
                    <p className="text-xl font-semibold">Actualiser la page</p>
                    <p className="text-sm text-green-600 mt-0.5">Voir les nouveautés</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent requests preview */}
            {requests.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-2xl text-gray-800">Dernières demandes</h2>
                  <button onClick={() => setActiveTab('requests')} className="font-sans text-sm text-blush-500 hover:text-blush-700">Voir tout →</button>
                </div>
                <div className="space-y-3">
                  {requests.slice(0, 3).map(req => {
                    const sc = statusConfig[req.status as StatusKey] ?? statusConfig.nouveau;
                    return (
                      <div key={req._id} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-rose-50 shadow-sm">
                        <span className="text-xl">{sc.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-lg text-gray-800 truncate">{req.name}</p>
                          <p className="font-sans text-xs text-blush-400">{new Date(req.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                        </div>
                        <a href={`mailto:${req.email}`} className="p-2 rounded-xl bg-petal text-blush-500 hover:bg-blush-100 transition-colors">
                          <Mail size={16} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════ REQUESTS ═══════════ */}
        {!showAddForm && activeTab === 'requests' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-3xl text-gray-800">Demandes sur-mesure</h2>
              <span className="font-sans text-sm bg-white border border-rose-100 text-blush-500 px-4 py-2 rounded-full shadow-sm">{requests.length} au total</span>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-rose-50">
                <p className="font-script text-5xl text-blush-200 mb-3">Aucune demande</p>
                <p className="font-sans text-blush-400">Les demandes apparaîtront ici lorsque des clients rempliront le formulaire.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => {
                  const sc = statusConfig[req.status as StatusKey] ?? statusConfig.nouveau;
                  const isExpanded = expandedReq === req._id;
                  return (
                    <div key={req._id} className="bg-white rounded-3xl border border-rose-50 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-4 p-5">
                        <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.emoji} <span className="hidden sm:inline">{sc.label}</span>
                        </div>
                        <button onClick={() => setExpandedReq(isExpanded ? null : req._id)} className="flex-1 text-left min-w-0">
                          <p className="font-serif text-xl text-gray-800 truncate">{req.name}</p>
                          <p className="font-sans text-xs text-blush-400">
                            {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · {req.color}
                          </p>
                        </button>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleStatusToggle(req)} disabled={updatingReqId === req._id}
                            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border font-sans text-xs font-medium transition-colors disabled:opacity-50 ${sc.bg} ${sc.text} border-current hover:opacity-80`}>
                            {updatingReqId === req._id ? '…' : sc.nextLabel}
                          </button>
                          <a href={`mailto:${req.email}?subject=Votre demande BLVCréa`} className="p-2.5 rounded-xl bg-petal text-blush-500 hover:bg-blush-100 transition-colors">
                            <Mail size={16} />
                          </a>
                          <button onClick={() => setExpandedReq(isExpanded ? null : req._id)} className="p-2.5 rounded-xl bg-petal text-blush-400 hover:bg-blush-100 transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-rose-50 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <h4 className="font-sans text-xs tracking-widest uppercase text-blush-400">Contact</h4>
                            <a href={`mailto:${req.email}`} className="flex items-center gap-2 font-sans text-base text-blush-600 hover:text-blush-800 transition-colors"><Mail size={15} /> {req.email}</a>
                            {req.phone && <a href={`tel:${req.phone}`} className="flex items-center gap-2 font-sans text-base text-blush-600 transition-colors"><Phone size={15} /> {req.phone}</a>}
                            <p className="flex items-center gap-2 font-sans text-sm text-blush-600"><Palette size={15} /> {req.color}</p>
                          </div>
                          <div>
                            <h4 className="font-sans text-xs tracking-widest uppercase text-blush-400 mb-2">Description</h4>
                            <p className="font-sans text-sm text-gray-700 leading-relaxed bg-petal p-4 rounded-2xl whitespace-pre-wrap">{req.description}</p>
                          </div>
                          {req.imageUrl && (
                            <div className="sm:col-span-2">
                              <h4 className="font-sans text-xs tracking-widest uppercase text-blush-400 mb-3">Image d&apos;inspiration</h4>
                              <a href={req.imageUrl} target="_blank" rel="noopener noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={req.imageUrl} alt="Inspiration" className="max-w-xs rounded-2xl border border-rose-100 hover:opacity-80 transition-opacity" />
                              </a>
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <a href={`mailto:${req.email}?subject=Votre demande personnalisée BLVCréa`} className="btn-primary text-sm py-3">
                              <Mail size={16} /> Répondre à {req.name}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ═══════════ PRODUCTS ═══════════ */}
        {!showAddForm && activeTab === 'products' && (
          <section>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="font-serif text-3xl text-gray-800">Vos produits ({products.length})</h2>
              <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm py-3">
                <Plus size={16} /> Ajouter un produit
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-rose-50">
                <p className="font-script text-5xl text-blush-200 mb-3">Boutique vide</p>
                <p className="font-sans text-blush-400 mb-6">Ajoutez votre premier produit ici.</p>
                <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm">
                  <Plus size={16} /> Ajouter un produit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(product => {
                  const imgUrl = product.image ? urlFor(product.image).width(400).height(480).url() : null;
                  return (
                    <div key={product._id} className="bg-white rounded-3xl border border-rose-50 shadow-sm overflow-hidden flex flex-col">
                      <div className="relative aspect-[4/3] bg-petal overflow-hidden">
                        {imgUrl
                          ? <Image src={imgUrl} alt={product.title} fill className="object-cover" sizes="300px" />
                          : <div className="absolute inset-0 flex items-center justify-center"><span className="font-script text-4xl text-blush-200">BLV</span></div>
                        }
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full font-sans text-xs font-semibold ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {product.inStock ? '✅ En stock' : '❌ Indisponible'}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col gap-2">
                        <h3 className="font-serif text-lg text-gray-800 leading-tight">{product.title}</h3>
                        {product.category && <p className="font-sans text-xs text-blush-400 uppercase tracking-wider">{product.category}</p>}
                        <p className="font-serif text-2xl text-blush-600 font-light">{product.price.toFixed(2)} €</p>
                        <div className="flex gap-2 mt-auto pt-3">
                          <button onClick={() => handleStockToggle(product)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-sans text-xs font-medium transition-all border ${product.inStock ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                            {product.inStock ? <><PackageX size={14} /> Indisponible</> : <><PackageCheck size={14} /> Remettre en stock</>}
                          </button>
                          <button onClick={() => setConfirmDeleteId(product._id)}
                            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
