import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { ensureInvoiceForOrder } from "@/lib/admin/invoices";
import { sendOrderConfirmationEmail } from "@/lib/emails/send";
import { applyStockForTransition } from "@/lib/stock";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook Stripe non configuré." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe webhook] Signature invalide:", error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  // `completed` arrive aussi pour les moyens de paiement différés (SEPA,
  // virement…) avec payment_status "unpaid" : l'argent n'est alors pas encore
  // encaissé, c'est `async_payment_succeeded` qui confirmera le paiement.
  if (
    (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await handlePaidCheckoutSession(event.data.object);
  }

  return NextResponse.json({ received: true });
}

async function handlePaidCheckoutSession(checkoutSession: Stripe.Checkout.Session) {
  const orderId = checkoutSession.metadata?.orderId;
  const extraPaymentId = checkoutSession.metadata?.extraPaymentId;

  // Complément à montant libre créé depuis la fiche commande : il ne touche ni
  // au statut de la commande ni à la facture, seulement à sa propre ligne.
  if (extraPaymentId) {
    await prisma.extraPayment.update({
      where: { id: extraPaymentId },
      data: { status: "PAID", paidAt: new Date() },
    });
    return;
  }
  if (!orderId) return;

  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : (checkoutSession.payment_intent?.id ?? null);

  // Stripe peut livrer le même événement plusieurs fois : seul le
  // passage à PAID d'une commande pas encore payée déclenche la facture,
  // la sortie de stock et l'e-mail. Une commande annulée puis payée quand même
  // repasse en PAID.
  const previous = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!previous || (previous.status !== "PENDING" && previous.status !== "CANCELLED")) return;

  // Le filtre sur l'ancien statut fait de la mise à jour un verrou optimiste :
  // une livraison concurrente du même événement ne passe pas une deuxième fois.
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: previous.status },
    data: { status: "PAID", stripePaymentIntentId: paymentIntentId },
  });
  if (count === 0) return;

  await applyStockForTransition(orderId, previous.status, "PAID");

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  await ensureInvoiceForOrder(order.id);

  await sendOrderConfirmationEmail(order.customerEmail, order.customerName, {
    id: order.id,
    totalCents: order.totalCents,
    currency: order.currency,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      productName: item.product.name,
      quantity: item.quantity,
      priceCents: item.priceCents,
    })),
  });
}
