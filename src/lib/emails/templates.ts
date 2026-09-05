import { formatCents, formatDate } from "@/lib/format";
import { emailLayout, button, emailTextStyles } from "./layout";
import { APP_URL } from "./constants";

const { ink, inkMuted, border } = emailTextStyles;

function greeting(name: string | null) {
  return name ? `Bonjour ${name},` : "Bonjour,";
}

function orderReference(orderId: string) {
  return `#${orderId.slice(-5).toUpperCase()}`;
}

export type OrderEmailItem = {
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
};

function itemsTable(items: OrderEmailItem[], currency: string) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid ${border}; font-size:14px; color:${ink};">${item.productName} <span style="color:${inkMuted};">× ${item.quantity}</span></td>
          <td style="padding:10px 0; border-bottom:1px solid ${border}; font-size:14px; color:${ink}; text-align:right; white-space:nowrap;">${formatCents(item.priceCents * item.quantity, currency)}</td>
        </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">${rows}</table>`;
}

function orderSummaryBlock(order: OrderEmailData) {
  return `
    <p style="font-size:14px; color:${inkMuted}; margin:0 0 4px;">Commande ${orderReference(order.id)} · ${formatDate(order.createdAt)}</p>
    ${itemsTable(order.items, order.currency)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-top:8px; font-size:15px; font-weight:700; color:${ink};">Total</td>
        <td style="padding-top:8px; font-size:15px; font-weight:700; color:${ink}; text-align:right;">${formatCents(order.totalCents, order.currency)}</td>
      </tr>
    </table>`;
}

export function welcomeEmailTemplate(name: string | null) {
  const subject = "Bienvenue chez Mahaleo";
  const html = emailLayout({
    previewText: "Votre compte Mahaleo est prêt.",
    bodyHtml: `
      <h1 style="font-size:20px; font-weight:700; color:${ink}; margin:0 0 16px;">Bienvenue !</h1>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0 0 8px;">${greeting(name)}</p>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0;">
        Votre compte a bien été créé. Vous pouvez dès maintenant parcourir la boutique, suivre vos commandes et retrouver vos favoris.
      </p>
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
      <h1 style="font-size:20px; font-weight:700; color:${ink}; margin:0 0 16px;">Commande confirmée</h1>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0 0 8px;">${greeting(name)}</p>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0;">
        Nous avons bien reçu votre paiement. Voici le récapitulatif de votre commande :
      </p>
      ${orderSummaryBlock(order)}
      <p style="font-size:14px; line-height:1.6; color:${inkMuted}; margin:16px 0 0;">
        Nous vous préviendrons dès que votre commande sera expédiée.
      </p>
    `,
  });
  return { subject, html };
}

export function orderShippedEmailTemplate(name: string | null, order: OrderEmailData) {
  const subject = `Votre commande ${orderReference(order.id)} est expédiée`;
  const html = emailLayout({
    previewText: `Votre commande ${orderReference(order.id)} est en route.`,
    bodyHtml: `
      <h1 style="font-size:20px; font-weight:700; color:${ink}; margin:0 0 16px;">Votre commande est en route</h1>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0 0 8px;">${greeting(name)}</p>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0;">
        Bonne nouvelle : votre commande ${orderReference(order.id)} vient d'être expédiée.
      </p>
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
      <h1 style="font-size:20px; font-weight:700; color:${ink}; margin:0 0 16px;">Commande livrée</h1>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0 0 8px;">${greeting(name)}</p>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0;">
        Votre commande ${orderReference(order.id)} vous a été livrée. Nous espérons qu'elle vous plaira !
      </p>
      <p style="font-size:14px; line-height:1.6; color:${inkMuted}; margin:16px 0 0;">
        Un souci avec votre colis ? Répondez simplement à cet e-mail.
      </p>
    `,
  });
  return { subject, html };
}

export function orderCancelledEmailTemplate(name: string | null, order: OrderEmailData) {
  const subject = `Votre commande ${orderReference(order.id)} a été annulée`;
  const html = emailLayout({
    previewText: `Votre commande ${orderReference(order.id)} a été annulée.`,
    bodyHtml: `
      <h1 style="font-size:20px; font-weight:700; color:${ink}; margin:0 0 16px;">Commande annulée</h1>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0 0 8px;">${greeting(name)}</p>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0;">
        Votre commande ${orderReference(order.id)} a été annulée. Si un paiement avait été effectué, il vous sera remboursé.
      </p>
      ${orderSummaryBlock(order)}
      <p style="font-size:14px; line-height:1.6; color:${inkMuted}; margin:16px 0 0;">
        Une question sur cette annulation ? Contactez-nous, nous sommes là pour vous aider.
      </p>
    `,
  });
  return { subject, html };
}

export function adminInviteEmailTemplate(name: string | null, setPasswordUrl: string) {
  const subject = "Vous êtes maintenant administrateur Mahaleo";
  const html = emailLayout({
    previewText: "Un accès administrateur a été créé pour vous.",
    bodyHtml: `
      <h1 style="font-size:20px; font-weight:700; color:${ink}; margin:0 0 16px;">Accès administrateur créé</h1>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0 0 8px;">${greeting(name)}</p>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0;">
        Un compte administrateur vient d'être créé pour vous sur Mahaleo. Choisissez votre mot de passe pour y accéder. Ce lien expire dans 1 heure.
      </p>
      ${button(setPasswordUrl, "Choisir mon mot de passe")}
      <p style="font-size:13px; line-height:1.6; color:${inkMuted}; margin:0;">
        Si vous ne vous attendiez pas à cet e-mail, vous pouvez l'ignorer.
      </p>
    `,
  });
  return { subject, html };
}

export function passwordResetEmailTemplate(name: string | null, resetUrl: string) {
  const subject = "Réinitialisez votre mot de passe Mahaleo";
  const html = emailLayout({
    previewText: "Réinitialisez votre mot de passe.",
    bodyHtml: `
      <h1 style="font-size:20px; font-weight:700; color:${ink}; margin:0 0 16px;">Réinitialisation du mot de passe</h1>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0 0 8px;">${greeting(name)}</p>
      <p style="font-size:14px; line-height:1.6; color:${ink}; margin:0;">
        Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau. Ce lien expire dans 1 heure.
      </p>
      ${button(resetUrl, "Choisir un nouveau mot de passe")}
      <p style="font-size:13px; line-height:1.6; color:${inkMuted}; margin:0;">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail : votre mot de passe restera inchangé.
      </p>
    `,
  });
  return { subject, html };
}
