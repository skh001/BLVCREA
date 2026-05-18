import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, title, price } = body;

    if (!title || !price || price <= 0) {
      return NextResponse.json({ error: 'Données produit invalides' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      // AJOUT : Forcer Stripe à demander le numéro de téléphone du client
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(price * 100),
            product_data: {
              name: title, // Le Webhook va récupérer ce nom exact
              description: 'Création en macramé fait main — BLVCréa',
              metadata: { productId },
            },
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 590, currency: 'eur' },
            display_name: 'Livraison standard (5–7 jours)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Livraison offerte (commande > 80€)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      success_url: `${siteUrl}/commande-confirmee?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/boutique`,
      metadata: { productId, source: 'blvcrea_boutique' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[Stripe Checkout Error]', error);
    return NextResponse.json({ error: 'Erreur lors du paiement' }, { status: 500 });
  }
}