import { formatCents, formatCentsExact, formatDate } from "@/lib/format";
import { emailLayout, button, heading, paragraph, note, emailStyles } from "./layout";
import { APP_URL } from "./constants";

const { ink, muted, line, sans, serif, display } = emailStyles;

function greeting(name: string | null) {
  return paragraph(name ? `Bonjour ${escapeHtml(name)},` : "Bonjour,");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function orderReference(orderId: string) {
  return `#${orderId.slice(-5).toUpperCase()}`;
}

type OrderEmailItem = {
  productName: string;
  quantity: number;
  priceCents: number;
};

export type OrderEmailData = {
  id: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  items: OrderEmailItem[];
  tracking?: { number: string | null; url: string | null; carrier: string | null } | null;
};

function itemsTable(items: OrderEmailItem[], currency: string) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0; border-bottom:1px solid ${line}; font-family:${display}; font-size:20px; font-weight:700; line-height:1.1; text-transform:uppercase; color:${ink};">${escapeHtml(item.productName)} <span style="font-family:${serif}; font-size:13px; font-weight:400; font-style:italic; text-transform:none; color:${muted};">× ${item.quantity}</span></td>
          <td style="padding:12px 0; border-bottom:1px solid ${line}; font-family:${sans}; font-size:14px; color:${ink}; text-align:right; white-space:nowrap;">${formatCents(item.priceCents * item.quantity, currency)}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${line};">${rows}</table>`;
}

function orderSummaryBlock(order: OrderEmailData) {
  return `
    <p style="margin:28px 0 10px; font-family:${sans}; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${muted};">Commande ${orderReference(order.id)} · ${formatDate(order.createdAt)}</p>
    ${itemsTable(order.items, order.currency)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px; border-top:3px double ${line};">
      <tr>
        <td style="padding-top:12px; font-family:${sans}; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${ink};">Total</td>
        <td style="padding-top:12px; font-family:${display}; font-size:24px; font-weight:700; line-height:1; color:${ink}; text-align:right;">${formatCents(order.totalCents, order.currency)}</td>
      </tr>
    </table>`;
}

function trackingBlock(order: OrderEmailData) {
  const tracking = order.tracking;
  if (!tracking?.number) return "";

  const carrier = tracking.carrier ? `${escapeHtml(tracking.carrier.toUpperCase())} · ` : "";
  const link = tracking.url ? button(tracking.url, "Suivre mon colis") : "";
  return `
    <p style="margin:16px 0 0; padding:12px 14px; border:1px solid ${line}; font-family:${sans}; font-size:14px; line-height:1.6; color:${muted};">
      ${carrier}Numéro de suivi : <strong style="color:${ink};">${escapeHtml(tracking.number)}</strong>
    </p>
    ${link}`;
}

export function extraPaymentEmailTemplate(
  name: string | null,
  { orderId, label, amountCents, currency, checkoutUrl }: {
    orderId: string;
    label: string;
    amountCents: number;
    currency: string;
    checkoutUrl: string;
  }
) {
  const subject = `Complément à régler pour votre commande ${orderReference(orderId)}`;
  const html = emailLayout({
    previewText: `Un complément de ${formatCentsExact(amountCents, currency)} est à régler.`,
    bodyHtml: `
      ${heading(`Commande ${orderReference(orderId)}`, "Un complément à régler")}
      ${greeting(name)}
      ${paragraph(
        `Pour finaliser votre commande ${orderReference(orderId)}, un complément de <strong>${formatCentsExact(amountCents, currency)}</strong> reste à régler au titre de : ${escapeHtml(label)}.`,
        { last: true }
      )}
      ${button(checkoutUrl, "Régler le complément")}
      ${note("Le paiement est sécurisé par Stripe. Une question ? Répondez simplement à cet e-mail.")}
    `,
  });
  return { subject, html };
}

export function welcomeEmailTemplate(name: string | null) {
  const subject = "Bienvenue chez Mahaleo";
  const html = emailLayout({
    previewText: "Votre compte Mahaleo est prêt.",
    bodyHtml: `
      ${heading("Votre compte", "Bienvenue !")}
      ${greeting(name)}
      ${paragraph(
        "Votre compte a bien été créé. Vous pouvez dès maintenant parcourir la boutique, suivre vos commandes et retrouver vos factures.",
        { last: true }
      )}
      ${button(APP_URL, "Découvrir la boutique")}
    `,
  });
  return { subject, html };
}

export function orderConfirmationEmailTemplate(name: string | null, order: OrderEmailData) {
  const subject = `Confirmation de votre commande ${orderReference(order.id)}`;
  const html = emailLayout({
    previewText: `Votre commande ${orderReference(order.id)} est confirmée.`,
    bodyHtml: `
      ${heading(`Commande ${orderReference(order.id)}`, "Commande confirmée")}
      ${greeting(name)}
      ${paragraph("Nous avons bien reçu votre paiement. Voici le récapitulatif de votre commande :", { last: true })}
      ${orderSummaryBlock(order)}
      ${note("Nous vous préviendrons dès que votre commande sera expédiée.")}
    `,
  });
  return { subject, html };
}

export function orderPreparingEmailTemplate(name: string | null, order: OrderEmailData) {
  const subject = `Votre commande ${orderReference(order.id)} est en préparation`;
  const html = emailLayout({
    previewText: `Nous préparons votre commande ${orderReference(order.id)}.`,
    bodyHtml: `
      ${heading(`Commande ${orderReference(order.id)}`, "En préparation")}
      ${greeting(name)}
      ${paragraph(
        `Votre commande ${orderReference(order.id)} est en cours de préparation dans notre atelier. Elle partira très bientôt.`,
        { last: true }
      )}
      ${orderSummaryBlock(order)}
    `,
  });
  return { subject, html };
}

export function orderShippedEmailTemplate(name: string | null, order: OrderEmailData) {
  const subject = `Votre commande ${orderReference(order.id)} est expédiée`;
  const html = emailLayout({
    previewText: `Votre commande ${orderReference(order.id)} est en route.`,
    bodyHtml: `
      ${heading(`Commande ${orderReference(order.id)}`, "Votre commande est en route")}
      ${greeting(name)}
      ${paragraph(`Bonne nouvelle : votre commande ${orderReference(order.id)} vient d'être expédiée.`, { last: true })}
      ${trackingBlock(order)}
      ${orderSummaryBlock(order)}
    `,
  });
  return { subject, html };
}

export function orderDeliveredEmailTemplate(name: string | null, order: OrderEmailData) {
  const subject = `Votre commande ${orderReference(order.id)} a été livrée`;
  const html = emailLayout({
    previewText: `Votre commande ${orderReference(order.id)} a été livrée.`,
    bodyHtml: `
      ${heading(`Commande ${orderReference(order.id)}`, "Commande livrée")}
      ${greeting(name)}
      ${paragraph(
        `Votre commande ${orderReference(order.id)} vous a été livrée. Nous espérons qu'elle vous plaira !`,
        { last: true }
      )}
      ${note("Un souci avec votre colis ? Répondez simplement à cet e-mail.")}
    `,
  });
  return { subject, html };
}

export function orderCancelledEmailTemplate(name: string | null, order: OrderEmailData) {
  const subject = `Votre commande ${orderReference(order.id)} a été annulée`;
  const html = emailLayout({
    previewText: `Votre commande ${orderReference(order.id)} a été annulée.`,
    bodyHtml: `
      ${heading(`Commande ${orderReference(order.id)}`, "Commande annulée")}
      ${greeting(name)}
      ${paragraph(
        `Votre commande ${orderReference(order.id)} a été annulée. Si un paiement avait été effectué, il vous sera remboursé.`,
        { last: true }
      )}
      ${orderSummaryBlock(order)}
      ${note("Une question sur cette annulation ? Contactez-nous, nous sommes là pour vous aider.")}
    `,
  });
  return { subject, html };
}

export function adminInviteEmailTemplate(name: string | null, setPasswordUrl: string) {
  const subject = "Vous êtes maintenant administrateur Mahaleo";
  const html = emailLayout({
    previewText: "Un accès administrateur a été créé pour vous.",
    bodyHtml: `
      ${heading("Administration", "Accès administrateur créé")}
      ${greeting(name)}
      ${paragraph(
        "Un compte administrateur vient d'être créé pour vous sur Mahaleo. Choisissez votre mot de passe pour y accéder. Ce lien expire dans 1 heure.",
        { last: true }
      )}
      ${button(setPasswordUrl, "Choisir mon mot de passe")}
      ${note("Si vous ne vous attendiez pas à cet e-mail, vous pouvez l'ignorer.")}
    `,
  });
  return { subject, html };
}

export function contactMessageEmailTemplate(name: string, fromEmail: string, message: string) {
  const subject = `Nouveau message de contact de ${name}`;
  const html = emailLayout({
    previewText: `${escapeHtml(name)} vous a envoyé un message depuis le site.`,
    bodyHtml: `
      ${heading("Formulaire de contact", "Nouveau message")}
      ${paragraph(`<strong>${escapeHtml(name)}</strong> <span style="color:${muted};">(${escapeHtml(fromEmail)})</span>`, { last: true })}
      <p style="margin:16px 0 0; padding:16px 0 0; border-top:1px solid ${line}; font-family:${sans}; font-size:15px; line-height:1.6; color:${ink}; white-space:pre-wrap;">${escapeHtml(message)}</p>
    `,
  });
  return { subject, html };
}

export function passwordResetEmailTemplate(name: string | null, resetUrl: string) {
  const subject = "Réinitialisez votre mot de passe Mahaleo";
  const html = emailLayout({
    previewText: "Réinitialisez votre mot de passe.",
    bodyHtml: `
      ${heading("Votre compte", "Nouveau mot de passe")}
      ${greeting(name)}
      ${paragraph(
        "Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau. Ce lien expire dans 1 heure.",
        { last: true }
      )}
      ${button(resetUrl, "Choisir un nouveau mot de passe")}
      ${note("Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail : votre mot de passe restera inchangé.")}
    `,
  });
  return { subject, html };
}

export function signupVerificationEmailTemplate(name: string | null, verifyUrl: string) {
  const subject = "Activez votre compte Mahaleo";
  const html = emailLayout({
    previewText: "Confirmez votre adresse e-mail pour activer votre compte.",
    bodyHtml: `
      ${heading("Votre compte", "Plus qu'une étape")}
      ${greeting(name)}
      ${paragraph(
        "Pour activer votre compte Mahaleo, confirmez votre adresse e-mail en cliquant sur le bouton ci-dessous. Ce lien expire dans 24 heures.",
        { last: true }
      )}
      ${button(verifyUrl, "Activer mon compte")}
      ${note("Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail : aucun compte ne sera créé.")}
    `,
  });
  return { subject, html };
}

export function existingAccountSignupEmailTemplate(name: string | null, loginUrl: string, resetUrl: string) {
  const subject = "Vous avez déjà un compte Mahaleo";
  const html = emailLayout({
    previewText: "Une inscription a été tentée avec votre adresse e-mail.",
    bodyHtml: `
      ${heading("Votre compte", "Vous êtes déjà inscrit")}
      ${greeting(name)}
      ${paragraph(
        "Quelqu'un, probablement vous, a essayé de créer un compte Mahaleo avec cette adresse e-mail. Un compte existe déjà : il vous suffit de vous connecter.",
        { last: true }
      )}
      ${button(loginUrl, "Me connecter")}
      ${note(`Mot de passe oublié ? <a href="${resetUrl}" style="color:${ink};">Choisissez-en un nouveau</a>. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre compte n'a pas été modifié.`)}
    `,
  });
  return { subject, html };
}
