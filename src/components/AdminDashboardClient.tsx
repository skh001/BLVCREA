'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CustomRequest, Product } from '@/lib/sanity';
import { urlFor } from '@/lib/sanity';
import Image from 'next/image';
import {
  Plus, Trash2, LogOut, Mail, Phone, Palette,
  ExternalLink, RefreshCw, ChevronDown, ChevronUp,
  PackageX, PackageCheck, AlertTriangle, X, CheckCircle,
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

export default function AdminDashboardClient({ initialRequests, initialProducts }: Props) {
  const router = useRouter();
  const [requests, setRequests]         = useState<CustomRequest[]>(initialRequests);
  const [products, setProducts]         = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab]       = useState<'overview' | 'requests' | 'products'>('overview');
  const [expandedReq, setExpandedReq]   = useState<string | null>(null);
  const [loggingOut, setLoggingOut]     = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [updatingReqId, setUpdatingReqId] = useState<string | null>(null);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);

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

  const handleStatusToggle = async (req: CustomRequest) => {
    const sc = statusConfig[req.status as StatusKey] ?? statusConfig.nouveau;
    const next = sc.next;
    setUpdatingReqId(req._id);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: req._id, status: next }),
      });
      if (!res.ok) throw new Error();
      setRequests(prev => prev.map(r => r._id === req._id ? { ...r, status: next } : r));
      showToast(`Statut mis à jour : ${statusConfig[next as StatusKey].label}`);
    } catch {
      showToast('Erreur lors de la mise à jour.');
    } finally {
      setUpdatingReqId(null);
    }
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
      showToast('Erreur lors de la mise à jour du stock.');
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

  // ──────────────────────────────────────────────────────────────────────────
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
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-rose-100 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="font-serif text-2xl text-gray-800 mb-3">Supprimer ce produit ?</h3>
            <p className="font-sans text-sm text-gray-500 mb-7 leading-relaxed">
              Cette action est <strong>irréversible</strong>. Le produit disparaîtra de la boutique.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 font-sans text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const p = products.find(x => x._id === confirmDeleteId);
                  if (p) handleDelete(p._id, p.title);
                }}
                disabled={!!deletingId}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 font-sans text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deletingId ? 'Suppression…' : '🗑 Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex-shrink-0">
            <span className="font-script text-3xl text-blush-500 block leading-none">BLVCréa</span>
            <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-blush-400">Administration</span>
          </div>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-rose-50 rounded-xl p-1 flex-1 max-w-sm mx-auto min-w-0">
            {([
              { key: 'overview',  label: 'Accueil' },
              { key: 'requests',  label: newCount > 0 ? `Demandes (${newCount})` : 'Demandes' },
              { key: 'products',  label: 'Produits' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-0 px-3 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 truncate ${
                  activeTab === tab.key ? 'bg-white text-blush-700 shadow-sm' : 'text-blush-400 hover:text-blush-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-sans text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>

        {/* Mobile tab bar */}
        <div className="md:hidden flex border-t border-rose-50">
          {(['overview','requests','products'] as const).map((tab, i) => {
            const labels = ['Accueil', newCount > 0 ? `Demandes (${newCount})` : 'Demandes', 'Produits'];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 font-sans text-xs font-medium transition-colors border-b-2 ${
                  activeTab === tab ? 'text-blush-600 border-blush-500' : 'text-blush-400 border-transparent'
                }`}>
                {labels[i]}
              </button>
            );
          })}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* ═══════════ OVERVIEW ═══════════ */}
        {activeTab === 'overview' && (
          <>
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-rose-50 shadow-sm">
              <h1 className="font-serif text-3xl sm:text-4xl text-gray-800 mb-2">Bonjour ! 👋</h1>
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

            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-gray-800 mb-5">Que souhaitez-vous faire ?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="https://blvcrea.sanity.studio/" target="_blank" rel="noopener noreferrer"
                  className="btn-admin bg-blush-500 text-white hover:bg-blush-600 hover:shadow-blush-200">
                  <Plus size={28} />
                  <div className="min-w-0 text-left"><p className="font-semibold leading-tight">Ajouter un produit</p><p className="text-sm opacity-75 mt-1">Photos, prix, description</p></div>
                  <ExternalLink size={18} className="ml-auto opacity-50" />
                </a>
                <button onClick={() => setActiveTab('products')}
                  className="btn-admin bg-white border-2 border-rose-200 text-blush-700 hover:border-blush-400">
                  <Trash2 size={28} className="text-blush-400" />
                  <div className="min-w-0 text-left"><p className="font-semibold leading-tight">Gérer les produits</p><p className="text-sm text-blush-400 mt-1">Stock, modification, suppression</p></div>
                </button>
                <button onClick={() => setActiveTab('requests')}
                  className="btn-admin bg-amber-50 border-2 border-amber-100 text-amber-800 hover:border-amber-300">
                  <Mail size={28} className="text-amber-500" />
                  <div className="min-w-0 text-left">
                    <p className="font-semibold leading-tight">Voir les demandes</p>
                    <p className="text-sm text-amber-600 mt-1">{newCount > 0 ? `${newCount} nouvelle${newCount > 1 ? 's' : ''} !` : `${requests.length} au total`}</p>
                  </div>
                </button>
                <button onClick={() => router.refresh()}
                  className="btn-admin bg-green-50 border-2 border-green-100 text-green-800 hover:border-green-300">
                  <RefreshCw size={28} className="text-green-500" />
                  <div className="min-w-0 text-left"><p className="font-semibold leading-tight">Actualiser la page</p><p className="text-sm text-green-600 mt-1">Voir les nouveautés</p></div>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6 rounded-2xl bg-blush-50 border border-rose-100">
              <div className="flex-1">
                <h3 className="font-serif text-xl text-gray-800 mb-1">Sanity Studio</h3>
                <p className="font-sans text-sm text-blush-500">Modifier photos, descriptions et tout le contenu du site.</p>
              </div>
              <a href="https://your-project.sanity.studio" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex-shrink-0 btn-primary text-sm py-3">
                Ouvrir le studio <ExternalLink size={14} />
              </a>
            </div>

            {requests.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="font-serif text-2xl text-gray-800">Dernières demandes</h2>
                  <button onClick={() => setActiveTab('requests')} className="flex-shrink-0 font-sans text-sm text-blush-500 hover:text-blush-700">Voir tout →</button>
                </div>
                <div className="space-y-3">
                  {requests.slice(0, 3).map(req => {
                    const sc = statusConfig[req.status as StatusKey] ?? statusConfig.nouveau;
                    return (
                      <div key={req._id} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-rose-50 shadow-sm">
                        <span className="text-xl">{sc.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-lg text-gray-800 truncate">{req.name}</p>
                          <p className="font-sans text-xs text-blush-400">{new Date(req.createdAt).toLocaleDateString('fr-FR', {day:'numeric',month:'long'})}</p>
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
        {activeTab === 'requests' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl text-gray-800">Demandes sur-mesure</h2>
              <span className="font-sans text-sm bg-white border border-rose-100 text-blush-500 px-4 py-2 rounded-full shadow-sm">{requests.length} au total</span>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-16 sm:py-20 px-5 bg-white rounded-2xl border border-rose-50">
                <p className="font-script text-4xl sm:text-5xl text-blush-200 mb-3">Aucune demande</p>
                <p className="font-sans text-blush-400">Les demandes apparaîtront ici lorsque des clients rempliront le formulaire.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(req => {
                  const sc = statusConfig[req.status as StatusKey] ?? statusConfig.nouveau;
                  const isExpanded = expandedReq === req._id;
                  const date = new Date(req.createdAt).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'});

                  return (
                    <div key={req._id} className="bg-white rounded-2xl border border-rose-50 shadow-sm overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
                        <div className={`w-fit flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.emoji} <span className="hidden sm:inline">{sc.label}</span>
                        </div>
                        <button onClick={() => setExpandedReq(isExpanded ? null : req._id)} className="flex-1 text-left min-w-0">
                          <p className="font-serif text-xl text-gray-800 truncate">{req.name}</p>
                          <p className="font-sans text-xs text-blush-400">{date} · {req.color}</p>
                        </button>
                        <div className="flex w-full sm:w-auto items-center justify-end gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleStatusToggle(req)}
                            disabled={updatingReqId === req._id}
                            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border font-sans text-xs font-medium transition-colors disabled:opacity-50 ${sc.bg} ${sc.text} border-current hover:opacity-80`}
                          >
                            {updatingReqId === req._id ? '…' : sc.nextLabel}
                          </button>
                          <a href={`mailto:${req.email}?subject=Votre demande BLVCréa`} className="p-2.5 rounded-xl bg-petal text-blush-500 hover:bg-blush-100 transition-colors" title="Répondre">
                            <Mail size={16} />
                          </a>
                          <button onClick={() => setExpandedReq(isExpanded ? null : req._id)} className="p-2.5 rounded-xl bg-petal text-blush-400 hover:bg-blush-100 transition-colors">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 sm:px-5 pb-5 border-t border-rose-50 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <h4 className="font-sans text-xs tracking-widest uppercase text-blush-400">Contact</h4>
                            <a href={`mailto:${req.email}`} className="flex items-center gap-2 font-sans text-base text-blush-600 hover:text-blush-800 transition-colors break-all"><Mail size={15} className="flex-shrink-0"/> {req.email}</a>
                            {req.phone && <a href={`tel:${req.phone}`} className="flex items-center gap-2 font-sans text-base text-blush-600 hover:text-blush-800 transition-colors"><Phone size={15}/> {req.phone}</a>}
                            <p className="flex items-center gap-2 font-sans text-sm text-blush-600"><Palette size={15}/> {req.color}</p>
                            <button
                              onClick={() => handleStatusToggle(req)}
                              disabled={updatingReqId === req._id}
                              className={`sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl border font-sans text-sm font-medium transition-colors disabled:opacity-50 ${sc.bg} ${sc.text} border-current`}
                            >
                              {updatingReqId === req._id ? 'Mise à jour…' : sc.nextLabel}
                            </button>
                          </div>
                          <div>
                            <h4 className="font-sans text-xs tracking-widest uppercase text-blush-400 mb-2">Description du projet</h4>
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
                            <a href={`mailto:${req.email}?subject=Votre demande personnalisée BLVCréa`} className="w-full sm:w-auto btn-primary text-sm py-3">
                              <Mail size={16}/> Répondre à {req.name}
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
        {activeTab === 'products' && (
          <section>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl text-gray-800">Vos produits</h2>
              <a href="https://blvcrea.sanity.studio/desk/product" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto btn-primary text-sm py-3">
                <Plus size={16}/> Ajouter un produit
              </a>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 sm:py-20 px-5 bg-white rounded-2xl border border-rose-50">
                <p className="font-script text-4xl sm:text-5xl text-blush-200 mb-3">Boutique vide</p>
                <p className="font-sans text-blush-400 mb-6">Ajoutez vos premiers produits via Sanity Studio.</p>
                <a href="https://your-project.sanity.studio" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                  <Plus size={16}/> Créer un produit
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(product => {
                  const imgUrl = product.image ? urlFor(product.image).width(400).height(480).url() : null;
                  return (
                    <div key={product._id} className="bg-white rounded-2xl border border-rose-50 shadow-sm overflow-hidden flex flex-col">
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
                          <button
                            onClick={() => handleStockToggle(product)}
                            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl font-sans text-xs font-medium leading-tight text-center transition-all border ${
                              product.inStock
                                ? 'border-red-200 text-red-500 hover:bg-red-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {product.inStock ? <><PackageX size={14} className="flex-shrink-0"/> <span>Indisponible</span></> : <><PackageCheck size={14} className="flex-shrink-0"/> <span>Remettre en stock</span></>}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(product._id)}
                            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={16}/>
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
