import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sanityWriteClient } from '@/lib/sanity';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Prix fixe pour toutes les créations personnalisées
const PRIX_FIXE = 29;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, color, description, imageUrl } = body;

    // ── Validation ──────────────────────────────────────
    if (!name || !email || !description) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    // ── Save to Sanity ──────────────────────────────────
    await sanityWriteClient.create({
      _type: 'customRequest',
      name,
      email,
      phone: phone || '',
      color: color || 'Non précisée',
      description,
      imageUrl: imageUrl || null,
      status: 'nouveau',
    });

    const colorLabel = color || 'Non précisée';
    const imageSection = imageUrl
      ? `<p><strong>Image d'inspiration :</strong><br>
         <a href="${imageUrl}" style="color:#c07088;">${imageUrl}</a><br>
         <img src="${imageUrl}" alt="Inspiration" style="max-width:300px;border-radius:12px;margin-top:8px;" /></p>`
      : '<p><em>Aucune image fournie.</em></p>';

    // ── Email propriétaire ──────────────────────────────
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BLVCréa <noreply@blvcrea.fr>',
      to: process.env.OWNER_EMAIL!,
      subject: `🌸 Nouvelle commande personnalisée de ${name} — ${PRIX_FIXE} €`,
      html: `
        <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
        <body style="font-family:'Georgia',serif;background:#fdf9f7;margin:0;padding:0;">
          <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="font-family:cursive;font-size:2.5rem;color:#c07088;margin:0;">BLVCréa</h1>
              <p style="color:#b08090;font-size:0.75rem;letter-spacing:0.3em;text-transform:uppercase;margin:4px 0 0;">
                Nouvelle commande personnalisée
              </p>
            </div>

            <div style="text-align:center;margin-bottom:24px;">
              <span style="background:#fdf0f2;border:1px solid #ffd6de;color:#c07088;font-size:1.6rem;font-weight:bold;padding:10px 28px;border-radius:50px;font-family:Georgia,serif;">
                💶 ${PRIX_FIXE} €
              </span>
            </div>

            <div style="background:white;border-radius:16px;padding:32px;border:1px solid #ffd6de;">
              <h2 style="color:#8b4060;font-size:1.2rem;margin-top:0;border-bottom:1px solid #ffd6de;padding-bottom:12px;">
                📋 Informations du client
              </h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;width:140px;">Nom :</td><td style="padding:10px 0;color:#2d1f24;font-weight:bold;">${name}</td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Email :</td><td style="padding:10px 0;"><a href="mailto:${email}" style="color:#c07088;">${email}</a></td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Téléphone :</td><td style="padding:10px 0;color:#2d1f24;">${phone || 'Non renseigné'}</td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Couleur :</td><td style="padding:10px 0;"><span style="background:#fdf0f2;color:#c07088;padding:4px 12px;border-radius:20px;font-size:0.85rem;">${colorLabel}</span></td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Prix :</td><td style="padding:10px 0;color:#c07088;font-weight:bold;font-size:1.1rem;">${PRIX_FIXE} €</td></tr>
              </table>

              <h3 style="color:#8b4060;font-size:1rem;margin-top:24px;margin-bottom:8px;">✏️ Description du projet :</h3>
              <div style="background:#fdf0f2;border-radius:12px;padding:16px;color:#2d1f24;font-size:0.9rem;line-height:1.6;white-space:pre-wrap;">${description}</div>

              <h3 style="color:#8b4060;font-size:1rem;margin-top:24px;margin-bottom:8px;">🖼️ Image d'inspiration :</h3>
              ${imageSection}
            </div>

            <div style="text-align:center;margin-top:24px;">
              <a href="mailto:${email}" style="display:inline-block;background:#c07088;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:0.9rem;font-family:sans-serif;">
                ✉️ Répondre à ${name}
              </a>
            </div>
          </div>
        </body></html>
      `,
    });

    // ── Email confirmation client ────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blvcrea.vercel.app';
    const checkoutUrl = `${siteUrl}/api/checkout/personnalisation?clientName=${encodeURIComponent(name)}&clientEmail=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BLVCréa <noreply@blvcrea.fr>',
      to: email,
      subject: `Votre création personnalisée BLVCréa — ${PRIX_FIXE} € 🌸`,
      html: `
        <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
        <body style="font-family:'Georgia',serif;background:#fdf9f7;padding:0;margin:0;">
          <div style="max-width:500px;margin:0 auto;padding:40px 24px;">
            <h1 style="font-family:cursive;color:#c07088;text-align:center;font-size:2.2rem;margin-bottom:4px;">BLVCréa</h1>
            <p style="text-align:center;font-size:0.7rem;letter-spacing:0.3em;text-transform:uppercase;color:#b08090;margin-bottom:32px;">Macramé Artisanal</p>

            <div style="background:white;border-radius:16px;padding:28px;border:1px solid #ffd6de;">
              <h2 style="color:#2d1f24;font-size:1.3rem;margin-top:0;">Merci ${name} ! 🌸</h2>
              <p style="color:#7a5562;line-height:1.7;margin-bottom:20px;">
                Nous avons bien reçu votre demande de création personnalisée. Voici le récapitulatif :
              </p>

              <div style="background:#fdf0f2;border-radius:12px;padding:16px;margin-bottom:20px;">
                <table style="width:100%;border-collapse:collapse;font-family:sans-serif;">
                  <tr>
                    <td style="padding:8px 0;color:#b08090;font-size:0.85rem;">Couleur choisie</td>
                    <td style="padding:8px 0;color:#2d1f24;font-weight:500;">${colorLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#b08090;font-size:0.85rem;">Prix de la création</td>
                    <td style="padding:8px 0;color:#c07088;font-weight:bold;font-size:1.2rem;">${PRIX_FIXE} €</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#b08090;font-size:0.85rem;">Délai de fabrication</td>
                    <td style="padding:8px 0;color:#2d1f24;">7 jours ouvrés</td>
                  </tr>
                </table>
              </div>

              <p style="color:#7a5562;line-height:1.7;font-size:0.9rem;margin-bottom:24px;">
                Réglez votre commande en cliquant ci-dessous. La fabrication commence dès réception du paiement. 🧵
              </p>

              <div style="text-align:center;margin:24px 0;">
                <a href="${checkoutUrl}"
                  style="display:inline-block;background:#c07088;color:white;padding:16px 40px;border-radius:50px;text-decoration:none;font-size:1.05rem;font-family:sans-serif;font-weight:500;">
                  💳 Payer ${PRIX_FIXE} € maintenant
                </a>
              </div>

              <p style="color:#b08090;font-size:0.78rem;text-align:center;line-height:1.7;">
                Paiement 100% sécurisé par Stripe · Satisfait ou remboursé 14 jours<br>
                Une question ? Répondez simplement à cet email.
              </p>
            </div>

            <p style="color:#7a5562;margin-top:24px;text-align:center;font-size:0.9rem;">
              À très bientôt,<br>
              <span style="font-family:cursive;color:#c07088;font-size:1.4rem;">BLVCréa</span>
            </p>
          </div>
        </body></html>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Custom Order API Error]', error);
    return NextResponse.json({ error: 'Erreur serveur. Veuillez réessayer.' }, { status: 500 });
  }
}
