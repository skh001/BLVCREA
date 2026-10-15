import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { DEFAULT_CATEGORIES, DEFAULT_CUSTOM_SIZES, type Category, type CustomSize } from './catalog';
import { humanizeSlug } from './utils';

// No CDN: the CDN can serve stale documents for a while after an admin edit,
// which made pages re-render with outdated data. Next's own page cache (ISR +
// revalidatePath on admin writes) already keeps reads cheap.
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface SanityImage {
  _key?: string;
  _type?: 'image';
  asset: { _ref: string; _type?: 'reference' };
  hotspot?: unknown;
  crop?: unknown;
}

export interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  description: string;
  /** Ordered gallery — the first image is the featured one */
  images: SanityImage[];
  /** Category slug (matches Category.slug) — resolved from the category reference */
  category: string | null;
  /** Resolved category name, when the category exists in Sanity */
  categoryTitle?: string | null;
  inStock: boolean;
  createdAt: string;
}

export interface CustomRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  color: string;
  description: string;
  imageUrl?: string;
  sizeLabel?: string;
  price?: number;
  createdAt: string;
  status: 'nouveau' | 'en_cours' | 'termine';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getMainImage(product: Pick<Product, 'images'>): SanityImage | null {
  return product.images?.[0] ?? null;
}

export function getCategoryLabel(product: Pick<Product, 'category' | 'categoryTitle'>): string {
  if (product.categoryTitle) return product.categoryTitle;
  if (!product.category || typeof product.category !== 'string') return '';
  const fallback = DEFAULT_CATEGORIES.find((c) => c.slug === product.category);
  return fallback?.title ?? humanizeSlug(product.category);
}

// ── Queries ──────────────────────────────────────────────────────────────────

// Products reference a category document (`category: { _ref }`). Very old
// products may still hold a plain string key; both are resolved to the slug.
const CATEGORY_SLUG = `select(defined(category._ref) => category->slug.current, category)`;

// `images` falls back to the legacy single `image` field so products created
// before the gallery feature keep working without a data migration.
export const PRODUCT_PROJECTION = `{
  _id, title, slug, price, description, inStock,
  "createdAt": _createdAt,
  "images": coalesce(images[defined(asset)], select(defined(image.asset) => [image], [])),
  "category": ${CATEGORY_SLUG},
  "categoryTitle": select(
    defined(category._ref) => category->title,
    *[_type == "category" && slug.current == ^.category][0].title
  )
}`;

const PUBLISHED = `!(_id in path("drafts.**"))`;

export async function getAllProducts(): Promise<Product[]> {
  return sanityClient.fetch(
    `*[_type == "product" && ${PUBLISHED}] | order(_createdAt desc) ${PRODUCT_PROJECTION}`
  );
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return sanityClient.fetch(
    `*[_type == "product" && ${PUBLISHED} && (category->slug.current == $category || category == $category)]
      | order(_createdAt desc) ${PRODUCT_PROJECTION}`,
    { category }
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Ordered so the result is deterministic even if legacy duplicate slugs exist.
  return sanityClient.fetch(
    `*[_type == "product" && ${PUBLISHED} && slug.current == $slug] | order(_createdAt asc)[0] ${PRODUCT_PROJECTION}`,
    { slug }
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  return sanityClient.fetch(`*[_type == "product" && _id == $id][0] ${PRODUCT_PROJECTION}`, { id });
}

/**
 * All categories with their product counts. Falls back to the built-in list
 * when none exist in Sanity yet, and appends any category key used by a product
 * that has no matching category document, so no product is ever unreachable.
 */
export async function getCategories(client = sanityClient): Promise<Category[]> {
  const [docs, used] = await Promise.all([
    client.fetch<Category[]>(
      `*[_type == "category" && ${PUBLISHED} && defined(slug.current)]
        | order(coalesce(order, 999) asc, title asc) { _id, title, "slug": slug.current }`
    ),
    client.fetch<{ key: unknown }[]>(`*[_type == "product" && ${PUBLISHED} && defined(category)]{ "key": ${CATEGORY_SLUG} }`),
  ]);

  const counts = new Map<string, number>();
  for (const { key } of used) {
    if (typeof key === 'string' && key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const base: Category[] = docs.length ? docs : DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  const known = new Set(base.map((c) => c.slug));
  const orphans: Category[] = Array.from(counts.keys())
    .filter((key) => !known.has(key))
    .map((key) => ({
      slug: key,
      title: DEFAULT_CATEGORIES.find((c) => c.slug === key)?.title ?? humanizeSlug(key),
    }));

  return [...base, ...orphans].map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }));
}

export async function getCustomSizes(client = sanityClient): Promise<CustomSize[]> {
  const sizes = await client.fetch<CustomSize[] | null>(
    `*[_id == "siteSettings"][0].customSizes[defined(label) && defined(price)]{ _key, label, details, price }`
  );
  return sizes && sizes.length ? sizes : DEFAULT_CUSTOM_SIZES;
}

export async function getCustomRequests(): Promise<CustomRequest[]> {
  return sanityWriteClient.fetch(`
    *[_type == "customRequest"] | order(_createdAt desc)[0...50] {
      _id, name, email, phone, color, description, imageUrl, sizeLabel, price,
      "createdAt": _createdAt, status
    }
  `);
}
