import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const resend = new Resend(process.env.RESEND_API_KEY!);

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // 🌟 1. On interroge Stripe pour obtenir le vrai nom des produits achetés
    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });
    const lineItems = sessionWithLineItems.line_items?.data || [];
    const productName = lineItems.map(item => item.description).join(', ') || 'Création sur-mesure';
    
    // 🌟 2. On récupère les infos du client, dont le téléphone
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'Client';
    const customerPhone = session.customer_details?.phone || 'Non renseigné';
    const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : '—';

    // 🌟 3. On sécurise la récupération de l'adresse (livraison ou facturation)
    const addr = session.shipping_details?.address || session.customer_details?.address;
    const addressFormatted = addr
      ? `${addr.line1 || ''} ${addr.line2 || ''}, ${addr.postal_code || ''} ${addr.city || ''}, ${addr.country || ''}`
          .replace(/ ,/g, ',') // Nettoie les virgules en trop
      : 'Non renseignée';

    // L'adresse d'envoi officielle une fois le domaine vérifié
    const senderEmail = 'BLVCréa <contact@blvcrea.fr>';

    // ── 1. EMAIL POUR VOUS (PROPRIÉTAIRE) ──────────────────────────────────
    try {
      await resend.emails.send({
        from: senderEmail,
        to: process.env.OWNER_EMAIL || 'blvcrea7@gmail.com',
        subject: `💳 Nouvelle vente — ${amountTotal} € — ${customerName}`,
        html: `
          <!DOCTYPE html>
          <html lang="fr">
          <body style="font-family: Georgia, serif; background: #faf5ff; padding: 40px 24px; max-width: 560px; margin: 0 auto;">
            <h1 style="font-family: cursive; color: #7e22ce; text-align: center; font-size: 2.2rem; margin-bottom: 4px;">BLVCréa</h1>
            <p style="text-align:center; font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #a855f7; margin-bottom: 32px;">
              Nouvelle vente reçue 🎉
            </p>
            <div style="background: white; border-radius: 16px; padding: 28px; border: 1px solid #e9d5ff;">
              <h2 style="color: #6b21a8; font-size: 1.1rem; margin-top: 0; padding-bottom: 12px; border-bottom: 1px solid #e9d5ff;">
                Détails de la commande
              </h2>
              <table style="width:100%; font-family: sans-serif; font-size: 0.9rem; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #9333ea; width: 140px;">Client</td><td style="padding: 8px 0; color: #3b0764; font-weight: bold;">${customerName}</td></tr>
                <tr><td style="padding: 8px 0; color: #9333ea;">Email</td><td style="padding: 8px 0;"><a href="mailto:${customerEmail}" style="color:#7e22ce;">${customerEmail || '—'}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #9333ea;">Téléphone</td><td style="padding: 8px 0; color: #3b0764;">${customerPhone}</td></tr>
                <tr><td style="padding: 8px 0; color: #9333ea;">Produit</td><td style="padding: 8px 0; color: #3b0764;"><strong>${productName}</strong></td></tr>
                <tr><td style="padding: 8px 0; color: #9333ea;">Montant</td><td style="padding: 8px 0; color: #7e22ce; font-size: 1.2rem; font-weight: bold;">${amountTotal} €</td></tr>
                <tr><td style="padding: 12px 0 8px 0; color: #9333ea; vertical-align: top;">Livraison</td><td style="padding: 12px 0 8px 0; color: #3b0764; line-height: 1.4;">${addressFormatted}</td></tr>
                <tr><td style="padding: 8px 0; color: #d8b4fe;">ID Session</td><td style="padding: 8px 0; color: #d8b4fe; font-size: 0.75rem;">${session.id}</td></tr>
              </table>
            </div>
          </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Erreur envoi email propriétaire :", error);
    }

    // ── 2. EMAIL POUR LE CLIENT ─────────────────────────────────────────────
    if (customerEmail) {
      try {
        await resend.emails.send({
          from: senderEmail,
          to: customerEmail,
          subject: `Confirmation de votre commande — BLVCréa`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #3b0764;">
              <h1 style="color: #7e22ce; text-align: center;">Merci pour votre commande !</h1>
              <p>Bonjour ${customerName},</p>
              <p>Votre paiement de <strong>${amountTotal} €</strong> a bien été reçu et confirmé. Je commence la préparation de votre création avec le plus grand soin.</p>
              <p>Vous recevrez un nouvel e-mail dès que votre colis sera expédié à cette adresse :</p>
              <p style="background: #faf5ff; padding: 12px; border-radius: 8px; border: 1px solid #e9d5ff;">${addressFormatted}</p>
              <br />
              <p>À très bientôt,<br /><strong>L'équipe BLVCréa</strong></p>
            </div>
          `
        });
      } catch (error) {
        console.error("Erreur envoi email client :", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}