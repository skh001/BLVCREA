import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { cookies } from 'next/headers';

function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

// ── CREATE a product (with image upload to Sanity) ───────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const title       = formData.get('title') as string;
    const price       = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const category    = formData.get('category') as string;
    const inStock     = formData.get('inStock') === 'true';
    const imageFile   = formData.get('image') as File | null;

    if (!title || isNaN(price)) {
      return NextResponse.json({ error: 'Nom et prix obligatoires.' }, { status: 400 });
    }

    // ── Upload image to Sanity asset store ───────────────────────────────────
    let imageAsset = null;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageAsset = await sanityWriteClient.assets.upload('image', buffer, {
        filename: imageFile.name,
        contentType: imageFile.type,
      });
    }

    // ── Create slug from title ───────────────────────────────────────────────
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // ── Create product document in Sanity ────────────────────────────────────
    const doc: any = {
      _type: 'product',
      title,
      slug: { _type: 'slug', current: slug },
      price,
      description: description || '',
      category: category || 'suspension',
      inStock,
    };

    if (imageAsset) {
      doc.image = {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAsset._id },
      };
    }

    const created = await sanityWriteClient.create(doc);
    return NextResponse.json({ success: true, id: created._id });

  } catch (error: any) {
    console.error('[Admin Create Product]', error);
    return NextResponse.json({ error: 'Erreur lors de la création du produit.' }, { status: 500 });
  }
}

// ── DELETE a product ─────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
  }

  try {
    await sanityWriteClient.delete(productId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Delete Product]', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

// ── PATCH — toggle stock or update fields ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await req.json();
  const { productId, ...fields } = body;

  if (!productId) {
    return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
  }

  try {
    await sanityWriteClient.patch(productId).set(fields).commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Update Product]', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}
