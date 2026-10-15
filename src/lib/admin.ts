// Server-only helpers shared by the admin API routes and dashboard.
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ADMIN_COOKIE, isValidSessionToken } from './auth';
import { sanityWriteClient } from './sanity';
import { DEFAULT_CATEGORIES, DEFAULT_CUSTOM_SIZES, LEGACY_CATEGORY_KEYS } from './catalog';
import { humanizeSlug, slugify } from './utils';

export async function isAdmin(): Promise<boolean> {
  return isValidSessionToken(cookies().get(ADMIN_COOKIE)?.value);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}

/** Purge Next's page cache for the whole storefront after an admin write. */
export function revalidateStorefront() {
  revalidatePath('/', 'layout');
}

/** Returns `base`, or `base-2`, `base-3`… — the first slug no other document of `type` uses. */
export async function uniqueSlug(type: 'product' | 'category', title: string, excludeId?: string) {
  const base = slugify(title) || type;
  for (let i = 1; i < 500; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const taken = await sanityWriteClient.fetch<number>(
      `count(*[_type == $type && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
      { type, slug: candidate, id: excludeId ?? '' }
    );
    if (!taken) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Returns a reference to the category document with this slug, creating the
 * document if the category is only known from defaults / legacy data.
 */
export async function categoryReference(slug: string, title?: string) {
  let id = await sanityWriteClient.fetch<string | null>(
    `*[_type == "category" && slug.current == $slug && !(_id in path("drafts.**"))][0]._id`,
    { slug }
  );
  if (!id) {
    id = `category-${slug}`;
    const order = await sanityWriteClient.fetch<number>(`count(*[_type == "category"])`);
    await sanityWriteClient.createIfNotExists({
      _id: id,
      _type: 'category',
      title: title || DEFAULT_CATEGORIES.find((c) => c.slug === slug)?.title || humanizeSlug(slug),
      slug: { _type: 'slug', current: slug },
      order,
    });
  }
  return { _type: 'reference' as const, _ref: id };
}

/**
 * Idempotent data maintenance, run when the admin dashboard loads:
 *  1. Repairs duplicate / missing product slugs. Duplicates were the cause of
 *     product pages showing another product's images (the page loads by slug).
 *  2. Converts products whose category is still a plain string into a
 *     reference to a category document, and once, adds the default
 *     categories that don't exist yet (matched by slug or name).
 *  3. Creates the settings document holding the custom-order price grid.
 */
export async function runDataMaintenance(): Promise<void> {
  // 1. Slugs
  const products = await sanityWriteClient.fetch<{ _id: string; title?: string; slug?: string }[]>(
    `*[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt asc) { _id, title, "slug": slug.current }`
  );
  const seen = new Set<string>();
  for (const p of products) {
    let slug = p.slug;
    if (!slug || seen.has(slug)) {
      const base = slugify(p.slug || p.title || 'produit') || 'produit';
      let i = 2;
      slug = p.slug ? `${base}-${i}` : base;
      while (seen.has(slug) || products.some((o) => o._id !== p._id && o.slug === slug)) {
        slug = `${base}-${++i}`;
      }
      await sanityWriteClient.patch(p._id).set({ slug: { _type: 'slug', current: slug } }).commit();
    }
    seen.add(slug);
  }

  // 2 & 3. Settings + one-time category seed
  await sanityWriteClient.createIfNotExists({
    _id: 'siteSettings',
    _type: 'siteSettings',
    customSizes: DEFAULT_CUSTOM_SIZES.map((s) => ({ ...s, _type: 'customSize' })),
  });

  const stringCategories = await sanityWriteClient.fetch<{ _id: string; category: string }[]>(
    `*[_type == "product" && !(_id in path("drafts.**")) && defined(category) && !defined(category._ref)]{ _id, category }`
  );
  for (const p of stringCategories) {
    if (typeof p.category !== 'string' || !p.category) continue;
    const slug = LEGACY_CATEGORY_KEYS[p.category] ?? p.category;
    await sanityWriteClient.patch(p._id).set({ category: await categoryReference(slug) }).commit();
  }

  const settings = await sanityWriteClient.fetch<{ categoriesSeeded?: boolean }>(
    `*[_id == "siteSettings"][0]{ categoriesSeeded }`
  );
  if (settings?.categoriesSeeded) return;

  const existing = await sanityWriteClient.fetch<{ title?: string; slug?: string }[]>(
    `*[_type == "category"]{ title, "slug": slug.current }`
  );
  const norm = (s?: string) => (s ?? '').toLocaleLowerCase('fr').trim();
  const missing = DEFAULT_CATEGORIES.filter(
    (d) => !existing.some((c) => c.slug === d.slug || norm(c.title) === norm(d.title))
  );
  if (missing.length) {
    const tx = sanityWriteClient.transaction();
    missing.forEach((c, i) =>
      tx.createIfNotExists({
        _id: `category-${c.slug}`,
        _type: 'category',
        title: c.title,
        slug: { _type: 'slug', current: c.slug },
        order: existing.length + i,
      })
    );
    await tx.commit();
  }
  await sanityWriteClient.patch('siteSettings').set({ categoriesSeeded: true }).commit();
}
