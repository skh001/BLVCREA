import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { sanityWriteClient, getCustomSizes } from '@/lib/sanity';
import { escapeHtml, getSiteUrl } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Inspiration image: an https URL (Cloudinary) or an inline image (when Cloudinary is not configured)
const MAX_INLINE_IMAGE = 3_000_000; // ≈ 2.2 Mo image once base64-encoded

const requestSchema = z.object({}, { invalid_type_error: 'Données invalides.', required_error: 'Données invalides.' }).merge(z.object({
  name:        z.string({ required_error: 'Nom requis.' }).trim().min(2, 'Nom requis.').max(100, 'Nom trop long.'),
  email:       z.string({ required_error: 'Adresse email requise.' }).trim().max(200).email('Adresse email invalide.'),
  phone:       z.string().trim().max(30, 'Numéro de téléphone trop long.')
                 .regex(/^[0-9+().\s-]*$/, 'Numéro de téléphone invalide.').optional().or(z.literal('')),
  color:       z.string().trim().max(60).optional(),
  description: z.string({ required_error: 'Décrivez votre projet.' }).trim().min(10, 'Précisez votre demande (10 caractères minimum).').max(4000, 'Description trop longue (4000 caractères max).'),
  size:        z.string().max(60).optional(),
  imageUrl:    z.string().max(MAX_INLINE_IMAGE, 'Image trop lourde.')
                 .refine((v) => /^https:\/\//.test(v) || /^data:image\/(jpeg|png|webp);base64,/.test(v), 'Image invalide.')
                 .nullable().optional(),
  /** Honeypot — hidden field that humans never fill in */
  website:     z.string().optional(),
}));

const fmt = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export async function POST(req: NextRequest) {
  try {
    // ── Validation ──────────────────────────────────────
    const parsed = requestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides.' }, { status: 400 });
    }
    const { name, email, phone, color, description, imageUrl, size, website } = parsed.data;

    // Bots fill every field: answer "success" without saving or emailing anything
    if (website) return NextResponse.json({ success: true });

    // ── Price from the admin-managed size grid (never from the browser) ──
    const sizes = await getCustomSizes();
    const selectedSize = sizes.find((s) => s._key === size);
    if (!selectedSize) {
      const error = size
        ? "Cette taille n'est plus disponible — rechargez la page pour voir les tarifs à jour."
        : 'Veuillez choisir une taille.';
      return NextResponse.json({ error }, { status: 400 });
    }
    const price = selectedSize.price;
    const sizeLabel = selectedSize.details ? `${selectedSize.label} (${selectedSize.details})` : selectedSize.label;

    // ── Save to Sanity ──────────────────────────────────
    const created = await sanityWriteClient.create({
      _type: 'customRequest',
      name,
      email,
      phone: phone || '',
      color: color || 'Non précisée',
      description,
      imageUrl: imageUrl || null,
      sizeKey: selectedSize._key,
      sizeLabel,
      price,
      status: 'nouveau',
    });

    // Escape everything user-supplied before it goes into the HTML emails
    const safeName  = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || 'Non renseigné');
    const safeDesc  = escapeHtml(description);
    const safeSize  = escapeHtml(sizeLabel);
    const colorLabel = escapeHtml(color || 'Non précisée');
    const PRIX = fmt(price);
    const isHttpImage = typeof imageUrl === 'string' && /^https:\/\//.test(imageUrl);
    const imageSection = isHttpImage
      ? `<p><strong>Image d'inspiration :</strong><br>
         <a href="${escapeHtml(imageUrl)}" style="color:#c07088;">${escapeHtml(imageUrl)}</a><br>
         <img src="${escapeHtml(imageUrl)}" alt="Inspiration" style="max-width:300px;border-radius:12px;margin-top:8px;" /></p>`
      : imageUrl
        ? '<p><em>Image jointe — visible dans le tableau de bord admin.</em></p>'
        : '<p><em>Aucune image fournie.</em></p>';

    // ── Email propriétaire ──────────────────────────────
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BLVCréa <noreply@blvcrea.fr>',
      to: process.env.OWNER_EMAIL!,
      subject: `🌸 Nouvelle commande personnalisée de ${name} — ${PRIX} €`,
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
                💶 ${PRIX} €
              </span>
            </div>

            <div style="background:white;border-radius:16px;padding:32px;border:1px solid #ffd6de;">
              <h2 style="color:#8b4060;font-size:1.2rem;margin-top:0;border-bottom:1px solid #ffd6de;padding-bottom:12px;">
                📋 Informations du client
              </h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;width:140px;">Nom :</td><td style="padding:10px 0;color:#2d1f24;font-weight:bold;">${safeName}</td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Email :</td><td style="padding:10px 0;"><a href="mailto:${safeEmail}" style="color:#c07088;">${safeEmail}</a></td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Téléphone :</td><td style="padding:10px 0;color:#2d1f24;">${safePhone}</td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Couleur :</td><td style="padding:10px 0;"><span style="background:#fdf0f2;color:#c07088;padding:4px 12px;border-radius:20px;font-size:0.85rem;">${colorLabel}</span></td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Taille :</td><td style="padding:10px 0;color:#2d1f24;">${safeSize}</td></tr>
                <tr><td style="padding:10px 0;color:#b08090;font-size:0.85rem;">Prix :</td><td style="padding:10px 0;color:#c07088;font-weight:bold;font-size:1.1rem;">${PRIX} € <span style="font-weight:normal;font-size:0.8rem;color:#b08090;">(livraison offerte)</span></td></tr>
              </table>

              <h3 style="color:#8b4060;font-size:1rem;margin-top:24px;margin-bottom:8px;">✏️ Description du projet :</h3>
              <div style="background:#fdf0f2;border-radius:12px;padding:16px;color:#2d1f24;font-size:0.9rem;line-height:1.6;white-space:pre-wrap;">${safeDesc}</div>

              <h3 style="color:#8b4060;font-size:1rem;margin-top:24px;margin-bottom:8px;">🖼️ Image d'inspiration :</h3>
              ${imageSection}
            </div>

            <div style="text-align:center;margin-top:24px;">
              <a href="mailto:${safeEmail}" style="display:inline-block;background:#c07088;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:0.9rem;font-family:sans-serif;">
                ✉️ Répondre à ${safeName}
              </a>
            </div>
          </div>
        </body></html>
      `,
    });

    // ── Email confirmation client ────────────────────────
    const checkoutUrl = `${getSiteUrl()}/api/checkout/personnalisation?requestId=${encodeURIComponent(created._id)}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BLVCréa <noreply@blvcrea.fr>',
      to: email,
      subject: `Votre création personnalisée BLVCréa — ${PRIX} € 🌸`,
      html: `
        <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
        <body style="font-family:'Georgia',serif;background:#fdf9f7;padding:0;margin:0;">
          <div style="max-width:500px;margin:0 auto;padding:40px 24px;">
            <h1 style="font-family:cursive;color:#c07088;text-align:center;font-size:2.2rem;margin-bottom:4px;">BLVCréa</h1>
            <p style="text-align:center;font-size:0.7rem;letter-spacing:0.3em;text-transform:uppercase;color:#b08090;margin-bottom:32px;">Macramé Artisanal</p>

            <div style="background:white;border-radius:16px;padding:28px;border:1px solid #ffd6de;">
              <h2 style="color:#2d1f24;font-size:1.3rem;margin-top:0;">Merci ${safeName} ! 🌸</h2>
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
                    <td style="padding:8px 0;color:#b08090;font-size:0.85rem;">Taille</td>
                    <td style="padding:8px 0;color:#2d1f24;font-weight:500;">${safeSize}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#b08090;font-size:0.85rem;">Prix de la création</td>
                    <td style="padding:8px 0;color:#c07088;font-weight:bold;font-size:1.2rem;">${PRIX} €</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#b08090;font-size:0.85rem;">Livraison</td>
                    <td style="padding:8px 0;color:#2d1f24;">Offerte</td>
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
                  💳 Payer ${PRIX} € maintenant
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
