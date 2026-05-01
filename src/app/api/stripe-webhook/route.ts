import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const resend = new Resend(process.env.RESEND_API_KEY!);

// ── This must be a raw body handler ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // ── Handle checkout completed ────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'Client';
    const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : '—';
    const productName = session.metadata?.productId
      ? `Produit #${session.metadata.productId}`
      : 'Création macramé';

    const shippingAddr = session.shipping_details?.address;
    const addressFormatted = shippingAddr
      ? `${shippingAddr.line1 || ''}, ${shippingAddr.postal_code || ''} ${shippingAddr.city || ''}, ${shippingAddr.country || ''}`
      : 'Non renseignée';

    // Notify the owner
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BLVCréa <noreply@blvcrea.fr>',
      to: process.env.OWNER_EMAIL!,
      subject: `💳 Nouvelle vente — ${amountTotal} € — ${customerName}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <body style="font-family: Georgia, serif; background: #fdf9f7; padding: 40px 24px; max-width: 560px; margin: 0 auto;">
          <h1 style="font-family: cursive; color: #c07088; text-align: center; font-size: 2.2rem; margin-bottom: 4px;">BLVCréa</h1>
          <p style="text-align:center; font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #b08090; margin-bottom: 32px;">
            Nouvelle vente reçue 🎉
          </p>

          <div style="background: white; border-radius: 16px; padding: 28px; border: 1px solid #ffd6de;">
            <h2 style="color: #8b4060; font-size: 1.1rem; margin-top: 0; padding-bottom: 12px; border-bottom: 1px solid #ffd6de;">
              Détails de la commande
            </h2>
            <table style="width:100%; font-family: sans-serif; font-size: 0.9rem; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #b08090; width: 140px;">Client</td>
                <td style="padding: 8px 0; color: #2d1f24; font-weight: bold;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #b08090;">Email</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${customerEmail}" style="color:#c07088;">${customerEmail || '—'}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #b08090;">Produit</td>
                <td style="padding: 8px 0; color: #2d1f24;">${productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #b08090;">Montant</td>
                <td style="padding: 8px 0; color: #c07088; font-size: 1.2rem; font-weight: bold;">${amountTotal} €</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #b08090;">Livraison</td>
                <td style="padding: 8px 0; color: #2d1f24;">${addressFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #b08090;">Session Stripe</td>
                <td style="padding: 8px 0; color: #888; font-size: 0.8rem;">${session.id}</td>
              </tr>
            </table>
          </div>

          <div style="text-align:center; margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
            <p style="color: #166534; font-family: sans-serif; font-size: 0.9rem; margin: 0;">
              ✅ Le paiement a été confirmé. N'oubliez pas de préparer la commande dans les 7 jours !
            </p>
          </div>
        </body>
        </html>
      `,
    });
  }

  return NextResponse.json({ received: true });
}
