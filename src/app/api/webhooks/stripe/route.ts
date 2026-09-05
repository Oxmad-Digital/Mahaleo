import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/emails/send";

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

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object;
    const orderId = checkoutSession.metadata?.orderId;

    if (orderId) {
      const paymentIntentId =
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : (checkoutSession.payment_intent?.id ?? null);

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID", stripePaymentIntentId: paymentIntentId },
        include: { items: { include: { product: { select: { name: true } } } } },
      });

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
  }

  return NextResponse.json({ received: true });
}
