import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  sanityWriteClient, getCategories, PRODUCT_PROJECTION, type Product, type SanityImage,
} from '@/lib/sanity';
import { isAdmin, unauthorized, revalidateStorefront, uniqueSlug, categoryReference } from '@/lib/admin';
import { MAX_PRODUCT_IMAGES, SANITY_IMAGE_ASSET_RE } from '@/lib/catalog';
import { normalizeMultiline, randomKey } from '@/lib/utils';

const productSchema = z.object({
  title:       z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.').max(100, 'Nom trop long (100 caractères max).'),
  price:       z.coerce.number({ invalid_type_error: 'Prix invalide.' }).positive('Entrez un prix valide.').max(100000, 'Prix trop élevé.'),
  description: z.string().max(5000, 'Description trop longue (5000 caractères max).').optional().default(''),
  category:    z.string().trim().max(96).optional().default(''),
  inStock:     z.boolean().optional().default(true),
  images:      z.array(z.object({ assetId: z.string().regex(SANITY_IMAGE_ASSET_RE, 'Image invalide.') }))
                 .max(MAX_PRODUCT_IMAGES, `${MAX_PRODUCT_IMAGES} photos maximum.`)
                 .optional()
                 .default([]),
});

type ProductInput = z.infer<typeof productSchema>;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

type ParsedProduct = ProductInput & { categoryTitle?: string };

async function parseProduct(req: NextRequest): Promise<{ data?: ParsedProduct; error?: string }> {
  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Données invalides.' };

  const data: ParsedProduct = parsed.data;
  if (!data.category) return { error: 'Choisissez une catégorie.' };
  const categories = await getCategories(sanityWriteClient);
  const category = categories.find((c) => c.slug === data.category);
  if (!category) return { error: 'Catégorie inconnue.' };
  data.categoryTitle = category.title;
  const ids = data.images.map((i) => i.assetId);
  if (new Set(ids).size !== ids.length) return { error: 'La même photo est ajoutée plusieurs fois.' };

  return { data: { ...data, description: normalizeMultiline(data.description) } };
}

/** Builds the Sanity `images` array, reusing existing entries (keeps _key, crop & hotspot). */
function buildImages(input: ProductInput['images'], existing: SanityImage[] = []): SanityImage[] {
  return input.map(({ assetId }) => {
    const previous = existing.find((img) => img?.asset?._ref === assetId);
    if (previous) return { ...previous, _key: previous._key || randomKey() };
    return { _key: randomKey(), _type: 'image', asset: { _type: 'reference', _ref: assetId } };
  });
}

async function fetchProduct(id: string) {
  return sanityWriteClient.fetch<Product | null>(`*[_id == $id][0] ${PRODUCT_PROJECTION}`, { id });
}

// ── CREATE a product ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { data, error } = await parseProduct(req);
  if (!data) return badRequest(error!);

  try {
    const created = await sanityWriteClient.create({
      _type: 'product',
      title: data.title,
      slug: { _type: 'slug', current: await uniqueSlug('product', data.title) },
      price: data.price,
      description: data.description,
      category: await categoryReference(data.category, data.categoryTitle),
      inStock: data.inStock,
      images: buildImages(data.images),
    });

    revalidateStorefront();
    return NextResponse.json({ success: true, product: await fetchProduct(created._id) });
  } catch (err) {
    console.error('[Admin Create Product]', err);
    return NextResponse.json({ error: 'Erreur lors de la création du produit.' }, { status: 500 });
  }
}

// ── UPDATE a product (same _id and same URL/slug) ────────────────────────────
export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const productId = req.nextUrl.searchParams.get('id');
  if (!productId) return badRequest('ID produit requis');

  const { data, error } = await parseProduct(req);
  if (!data) return badRequest(error!);

  try {
    const current = await sanityWriteClient.fetch<{ images?: SanityImage[]; image?: SanityImage } | null>(
      `*[_type == "product" && _id == $id][0]{ images, image }`,
      { id: productId }
    );
    if (!current) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });

    const existingImages = [...(current.images ?? []), ...(current.image ? [current.image] : [])];

    await sanityWriteClient
      .patch(productId)
      .set({
        title: data.title,
        price: data.price,
        description: data.description,
        category: await categoryReference(data.category, data.categoryTitle),
        inStock: data.inStock,
        images: buildImages(data.images, existingImages),
      })
      .unset(['image']) // legacy single-image field, now folded into `images`
      .commit();

    revalidateStorefront();
    return NextResponse.json({ success: true, product: await fetchProduct(productId) });
  } catch (err) {
    console.error('[Admin Update Product]', err);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}

// ── DELETE a product ─────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { productId } = await req.json().catch(() => ({}));
  if (!productId || typeof productId !== 'string') return badRequest('ID produit requis');

  try {
    // Only ever delete products — never another kind of document
    const exists = await sanityWriteClient.fetch<number>(`count(*[_type == "product" && _id == $id])`, { id: productId });
    if (!exists) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    await sanityWriteClient.delete(productId);
    revalidateStorefront();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin Delete Product]', err);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

// ── PATCH — toggle stock ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { productId, inStock } = await req.json().catch(() => ({}));
  if (!productId || typeof productId !== 'string' || typeof inStock !== 'boolean') return badRequest('Données invalides');

  try {
    const exists = await sanityWriteClient.fetch<number>(`count(*[_type == "product" && _id == $id])`, { id: productId });
    if (!exists) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    await sanityWriteClient.patch(productId).set({ inStock }).commit();
    revalidateStorefront();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin Update Product]', err);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}
