import { NextRequest, NextResponse } from 'next/server';
import { sanityWriteClient } from '@/lib/sanity';
import { stripe, FREE_SHIPPING_OPTIONS, SHIPPING_COUNTRIES } from '@/lib/stripe';
import { getSiteUrl } from '@/lib/utils';

// Price used by payment links sent before size-based pricing existed (no requestId).
const LEGACY_FIXED_PRICE = 29;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('requestId');
  const siteUrl = getSiteUrl();

  let clientName  = searchParams.get('clientName')  || 'Client';
  let clientEmail = searchParams.get('clientEmail') || undefined;
  let price = LEGACY_FIXED_PRICE;
  let sizeLabel = '';

  try {
    if (requestId) {
      // The amount is read from the stored request (priced server-side at submission),
      // so the link cannot be tampered with to change the price.
      const request = await sanityWriteClient.fetch<{
        name: string; email: string; price?: number; sizeLabel?: string;
      } | null>(
        `*[_type == "customRequest" && _id == $id][0]{ name, email, price, sizeLabel }`,
        { id: requestId }
      );
      if (!request) return NextResponse.redirect(`${siteUrl}/personnalisation?error=paiement`);
      clientName  = request.name || clientName;
      clientEmail = request.email || clientEmail;
      price       = request.price && request.price > 0 ? request.price : LEGACY_FIXED_PRICE;
      sizeLabel   = request.sizeLabel || '';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(price * 100),
            product_data: {
              name: `Création macramé personnalisée${sizeLabel ? ` (${sizeLabel})` : ''} — BLVCréa`,
              description: `Création sur-mesure pour ${clientName} · Livraison offerte`,
            },
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
      shipping_options: FREE_SHIPPING_OPTIONS,
      success_url: `${siteUrl}/commande-confirmee?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/personnalisation`,
      metadata: {
        type: 'personnalisation',
        requestId: requestId || '',
        clientName,
        clientEmail: clientEmail || '',
      },
    });

    // Redirect directly to Stripe Checkout
    return NextResponse.redirect(session.url!);

  } catch (error: any) {
    console.error('[Checkout Personnalisation]', error);
    return NextResponse.redirect(`${siteUrl}/personnalisation?error=paiement`);
  }
}
