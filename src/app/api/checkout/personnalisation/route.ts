import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

const PRIX_FIXE = 29;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientName  = searchParams.get('clientName')  || 'Client';
  const clientEmail = searchParams.get('clientEmail') || undefined;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blvcrea.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: PRIX_FIXE * 100,
            product_data: {
              name: 'Création macramé personnalisée — BLVCréa',
              description: `Création sur-mesure pour ${clientName} · Livraison 7 jours ouvrés`,
            },
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'],
      },
      success_url: `${siteUrl}/commande-confirmee?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/personnalisation`,
      metadata: { type: 'personnalisation', clientName, clientEmail: clientEmail || '' },
    });

    // Redirect directly to Stripe Checkout
    return NextResponse.redirect(session.url!);

  } catch (error: any) {
    console.error('[Checkout Personnalisation]', error);
    return NextResponse.redirect(`${siteUrl}/personnalisation?error=paiement`);
  }
}
