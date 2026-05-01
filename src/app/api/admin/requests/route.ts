import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { cookies } from 'next/headers';

function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function PATCH(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { requestId, status } = await req.json();

  const validStatuses = ['nouveau', 'en_cours', 'termine'];
  if (!requestId || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  try {
    await sanityWriteClient.patch(requestId).set({ status }).commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Update Request]', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
