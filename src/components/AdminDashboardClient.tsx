'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomRequest, Product } from '@/lib/sanity';
import { urlFor, getMainImage, getCategoryLabel } from '@/lib/sanity';
import type { Category, CustomSize } from '@/lib/catalog';
import Image from 'next/image';
import {
  Plus, Trash2, LogOut, Mail, Phone, Palette, Pencil, Tag, Euro, Images, Ruler,
  RefreshCw, ChevronDown, ChevronUp, PackageX, PackageCheck,
  AlertTriangle, X, CheckCircle,
} from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import CategoryManager from '@/components/admin/CategoryManager';
import PricingManager from '@/components/admin/PricingManager';
import { formatPrice } from '@/lib/utils';

interface Props {
  initialRequests: CustomRequest[];
  initialProducts: Product[];
  initialCategories: Category[];
  initialSizes: CustomSize[];
}

type Tab = 'overview' | 'requests' | 'products' | 'categories' | 'pricing';
type FormState = { mode: 'create' } | { mode: 'edit'; product: Product } | null;

const TABS: { key: Tab; label: string; short: string }[] = [
  { key: 'overview',   label: '🏠 Accueil',    short: 'Accueil' },
  { key: 'requests',   label: '✉️ Demandes',   short: 'Demandes' },
  { key: 'products',   label: '🛍 Produits',   short: 'Produits' },
  { key: 'categories', label: '🏷️ Catégories', short: 'Catégories' },
  { key: 'pricing',    label: '💶 Tarifs',     short: 'Tarifs' },
];

const statusConfig = {
  nouveau:  { emoji: '🆕', label: 'Nouveau',  bg: 'bg-blue-50',  text: 'text-blue-700',  next: 'en_cours', nextLabel: 'Marquer en cours' },
  en_cours: { emoji: '🔄', label: 'En cours', bg: 'bg-amber-50', text: 'text-amber-700', next: 'termine',  nextLabel: 'Marquer terminé' },
  termine:  { emoji: '✅', label: 'Terminé',  bg: 'bg-green-50', text: 'text-green-700', next: 'nouveau',  nextLabel: 'Remettre en nouveau' },
} as const;

type StatusKey = keyof typeof statusConfig;

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboardClient({ initialRequests, initialProducts, initialCategories, initialSizes }: Props) {
  const router = useRouter();
  const [requests, setRequests]   = useState<CustomRequest[]>(initialRequests);
  const [products, setProducts]   = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [form, setForm]           = useState<FormState>(null);
  const showAddForm = form !== null;

  // Opening/closing the product form or switching tab always starts at the top of the page
  useEffect(() => { window.scrollTo({ top: 0 }); }, [form, activeTab]);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [loggingOut, setLoggingOut]   = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [updatingReqId, setUpdatingReqId] = useState<string | null>(null);
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const newCount = requests.filter(r => r.status === 'nouveau').length;
  // Live category names, so a rename shows up immediately on the product cards
  const categoryTitles = new Map(categories.map(c => [c.slug, c.title]));

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /** Product counts per category, recomputed locally after product changes */
  const recountCategories = (list: Product[]) =>
    setCategories(prev => prev.map(c => ({ ...c, count: list.filter(p => p.category === c.slug).length })));

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const handleProductSaved = (p: Product) => {
    const isEdit = form?.mode === 'edit';
    const next = isEdit ? products.map(x => (x._id === p._id ? p : x)) : [p, ...products];
    setProducts(next);
    recountCategories(next);
    setForm(null);
    setActiveTab('products');
    showToast(isEdit ? `"${p.title}" mis à jour ✅` : `"${p.title}" ajouté avec succès ! ✅`);
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
      showToast('Erreur lors de la mise à jour.', 'error');
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
      const next = products.filter(p => p._id !== productId);
      setProducts(next);
      recountCategories(next);
      showToast(`"${productTitle}" supprimé.`);
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
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
      showToast('Erreur lors de la mise à jour.', 'error');
    } finally {
      setUpdatingReqId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-petal via-cream to-rose-50">

      {/* Toast */}
      {toast && (
        <div role="status" className={`fixed top-5 right-5 left-5 sm:left-auto z-[100] flex items-center gap-3 bg-white border shadow-xl rounded-2xl px-5 py-4 animate-fade-in sm:max-w-sm ${toast.type === 'error' ? 'border-red-200' : 'border-green-200'}`}>
          {toast.type === 'error'
            ? <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            : <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
          <span className="font-sans text-sm text-gray-700 flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600" aria-label="Fermer"><X size={14} /></button>
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
            <nav className="hidden md:flex items-center gap-1 bg-rose-50 rounded-2xl p-1 flex-1 max-w-2xl mx-auto">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-3 py-2 rounded-xl font-sans text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-white text-blush-700 shadow-sm' : 'text-blush-400 hover:text-blush-600'}`}>
                  {tab.label}{tab.key === 'requests' && newCount > 0 ? ` (${newCount})` : ''}
                </button>
              ))}
            </nav>
          )}

          <button onClick={handleLogout} disabled={loggingOut}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-sans text-sm font-medium transition-all">
            <LogOut size={16} />
            <span className="hidden lg:inline">Déconnexion</span>
          </button>
        </div>

        {!showAddForm && (
          <div className="md:hidden flex overflow-x-auto border-t border-rose-50">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[76px] px-2 py-3 font-sans text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'text-blush-600 border-blush-500' : 'text-blush-400 border-transparent'}`}>
                {tab.short}{tab.key === 'requests' && newCount > 0 ? ` (${newCount})` : ''}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── PRODUCT FORM (create / edit) ── */}
        {form && (
          <ProductForm
            key={form.mode === 'edit' ? form.product._id : 'new'}
            product={form.mode === 'edit' ? form.product : undefined}
            categories={categories}
            onSaved={handleProductSaved}
            onCancel={() => setForm(null)}
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

                <button onClick={() => setForm({ mode: 'create' })}
                  className="btn-admin bg-blush-500 text-white hover:bg-blush-600 hover:shadow-lg hover:shadow-blush-200">
                  <Plus size={32} />
                  <div className="text-left">
                    <p className="text-xl font-semibold">Ajouter un produit</p>
                    <p className="text-sm opacity-75 mt-0.5">Photo, prix, description</p>
                  </div>
                </button>

                <button onClick={() => setActiveTab('products')}
                  className="btn-admin bg-white border-2 border-rose-200 text-blush-700 hover:border-blush-400">
                  <Pencil size={32} className="text-blush-400" />
                  <div className="text-left">
                    <p className="text-xl font-semibold">Gérer les produits</p>
                    <p className="text-sm text-blush-400 mt-0.5">Modifier, stock, supprimer</p>
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

                <button onClick={() => setActiveTab('categories')}
                  className="btn-admin bg-white border-2 border-rose-200 text-blush-700 hover:border-blush-400">
                  <Tag size={32} className="text-blush-400" />
                  <div className="text-left">
                    <p className="text-xl font-semibold">Catégories</p>
                    <p className="text-sm text-blush-400 mt-0.5">Créer, renommer, supprimer</p>
                  </div>
                </button>

                <button onClick={() => setActiveTab('pricing')}
                  className="btn-admin bg-white border-2 border-rose-200 text-blush-700 hover:border-blush-400">
                  <Euro size={32} className="text-blush-400" />
                  <div className="text-left">
                    <p className="text-xl font-semibold">Tarifs sur-mesure</p>
                    <p className="text-sm text-blush-400 mt-0.5">Prix selon la taille</p>
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
                            {typeof req.price === 'number' && <> · <strong className="font-semibold text-blush-600">{req.price} €</strong></>}
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
                            {req.sizeLabel && <p className="flex items-center gap-2 font-sans text-sm text-blush-600"><Ruler size={15} /> {req.sizeLabel}{typeof req.price === 'number' ? ` — ${req.price} €` : ''}</p>}
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
              <button onClick={() => setForm({ mode: 'create' })} className="btn-primary text-sm py-3">
                <Plus size={16} /> Ajouter un produit
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-rose-50">
                <p className="font-script text-5xl text-blush-200 mb-3">Boutique vide</p>
                <p className="font-sans text-blush-400 mb-6">Ajoutez votre premier produit ici.</p>
                <button onClick={() => setForm({ mode: 'create' })} className="btn-primary text-sm">
                  <Plus size={16} /> Ajouter un produit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(product => {
                  const mainImage = getMainImage(product);
                  const imgUrl = mainImage ? urlFor(mainImage).width(400).height(300).url() : null;
                  const categoryLabel = categoryTitles.get(product.category ?? "") ?? getCategoryLabel(product);
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
                        {product.images.length > 1 && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 font-sans text-xs text-gray-600">
                            <Images size={12} /> {product.images.length}
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col gap-2">
                        <h3 className="font-serif text-lg text-gray-800 leading-tight">{product.title}</h3>
                        {categoryLabel
                          ? <p className="font-sans text-xs text-blush-400 uppercase tracking-wider">{categoryLabel}</p>
                          : <p className="font-sans text-xs text-amber-600">⚠️ Sans catégorie</p>}
                        <p className="font-serif text-2xl text-blush-600 font-light">{formatPrice(product.price)}</p>
                        <button onClick={() => setForm({ mode: 'edit', product })}
                          className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blush-500 text-white font-sans text-sm font-medium hover:bg-blush-600 transition-colors">
                          <Pencil size={14} /> Modifier
                        </button>
                        <div className="flex gap-2">
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

        {/* ═══════════ CATEGORIES ═══════════ */}
        {!showAddForm && activeTab === 'categories' && (
          <CategoryManager categories={categories} onChange={setCategories} notify={showToast} />
        )}

        {/* ═══════════ PRICING ═══════════ */}
        {!showAddForm && activeTab === 'pricing' && (
          <PricingManager initialSizes={initialSizes} notify={showToast} />
        )}

      </div>
    </div>
  );
}
