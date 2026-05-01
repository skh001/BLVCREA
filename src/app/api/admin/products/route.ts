import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { cookies } from 'next/headers';

function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

// Delete a product
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
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

// Update product stock status
export async function PATCH(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { productId, inStock } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
  }

  try {
    await sanityWriteClient.patch(productId).set({ inStock }).commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Update Product]', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
