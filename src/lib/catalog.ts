// Shared catalogue constants & types — safe to import from client and server code.

export interface Category {
  /** Sanity document id — absent for built-in fallbacks not yet saved in Sanity */
  _id?: string;
  title: string;
  /** Stable key stored on products (`product.category`) and used in URLs */
  slug: string;
  /** Number of published products in this category */
  count?: number;
}

export interface CustomSize {
  _key: string;
  label: string;
  details?: string;
  price: number;
}

/** Used to seed Sanity on first admin visit, and as a storefront fallback before that. */
export const DEFAULT_CATEGORIES: { title: string; slug: string }[] = [
  { title: 'Suspension murale',   slug: 'suspension-murale' },
  { title: 'Attrapes-rêves',      slug: 'attrapes-reves' },
  { title: 'Montgolfières',       slug: 'montgolfieres' },
  { title: 'Rideau & Séparateur', slug: 'rideau-separateur' },
  { title: 'Cadre décoratif',     slug: 'cadre-decoratif' },
  { title: 'Table & Vase',        slug: 'table-vase' },
  { title: 'Bijou & Accessoire',  slug: 'bijou-accessoire' },
];

/** Category keys used by the very first version of the admin (stored as plain strings). */
export const LEGACY_CATEGORY_KEYS: Record<string, string> = {
  suspension: 'suspension-murale',
  rideau: 'rideau-separateur',
  cadre: 'cadre-decoratif',
  table: 'table-vase',
  bijou: 'bijou-accessoire',
};

/** Default custom-order size grid — editable from the admin (“Tarifs”). */
export const DEFAULT_CUSTOM_SIZES: CustomSize[] = [
  { _key: 'petit',  label: 'Petit',  details: "jusqu'à 20 cm", price: 29 },
  { _key: 'moyen',  label: 'Moyen',  details: '20 à 35 cm',    price: 39 },
  { _key: 'grand',  label: 'Grand',  details: '35 à 50 cm',    price: 49 },
];

export const MAX_PRODUCT_IMAGES = 10;
export const MAX_CUSTOM_SIZES = 12;

/** Sanity image asset id, e.g. image-abc123-800x600-jpg */
export const SANITY_IMAGE_ASSET_RE = /^image-[a-zA-Z0-9]+-\d+x\d+-[a-z0-9]+$/;

export function minSizePrice(sizes: CustomSize[]): number | null {
  if (!sizes.length) return null;
  return Math.min(...sizes.map((s) => s.price));
}
