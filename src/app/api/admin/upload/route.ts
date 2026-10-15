import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { isAdmin, unauthorized } from '@/lib/admin';

// Images are uploaded one at a time (and resized client-side first) so each
// request stays well under the serverless body-size limit (4.5 Mo on Vercel).
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string' || file.size === 0) {
      return NextResponse.json({ error: 'Aucune image reçue.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté (JPG, PNG, WebP).' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image trop lourde (max 4 Mo).' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await sanityWriteClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({ assetId: asset._id, url: asset.url });
  } catch (error) {
    console.error('[Admin Upload]', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'image." }, { status: 500 });
  }
}
