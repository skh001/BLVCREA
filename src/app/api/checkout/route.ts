import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/sanity';
import { stripe, FREE_SHIPPING_OPTIONS, SHIPPING_COUNTRIES } from '@/lib/stripe';
import { getSiteUrl } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Données produit invalides' }, { status: 400 });
    }

    // Price and title always come from Sanity — never trust amounts sent by the browser.
    const product = await getProductById(productId);
    if (!product || !(product.price > 0)) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }
    if (!product.inStock) {
      return NextResponse.json({ error: 'Ce produit est indisponible' }, { status: 409 });
    }

    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      phone_number_collection: { enabled: true },
      // Lets the customer specify a first name, size or colour for customisable pieces
      custom_fields: [
        {
          key: 'precisions',
          label: { type: 'custom', custom: 'Précisions (prénom, taille, couleur…)' },
          type: 'text',
          optional: true,
          text: { maximum_length: 255 },
        },
      ],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(product.price * 100),
            product_data: {
              name: product.title, // Le Webhook récupère ce nom exact
              description: 'Création en macramé fait main — BLVCréa',
              metadata: { productId: product._id },
            },
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
      shipping_options: FREE_SHIPPING_OPTIONS,
      success_url: `${siteUrl}/commande-confirmee?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/produit/${product.slug.current}`,
      metadata: { productId: product._id, source: 'blvcrea_boutique' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout Error]', error);
    return NextResponse.json({ error: 'Erreur lors du paiement' }, { status: 500 });
  }
}
