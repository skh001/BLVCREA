import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sanityWriteClient, getCustomSizes } from '@/lib/sanity';
import { isAdmin, unauthorized, revalidateStorefront } from '@/lib/admin';
import { MAX_CUSTOM_SIZES } from '@/lib/catalog';
import { randomKey } from '@/lib/utils';

const sizesSchema = z
  .array(
    z.object({
      _key:    z.string().trim().max(40).optional(),
      label:   z.string().trim().min(1, 'Chaque taille doit avoir un nom.').max(40, 'Nom de taille trop long (40 caractères max).'),
      details: z.string().trim().max(60, 'Précision trop longue (60 caractères max).').optional().default(''),
      price:   z.coerce.number({ invalid_type_error: 'Prix invalide.' }).positive('Chaque prix doit être supérieur à 0 €.').max(10000, 'Prix trop élevé.'),
    })
  )
  .min(1, 'Ajoutez au moins une taille.')
  .max(MAX_CUSTOM_SIZES, `${MAX_CUSTOM_SIZES} tailles maximum.`);

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ sizes: await getCustomSizes(sanityWriteClient) });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const parsed = sizesSchema.safeParse(body.sizes);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const sizes = parsed.data.map((s) => ({
    _key: s._key || randomKey(),
    _type: 'customSize',
    label: s.label,
    details: s.details,
    price: Math.round(s.price * 100) / 100,
  }));

  try {
    await sanityWriteClient.createIfNotExists({ _id: 'siteSettings', _type: 'siteSettings' });
    await sanityWriteClient.patch('siteSettings').set({ customSizes: sizes }).commit();
    revalidateStorefront();
    return NextResponse.json({ success: true, sizes: await getCustomSizes(sanityWriteClient) });
  } catch (err) {
    console.error('[Admin Pricing]', err);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement des tarifs." }, { status: 500 });
  }
}
