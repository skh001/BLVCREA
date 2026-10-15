'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle, AlertCircle, X, ImageIcon, Ruler } from 'lucide-react';
import type { CustomSize } from '@/lib/catalog';

const COLOR_OPTIONS = [
  { value: 'Blanc naturel', bg: '#f9f4f0', border: '#e0d5cc', dark: false },
  { value: 'Rose blush',    bg: '#ffb8c8', border: '#e89aaa', dark: false },
  { value: 'Vieux rose',    bg: '#c49ca0', border: '#a88090', dark: true  },
  { value: 'Beige sable',   bg: '#d4b896', border: '#c0a07a', dark: true  },
  { value: 'Terracotta',    bg: '#c87060', border: '#b05040', dark: true  },
  { value: 'Vert sauge',    bg: '#9caf90', border: '#7a9070', dark: true  },
  { value: 'Gris perle',    bg: '#b8b8c4', border: '#9898a8', dark: true  },
  { value: 'Noir charbon',  bg: '#3c3c44', border: '#1c1c24', dark: true  },
];

const schema = z.object({
  name:        z.string().trim().min(2,  'Prénom et nom requis').max(100, 'Nom trop long (100 caractères max)'),
  email:       z.string().trim().email('Adresse email invalide').max(200),
  phone:       z.string().trim().max(30, 'Numéro trop long')
                 .regex(/^[0-9+().\s-]*$/, 'Numéro de téléphone invalide').optional(),
  size:        z.string().min(1,  'Veuillez choisir une taille'),
  color:       z.string().min(1,  'Veuillez choisir une couleur principale'),
  modele:      z.string().trim().min(2, 'Précisez le type de création (ex: Attrape-rêves)').max(100, 'Texte trop long'),
  diametre:    z.string().trim().max(40, 'Texte trop long').optional(),
  longueur:    z.string().trim().max(40, 'Texte trop long').optional(),
  description: z.string().trim().min(10, 'Précisez votre demande (minimum 10 caractères)').max(3000, 'Texte trop long (3000 caractères max)'),
  /** Honeypot (hidden) */
  website:     z.string().optional(),
});

type FormData = z.infer<typeof schema>;

/** Small inline JPEG (max 1200 px) — used when Cloudinary is not configured or unreachable */
async function toInlineImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Lecture impossible');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', 0.82);
}

async function uploadImage(file: File): Promise<string> {
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (cloudName && uploadPreset) {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', uploadPreset);
      fd.append('folder', 'blvcrea/inspirations');
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.secure_url) return data.secure_url as string;
      console.warn('[Cloudinary] upload failed, using inline image', data.error?.message);
    } catch (err) {
      console.warn('[Cloudinary] unreachable, using inline image', err);
    }
  }
  return toInlineImage(file);
}

const formatEuro = (n: number) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`;

export default function CustomOrderForm({ sizes }: { sizes: CustomSize[] }) {
  const [formStatus,    setFormStatus]    = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg,      setErrorMsg]      = useState('');
  const [imageUrl,      setImageUrl]      = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadErr,     setUploadErr]     = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedSizeKey = watch('size');
  const selectedSize = sizes.find((s) => s._key === selectedSizeKey);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadErr('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('Image trop grande (maximum 5 Mo).');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch {
      setUploadErr("Erreur lors du chargement. Veuillez réessayer.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleColorSelect = (value: string) => {
    setSelectedColor(value);
    setValue('color', value, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    setFormStatus('loading');
    setErrorMsg('');
    try {
      // Regroupement des champs dans la description pour l'API
      const fullDescription = `Modèle : ${data.modele}\nDiamètre : ${data.diametre || 'Non précisé'}\nLongueur : ${data.longueur || 'Non précisée'}\n\nDétails :\n${data.description}`;
      
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        size: data.size,
        color: data.color,
        website: data.website,
        description: fullDescription,
        imageUrl: imageUrl
      };

      const res = await fetch('/api/custom-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur inconnue');
      setFormStatus('success');
      reset();
      setSelectedColor('');
      setImageUrl(null);
    } catch (err: any) {
      setFormStatus('error');
      setErrorMsg(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (formStatus === 'success') {
    return (
      <div className="text-center py-14 px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 border border-green-100 mb-6">
          <CheckCircle size={36} className="text-green-500" />
        </div>
        <h3 className="font-serif text-3xl text-gray-800 mb-3">Demande envoyée ! ✨</h3>
        <p className="font-sans text-purple-600 max-w-md mx-auto leading-relaxed mb-3">
          Merci ! Nous avons bien reçu les détails de votre projet.
        </p>
        <p className="font-sans text-purple-500/80 text-sm max-w-sm mx-auto leading-relaxed mb-8">
          Vous allez recevoir par email le récapitulatif de votre commande et un lien de paiement sécurisé. La fabrication commence dès réception du paiement.
        </p>
        <button onClick={() => setFormStatus('idle')} className="btn-secondary text-sm">
          Faire une nouvelle demande
        </button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Honeypot: invisible to people, filled in by spam bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
            Nom complet <span aria-hidden>*</span>
          </label>
          <input id="name" maxLength={100} {...register('name')} placeholder="Marie Dupont" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" autoComplete="name" />
          {errors.name && <p className="mt-1.5 font-sans text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
            Email <span aria-hidden>*</span>
          </label>
          <input id="email" {...register('email')} type="email" placeholder="marie@exemple.fr" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" autoComplete="email" />
          {errors.email && <p className="mt-1.5 font-sans text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
          Téléphone <span className="text-purple-300 normal-case tracking-normal">(facultatif)</span>
        </label>
        <input id="phone" maxLength={30} {...register('phone')} type="tel" placeholder="+33 6 12 34 56 78" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" autoComplete="tel" />
        {errors.phone && <p className="mt-1.5 font-sans text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      <hr className="border-purple-100/50" />

      {/* Size — price depends on it */}
      <div>
        <p className="font-sans text-xs tracking-widest uppercase text-purple-500 mb-3">
          Taille souhaitée <span aria-hidden>*</span>
        </p>
        <input type="hidden" {...register('size')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Choix de la taille">
          {sizes.map((s) => {
            const active = selectedSizeKey === s._key;
            return (
              <button
                key={s._key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setValue('size', s._key, { shouldValidate: true })}
                className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                  active
                    ? 'border-purple-500 bg-purple-50 shadow-sm shadow-purple-100'
                    : 'border-purple-100 bg-white hover:border-purple-300'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Ruler size={18} className={active ? 'text-purple-600' : 'text-purple-300'} />
                  <span className="min-w-0">
                    <span className="block font-sans text-sm font-medium text-gray-800">{s.label}</span>
                    {s.details && <span className="block font-sans text-xs text-purple-500/80">{s.details}</span>}
                  </span>
                </span>
                <span className={`font-serif text-xl flex-shrink-0 ${active ? 'text-purple-700' : 'text-purple-500'}`}>
                  {formatEuro(s.price)}
                </span>
              </button>
            );
          })}
        </div>
        {errors.size && <p className="mt-1.5 font-sans text-xs text-red-500">{errors.size.message}</p>}
      </div>

      {/* Modèle, Diamètre, Longueur */}
      <div className="space-y-4">
        <div>
          <label htmlFor="modele" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
            Type de création souhaité <span aria-hidden>*</span>
          </label>
          <input id="modele" maxLength={100} {...register('modele')} placeholder="Ex: Attrape-rêves, Suspension murale, etc." className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" />
          {errors.modele && <p className="mt-1.5 font-sans text-xs text-red-500">{errors.modele.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="diametre" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
              Diamètre approximatif
            </label>
            <input id="diametre" maxLength={40} {...register('diametre')} placeholder="Ex: 30 cm" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" />
          </div>
          <div>
            <label htmlFor="longueur" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
              Longueur / Hauteur
            </label>
            <input id="longueur" maxLength={40} {...register('longueur')} placeholder="Ex: 80 cm" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" />
          </div>
        </div>
      </div>

      {/* Color picker */}
      <div>
        <p className="font-sans text-xs tracking-widest uppercase text-purple-500 mb-3">
          Couleur principale souhaitée <span aria-hidden>*</span>
        </p>
        <input type="hidden" {...register('color')} />
        <div className="flex flex-wrap gap-3" role="group" aria-label="Choix de la couleur">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c.value} type="button" title={c.value} aria-label={c.value}
              aria-pressed={selectedColor === c.value}
              onClick={() => handleColorSelect(c.value)}
              className="relative w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
              style={{
                backgroundColor: c.bg,
                border: `2px solid ${c.border}`,
                boxShadow: selectedColor === c.value ? `0 0 0 3px white, 0 0 0 5px ${c.border}` : undefined,
                transform: selectedColor === c.value ? 'scale(1.15)' : undefined,
              }}
            >
              {selectedColor === c.value && (
                <span className={`absolute inset-0 flex items-center justify-center text-xs ${c.dark ? 'text-white' : 'text-gray-700'}`}>✓</span>
              )}
            </button>
          ))}
        </div>
        {selectedColor && <p className="mt-2 font-sans text-xs text-purple-600">Sélectionnée : <strong>{selectedColor}</strong></p>}
        {errors.color && <p className="mt-1.5 font-sans text-xs text-red-500">{errors.color.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
          Détails supplémentaires <span aria-hidden>*</span>
        </label>
        <textarea
          id="description" {...register('description')} rows={4} maxLength={3000}
          placeholder="Un motif particulier ? Une occasion spéciale ? Dites-nous tout..."
          className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all resize-none"
        />
        {errors.description && <p className="mt-1.5 font-sans text-xs text-red-500">{errors.description.message}</p>}
      </div>

      {/* Image upload */}
      <div>
        <p className="font-sans text-xs tracking-widest uppercase text-purple-500 mb-1">
          Photo d&apos;inspiration <span className="text-purple-300 normal-case tracking-normal">(facultatif)</span>
        </p>
        <p className="font-sans text-xs text-purple-400 mb-3">
          Une photo Pinterest ou une idée repérée. JPG / PNG, max 5 Mo.
        </p>

        {imageUrl ? (
          <div className="flex items-start gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-purple-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl.startsWith('data:') ? imageUrl : `${imageUrl}?w=160`} alt="Inspiration" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-green-700 font-medium flex items-center gap-1.5">
                <CheckCircle size={14} /> Image ajoutée avec succès
              </p>
              <button type="button" onClick={() => setImageUrl(null)}
                className="mt-2 flex items-center gap-1.5 font-sans text-xs text-red-500 hover:text-red-700 transition-colors">
                <X size={12} /> Supprimer l&apos;image
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-purple-200 rounded-2xl text-purple-400 hover:border-purple-400 hover:bg-purple-50/50 transition-all disabled:opacity-60">
            {uploading
              ? <><Loader2 size={28} className="animate-spin text-purple-500" /><span className="font-sans text-sm">Chargement…</span></>
              : <><div className="w-12 h-12 rounded-2xl bg-white border border-purple-100 flex items-center justify-center shadow-sm"><ImageIcon size={22} className="text-purple-400" /></div>
                  <div className="text-center">
                    <span className="font-sans text-sm font-medium text-purple-600 block">Cliquer pour ajouter une photo</span>
                    <span className="font-sans text-xs text-purple-400 mt-1 block">JPG, PNG ou WebP — max 5 Mo</span>
                  </div></>
            }
          </button>
        )}

        {uploadErr && <p className="mt-2 flex items-center gap-1.5 font-sans text-xs text-red-500"><AlertCircle size={12} /> {uploadErr}</p>}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" aria-hidden="true" />
      </div>

      {/* Error */}
      {formStatus === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      {/* Price summary */}
      {selectedSize && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
          <div>
            <p className="font-sans text-sm text-gray-800">Prix de votre création ({selectedSize.label})</p>
            <p className="font-sans text-xs text-purple-500">Livraison offerte</p>
          </div>
          <p className="font-serif text-3xl text-purple-700">{formatEuro(selectedSize.price)}</p>
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={formStatus === 'loading'}
        className="w-full py-4 px-8 rounded-full bg-purple-600 text-white font-sans text-base font-medium tracking-wide hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-purple-200">
        {formStatus === 'loading'
          ? <><Loader2 size={18} className="animate-spin inline mr-2" /> Envoi en cours…</>
          : selectedSize ? `Envoyer ma demande — ${formatEuro(selectedSize.price)} ✨` : 'Envoyer ma demande ✨'
        }
      </button>

      <p className="font-sans text-xs text-center text-purple-400">
        Vous recevrez le récapitulatif et le lien de paiement sécurisé par email.
      </p>
    </form>
  );
}