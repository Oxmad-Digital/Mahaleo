import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { APP_URL } from "@/lib/emails/constants";
import { orderReference } from "@/lib/order-status";

// Une session encore ouverte est réutilisée si elle laisse le temps de payer.
const MIN_REMAINING_SECONDS = 10 * 60;

/**
 * Renvoie l'URL Stripe Checkout d'un complément en attente : la session en
 * cours si elle est encore valable, sinon une nouvelle (l'ancienne est
 * expirée pour qu'un seul lien reste payable). Renvoie null si la session en
 * cours vient d'être payée et que le webhook ne l'a pas encore enregistré.
 */
export async function openExtraPaymentCheckout(payment: {
  id: string;
  label: string;
  amountCents: number;
  currency: string;
  stripeSessionId: string | null;
  order: { id: string; customerEmail: string };
}) {
  const stripe = getStripe();

  if (payment.stripeSessionId) {
    const current = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
    if (current.status === "complete") return null;
    if (current.status === "open" && current.url && current.expires_at - Date.now() / 1000 > MIN_REMAINING_SECONDS) {
      return current.url;
    }
    if (current.status === "open") {
      await stripe.checkout.sessions.expire(current.id).catch(() => {});
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: payment.order.customerEmail,
    locale: "fr",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: payment.currency.toLowerCase(),
          unit_amount: payment.amountCents,
          product_data: { name: `${payment.label} — commande ${orderReference(payment.order.id)}` },
        },
      },
    ],
    metadata: { extraPaymentId: payment.id, orderId: payment.order.id },
    success_url: `${APP_URL}/commande/confirmation?order=${payment.order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/paiement/${payment.id}?annule=1`,
  });
  if (!checkoutSession.url) throw new Error("Session Stripe sans URL de paiement.");

  await prisma.extraPayment.update({
    where: { id: payment.id },
    data: { stripeSessionId: checkoutSession.id, checkoutUrl: checkoutSession.url },
  });

  return checkoutSession.url;
}
