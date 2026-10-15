import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sanityWriteClient, getCategories } from '@/lib/sanity';
import { isAdmin, unauthorized, revalidateStorefront, uniqueSlug } from '@/lib/admin';

const titleSchema = z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.').max(60, 'Nom trop long (60 caractères max).');

const list = () => getCategories(sanityWriteClient);

async function titleTaken(title: string, exceptSlug?: string) {
  const all = await list();
  return all.some((c) => c.slug !== exceptSlug && c.title.toLocaleLowerCase('fr') === title.toLocaleLowerCase('fr'));
}

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ categories: await list() });
}

// ── CREATE ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const parsed = titleSchema.safeParse(body.title);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const title = parsed.data;

  if (await titleTaken(title)) {
    return NextResponse.json({ error: 'Une catégorie porte déjà ce nom.' }, { status: 409 });
  }

  try {
    const slug = await uniqueSlug('category', title);
    const order = await sanityWriteClient.fetch<number>(`count(*[_type == "category"])`);
    await sanityWriteClient.create({
      _id: `category-${slug}`,
      _type: 'category',
      title,
      slug: { _type: 'slug', current: slug },
      order,
    });
    revalidateStorefront();
    return NextResponse.json({ success: true, categories: await list() });
  } catch (err) {
    console.error('[Admin Create Category]', err);
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 });
  }
}

// ── RENAME ───────────────────────────────────────────────────────────────────
// The slug (stored on products and used in URLs) never changes, so renaming
// keeps every product attached and every existing link working.
export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const parsed = titleSchema.safeParse(body.title);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const title = parsed.data;
  const slug = typeof body.slug === 'string' ? body.slug : '';
  if (!slug) return NextResponse.json({ error: 'Catégorie inconnue.' }, { status: 400 });

  if (await titleTaken(title, slug)) {
    return NextResponse.json({ error: 'Une catégorie porte déjà ce nom.' }, { status: 409 });
  }

  try {
    if (body.id) {
      await sanityWriteClient.patch(body.id).set({ title }).commit();
    } else {
      // Category only known from products / defaults: materialise it in Sanity.
      const order = await sanityWriteClient.fetch<number>(`count(*[_type == "category"])`);
      await sanityWriteClient.createOrReplace({
        _id: `category-${slug}`,
        _type: 'category',
        title,
        slug: { _type: 'slug', current: slug },
        order,
      });
    }
    revalidateStorefront();
    return NextResponse.json({ success: true, categories: await list() });
  } catch (err) {
    console.error('[Admin Rename Category]', err);
    return NextResponse.json({ error: 'Erreur lors du renommage.' }, { status: 500 });
  }
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'Catégorie inconnue.' }, { status: 400 });

  try {
    const category = await sanityWriteClient.fetch<{ slug: string } | null>(
      `*[_type == "category" && _id == $id][0]{ "slug": slug.current }`,
      { id }
    );
    if (!category) return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 404 });

    const used = await sanityWriteClient.fetch<number>(
      `count(*[_type == "product" && (category._ref == $id || category == $slug)])`,
      { id, slug: category.slug }
    );
    if (used > 0) {
      return NextResponse.json(
        { error: `Impossible : ${used} produit${used > 1 ? 's utilisent' : ' utilise'} encore cette catégorie. Déplacez-les d'abord.` },
        { status: 409 }
      );
    }

    await sanityWriteClient.delete(id);
    revalidateStorefront();
    return NextResponse.json({ success: true, categories: await list() });
  } catch (err) {
    console.error('[Admin Delete Category]', err);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
