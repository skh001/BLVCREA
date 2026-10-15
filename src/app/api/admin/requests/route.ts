import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { isAdmin, unauthorized } from '@/lib/admin';

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { requestId, status } = await req.json();

  const validStatuses = ['nouveau', 'en_cours', 'termine'];
  if (!requestId || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  try {
    const exists = await sanityWriteClient.fetch<number>(`count(*[_type == "customRequest" && _id == $id])`, { id: String(requestId) });
    if (!exists) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    await sanityWriteClient.patch(requestId).set({ status }).commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin Update Request]', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
