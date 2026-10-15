'use client';

import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  ArrowLeft, ArrowRight, ImageIcon, Loader2, RefreshCw, Star, X, AlertTriangle,
} from 'lucide-react';
import { MAX_PRODUCT_IMAGES } from '@/lib/catalog';

export interface AdminImage {
  /** Local identity for React keys (stable across reorders) */
  id: string;
  /** Sanity asset id — undefined while uploading */
  assetId?: string;
  previewUrl: string;
  uploading?: boolean;
  error?: string;
}

interface ImageManagerProps {
  images: AdminImage[];
  setImages: Dispatch<SetStateAction<AdminImage[]>>;
}

const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_DIMENSION = 2000;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

let localId = 0;
const nextId = () => `img-${Date.now()}-${localId++}`;

/** Downscale large photos (phone pictures are often 5–12 Mo) so uploads stay fast and under the server limit. */
async function prepareImage(file: File): Promise<File> {
  if (file.type === 'image/gif' || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#ffffff'; // transparent PNG → white background in JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

async function uploadImage(file: File): Promise<{ assetId: string; url: string }> {
  const prepared = await prepareImage(file);
  const fd = new FormData();
  fd.append('file', prepared);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Échec de l'envoi");
  return data;
}

export default function ImageManager({ images, setImages }: ImageManagerProps) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const remaining = MAX_PRODUCT_IMAGES - images.length;

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return `« ${file.name} » : format non supporté (JPG, PNG, WebP).`;
    if (file.size > MAX_SOURCE_BYTES) return `« ${file.name} » : fichier trop lourd (max 25 Mo).`;
    return null;
  };

  /** Uploads `file` into the slot `id` (already present in the list with a local preview). */
  const uploadInto = async (id: string, file: File) => {
    try {
      const { assetId } = await uploadImage(file);
      setImages((prev) => prev.map((img) => (img.id === id ? { ...img, assetId, uploading: false, error: undefined } : img)));
    } catch (err: any) {
      setImages((prev) => prev.map((img) => (img.id === id ? { ...img, uploading: false, error: err.message } : img)));
    }
  };

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    setNotice('');
    if (!files.length) return;

    const accepted: File[] = [];
    const problems: string[] = [];
    for (const file of files) {
      const problem = validate(file);
      if (problem) problems.push(problem);
      else accepted.push(file);
    }
    if (accepted.length > remaining) {
      problems.push(`${MAX_PRODUCT_IMAGES} photos maximum : ${accepted.length - remaining} photo(s) ignorée(s).`);
      accepted.splice(remaining);
    }
    if (problems.length) setNotice(problems.join(' '));

    const slots: AdminImage[] = accepted.map((file) => ({
      id: nextId(),
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }));
    setImages((prev) => [...prev, ...slots]);
    slots.forEach((slot, i) => uploadInto(slot.id, accepted[i]));
  };

  const handleReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const id = replaceTarget.current;
    replaceTarget.current = null;
    if (!file || !id) return;
    const problem = validate(file);
    if (problem) { setNotice(problem); return; }
    setNotice('');
    // Same slot (same position), new picture
    setImages((prev) => prev.map((img) =>
      img.id === id ? { id, previewUrl: URL.createObjectURL(file), uploading: true } : img
    ));
    uploadInto(id, file);
  };

  const move = (from: number, to: number) => {
    setImages((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const remove = (id: string) => setImages((prev) => prev.filter((img) => img.id !== id));

  const iconBtn =
    'w-8 h-8 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-gray-600 hover:text-blush-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors';

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            draggable={!img.uploading}
            onDragStart={() => setDragId(img.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!dragId) return;
              move(images.findIndex((x) => x.id === dragId), index);
              setDragId(null);
            }}
            className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-petal group ${
              index === 0 ? 'border-blush-400' : 'border-rose-100'
            } ${dragId === img.id ? 'opacity-40' : ''} ${img.error ? 'border-red-300' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" draggable={false} />

            {index === 0 && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blush-500 text-white font-sans text-[10px] font-semibold uppercase tracking-wider">
                <Star size={10} className="fill-white" /> Principale
              </span>
            )}

            {img.uploading && (
              <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-blush-500" />
                <span className="font-sans text-xs text-blush-600">Envoi…</span>
              </div>
            )}

            {img.error && (
              <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center gap-2 p-3 text-center">
                <AlertTriangle size={20} className="text-red-500" />
                <span className="font-sans text-xs text-red-600">{img.error}</span>
              </div>
            )}

            {/* Controls — always visible (touch friendly) */}
            <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between gap-1 bg-gradient-to-t from-black/40 to-transparent">
              <div className="flex gap-1">
                <button type="button" className={iconBtn} onClick={() => move(index, index - 1)} disabled={index === 0} title="Déplacer à gauche" aria-label="Déplacer à gauche">
                  <ArrowLeft size={14} />
                </button>
                <button type="button" className={iconBtn} onClick={() => move(index, index + 1)} disabled={index === images.length - 1} title="Déplacer à droite" aria-label="Déplacer à droite">
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="flex gap-1">
                {index !== 0 && !img.uploading && (
                  <button type="button" className={iconBtn} onClick={() => move(index, 0)} title="Mettre en photo principale" aria-label="Mettre en photo principale">
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  className={iconBtn}
                  disabled={img.uploading}
                  onClick={() => { replaceTarget.current = img.id; replaceRef.current?.click(); }}
                  title="Remplacer la photo"
                  aria-label="Remplacer la photo"
                >
                  <RefreshCw size={14} />
                </button>
                <button type="button" className={`${iconBtn} hover:!text-red-500`} onClick={() => remove(img.id)} title="Retirer la photo" aria-label="Retirer la photo">
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => addRef.current?.click()}
            className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-rose-200 rounded-2xl text-blush-400 hover:border-blush-300 hover:bg-petal transition-all p-3 text-center"
          >
            <ImageIcon size={28} />
            <span className="font-sans text-sm">{images.length ? 'Ajouter des photos' : 'Cliquez pour ajouter des photos'}</span>
            <span className="font-sans text-xs text-blush-300">Plusieurs à la fois · {remaining} restante{remaining > 1 ? 's' : ''}</span>
          </button>
        )}
      </div>

      <p className="mt-3 font-sans text-xs text-gray-400">
        La 1<sup>re</sup> photo est la photo principale (vignette de la boutique). Utilisez les flèches ou glissez-déposez pour changer l&apos;ordre.
      </p>
      {notice && (
        <p className="mt-2 flex items-start gap-1.5 font-sans text-xs text-amber-700">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" /> {notice}
        </p>
      )}

      <input ref={addRef} type="file" accept={ACCEPTED.join(',')} multiple onChange={handleAdd} className="hidden" />
      <input ref={replaceRef} type="file" accept={ACCEPTED.join(',')} onChange={handleReplace} className="hidden" />
    </div>
  );
}
