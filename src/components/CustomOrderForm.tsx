'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle, AlertCircle, X, ImageIcon } from 'lucide-react';

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
  name:        z.string().min(2,  'Prénom et nom requis'),
  email:       z.string().email('Adresse email invalide'),
  phone:       z.string().optional(),
  color:       z.string().min(1,  'Veuillez choisir une couleur principale'),
  modele:      z.string().min(2, 'Précisez le type de création (ex: Attrape-rêves)'),
  diametre:    z.string().optional(),
  longueur:    z.string().optional(),
  description: z.string().min(10, 'Précisez votre demande (minimum 10 caractères)'),
});

type FormData = z.infer<typeof schema>;

async function uploadImage(file: File): Promise<string> {
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror   = () => reject(new Error('Lecture impossible'));
      reader.readAsDataURL(file);
    });
  }

  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', uploadPreset);
  fd.append('folder', 'blvcrea/inspirations');

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload échoué');
  return data.secure_url as string;
}

export default function CustomOrderForm() {
  const [formStatus,    setFormStatus]    = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg,      setErrorMsg]      = useState('');
  const [imageUrl,      setImageUrl]      = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadErr,     setUploadErr]     = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

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
        color: data.color,
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
          Nous allons l'étudier et vous reviendrons très vite par email avec un devis personnalisé et un lien de paiement sécurisé.
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

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
            Nom complet <span aria-hidden>*</span>
          </label>
          <input id="name" {...register('name')} placeholder="Marie Dupont" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" autoComplete="name" />
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
        <input id="phone" {...register('phone')} type="tel" placeholder="+33 6 12 34 56 78" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" autoComplete="tel" />
      </div>

      <hr className="border-purple-100/50" />

      {/* Modèle, Diamètre, Longueur */}
      <div className="space-y-4">
        <div>
          <label htmlFor="modele" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
            Type de création souhaité <span aria-hidden>*</span>
          </label>
          <input id="modele" {...register('modele')} placeholder="Ex: Attrape-rêves, Suspension murale, etc." className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" />
          {errors.modele && <p className="mt-1.5 font-sans text-xs text-red-500">{errors.modele.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="diametre" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
              Diamètre approximatif
            </label>
            <input id="diametre" {...register('diametre')} placeholder="Ex: 30 cm" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" />
          </div>
          <div>
            <label htmlFor="longueur" className="block font-sans text-xs tracking-widest uppercase text-purple-500 mb-2">
              Longueur / Hauteur
            </label>
            <input id="longueur" {...register('longueur')} placeholder="Ex: 80 cm" className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all" />
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
          id="description" {...register('description')} rows={4}
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

      {/* Submit */}
      <button type="submit" disabled={formStatus === 'loading'}
        className="w-full py-4 px-8 rounded-full bg-purple-600 text-white font-sans text-base font-medium tracking-wide hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-purple-200">
        {formStatus === 'loading'
          ? <><Loader2 size={18} className="animate-spin inline mr-2" /> Envoi en cours…</>
          : 'Demander mon devis gratuit ✨'
        }
      </button>

      <p className="font-sans text-xs text-center text-purple-400">
        Vous recevrez un devis détaillé par email. Engagement gratuit.
      </p>
    </form>
  );
}