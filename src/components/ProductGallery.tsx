'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface GalleryImage {
  /** Stable identity (Sanity asset id) */
  id: string;
  src: string;
  thumb: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const count = images.length;
  const current = images[Math.min(active, count - 1)];

  const go = (delta: number) => setActive((i) => (i + delta + count) % count);

  if (!current) {
    return (
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-petal shadow-xl shadow-blush-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-script text-8xl text-blush-200">BLV</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-petal shadow-xl shadow-blush-100 group"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') go(-1);
          if (e.key === 'ArrowRight') go(1);
        }}
      >
        <Image
          key={current.id}
          src={current.src}
          alt={count > 1 ? `${title} — photo ${active + 1} sur ${count}` : title}
          fill
          priority={active === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover animate-fade-in"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm text-blush-600 shadow-md flex items-center justify-center transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm text-blush-600 shadow-md flex items-center justify-center transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-white/85 backdrop-blur-sm font-sans text-xs text-blush-600">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails — horizontal scroll on small screens */}
      {count > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x" role="tablist" aria-label="Photos du produit">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Afficher la photo ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden snap-start border-2 transition-all ${
                i === active
                  ? 'border-blush-500 shadow-md shadow-blush-100'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.thumb} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
