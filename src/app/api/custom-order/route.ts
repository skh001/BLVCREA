import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sanityWriteClient } from '@/lib/sanity';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, color, description, imageUrl } = body;

    // ── Validation ─────────────────────────────────────
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

    // ── Send email to owner via Resend ──────────────────
    const colorLabel = color || 'Non précisée';
    const imageSection = imageUrl
      ? `<p><strong>Image d'inspiration :</strong><br>
         <a href="${imageUrl}" style="color:#c07088;">${imageUrl}</a><br>
         <img src="${imageUrl}" alt="Inspiration" style="max-width:300px;border-radius:12px;margin-top:8px;" /></p>`
      : '<p><em>Aucune image fournie.</em></p>';

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BLVCréa <noreply@blvcrea.fr>',
      to: process.env.OWNER_EMAIL!,
      subject: `🌸 Nouvelle demande personnalisée de ${name}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: 'Georgia', serif; background: #fdf9f7; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-family: cursive; font-size: 2.5rem; color: #c07088; margin: 0;">BLVCréa</h1>
              <p style="color: #b08090; font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase; margin: 4px 0 0;">
                Nouvelle demande personnalisée
              </p>
            </div>

            <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #ffd6de; box-shadow: 0 4px 24px rgba(192,112,136,0.08);">
              <h2 style="color: #8b4060; font-size: 1.2rem; margin-top: 0; border-bottom: 1px solid #ffd6de; padding-bottom: 12px;">
                📋 Informations du client
              </h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #b08090; font-size: 0.85rem; width: 140px; vertical-align: top;">Nom :</td>
                  <td style="padding: 10px 0; color: #2d1f24; font-size: 0.95rem; font-weight: bold;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #b08090; font-size: 0.85rem; vertical-align: top;">Email :</td>
                  <td style="padding: 10px 0;">
                    <a href="mailto:${email}" style="color: #c07088;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #b08090; font-size: 0.85rem; vertical-align: top;">Téléphone :</td>
                  <td style="padding: 10px 0; color: #2d1f24;">${phone || 'Non renseigné'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #b08090; font-size: 0.85rem; vertical-align: top;">Couleur :</td>
                  <td style="padding: 10px 0;">
                    <span style="background: #fdf0f2; color: #c07088; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">
                      ${colorLabel}
                    </span>
                  </td>
                </tr>
              </table>

              <h3 style="color: #8b4060; font-size: 1rem; margin-top: 24px; margin-bottom: 8px;">
                ✏️ Description du projet :
              </h3>
              <div style="background: #fdf0f2; border-radius: 12px; padding: 16px; color: #2d1f24; font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap;">
                ${description}
              </div>

              <h3 style="color: #8b4060; font-size: 1rem; margin-top: 24px; margin-bottom: 8px;">
                🖼️ Image d'inspiration :
              </h3>
              ${imageSection}
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="mailto:${email}" 
                 style="display: inline-block; background: #c07088; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-size: 0.9rem; font-family: sans-serif; letter-spacing: 0.05em;">
                ✉️ Répondre à ${name}
              </a>
            </div>

            <p style="text-align: center; margin-top: 24px; color: #b08090; font-size: 0.75rem;">
              Cette demande a été enregistrée dans votre tableau de bord BLVCréa.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    // ── Send confirmation email to customer ─────────────
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BLVCréa <noreply@blvcrea.fr>',
      to: email,
      subject: `Votre demande a bien été reçue — BLVCréa 🌸`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <body style="font-family: 'Georgia', serif; background: #fdf9f7; padding: 40px 24px; max-width: 500px; margin: 0 auto;">
          <h1 style="font-family: cursive; color: #c07088; text-align: center; font-size: 2rem;">BLVCréa</h1>
          <h2 style="color: #2d1f24; font-size: 1.3rem;">Merci pour votre demande, ${name} !</h2>
          <p style="color: #7a5562; line-height: 1.7;">
            Nous avons bien reçu votre demande de création personnalisée.<br><br>
            Nous vous répondrons dans les <strong>48 heures</strong> pour discuter de votre projet et vous proposer un devis.
          </p>
          <p style="color: #7a5562; margin-top: 24px;">
            À très bientôt,<br>
            <span style="font-family: cursive; color: #c07088; font-size: 1.3rem;">BLVCréa</span>
          </p>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Custom Order API Error]', error);
    return NextResponse.json({ error: 'Erreur serveur. Veuillez réessayer.' }, { status: 500 });
  }
}
