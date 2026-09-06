"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { ensureInvoiceForOrder } from "@/lib/admin/invoices";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { APP_URL } from "@/lib/emails/constants";
import { orderReference } from "@/lib/order-status";
import {
  ExtraPaymentSchema,
  OrderCustomerSchema,
  ShippingLabelSchema,
  type ExtraPaymentState,
  type OrderCustomerState,
  type ShippingLabelState,
} from "@/lib/definitions";
import {
  SendcloudError,
  cancelParcel,
  createParcel,
  getParcel,
  isSendcloudConfigured,
  listShippingMethods,
  type SendcloudShippingMethod,
} from "@/lib/sendcloud";
import type { OrderStatus } from "@/generated/prisma/client";
import {
  sendOrderConfirmationEmail,
  sendOrderPreparingEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  sendExtraPaymentEmail,
} from "@/lib/emails/send";
import type { OrderEmailData } from "@/lib/emails/templates";

const EMAIL_SENDER_BY_STATUS: Partial<
  Record<OrderStatus, (to: string, name: string | null, order: OrderEmailData) => Promise<void>>
> = {
  PAID: sendOrderConfirmationEmail,
  PREPARING: sendOrderPreparingEmail,
  SHIPPED: sendOrderShippedEmail,
  DELIVERED: sendOrderDeliveredEmail,
  CANCELLED: sendOrderCancelledEmail,
};

function revalidateOrder(id: string) {
  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${id}`);
}

/** Traduit une panne Sendcloud en message affichable dans la fiche commande. */
function sendcloudErrorMessage(error: unknown) {
  if (error instanceof SendcloudError) return error.message;
  console.error("[sendcloud] Appel en échec:", error);
  return "Sendcloud est injoignable pour le moment. Réessayez dans quelques instants.";
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      customerName: true,
      customerEmail: true,
      shipment: { select: { trackingNumber: true, trackingUrl: true, carrier: true, cancelledAt: true } },
      items: {
        select: { quantity: true, priceCents: true, product: { select: { name: true } } },
      },
    },
  });

  if (!order) redirect("/admin/commandes");
  if (order.status === status) return;

  await prisma.order.update({ where: { id }, data: { status } });

  // Une commande payée doit toujours porter une facture numérotée.
  if (status === "PAID" || status === "PREPARING" || status === "SHIPPED" || status === "DELIVERED") {
    await ensureInvoiceForOrder(id);
  }

  const sender = EMAIL_SENDER_BY_STATUS[status];
  if (sender) {
    const shipment = order.shipment && !order.shipment.cancelledAt ? order.shipment : null;
    const emailData: OrderEmailData = {
      id: order.id,
      totalCents: order.totalCents,
      currency: order.currency,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
      tracking: shipment
        ? { number: shipment.trackingNumber, url: shipment.trackingUrl, carrier: shipment.carrier }
        : null,
    };
    await sender(order.customerEmail, order.customerName, emailData);
  }

  revalidateOrder(id);
}

/* ------------------------------------------------------------------ */
/* Coordonnées client et adresse de livraison                          */
/* ------------------------------------------------------------------ */

export async function updateOrderCustomer(
  id: string,
  _state: OrderCustomerState,
  formData: FormData
): Promise<OrderCustomerState> {
  await requireAdmin();

  const validatedFields = OrderCustomerSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    phone: formData.get("phone"),
    shippingAddress: formData.get("shippingAddress"),
    shippingPostalCode: formData.get("shippingPostalCode"),
    shippingCity: formData.get("shippingCity"),
    shippingCountry: formData.get("shippingCountry"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  await prisma.order.update({ where: { id }, data: validatedFields.data });
  revalidateOrder(id);

  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Expédition Sendcloud                                                */
/* ------------------------------------------------------------------ */

/**
 * Méthodes d'expédition proposées par Sendcloud pour le pays de livraison et le
 * poids saisi. Appelée depuis le formulaire d'étiquette à chaque changement de
 * poids, la liste dépendant de la plage acceptée par chaque transporteur.
 */
export async function listShippingOptions(
  id: string,
  weightGrams: number
): Promise<{ methods: SendcloudShippingMethod[]; message?: string }> {
  await requireAdmin();

  if (!isSendcloudConfigured()) {
    return { methods: [], message: "Sendcloud n'est pas configuré." };
  }

  const order = await prisma.order.findUnique({ where: { id }, select: { shippingCountry: true } });
  if (!order) return { methods: [], message: "Commande introuvable." };

  try {
    const methods = await listShippingMethods({
      toCountry: order.shippingCountry,
      weightGrams: weightGrams > 0 ? weightGrams : undefined,
    });
    return { methods };
  } catch (error) {
    return { methods: [], message: sendcloudErrorMessage(error) };
  }
}

export async function createShippingLabel(
  id: string,
  _state: ShippingLabelState,
  formData: FormData
): Promise<ShippingLabelState> {
  await requireAdmin();

  const validatedFields = ShippingLabelSchema.safeParse({
    weightGrams: formData.get("weightGrams"),
    methodId: formData.get("methodId"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { weightGrams, methodId } = validatedFields.data;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      currency: true,
      customerName: true,
      customerEmail: true,
      phone: true,
      shippingAddress: true,
      shippingCity: true,
      shippingPostalCode: true,
      shippingCountry: true,
      shipment: { select: { cancelledAt: true } },
      items: { select: { quantity: true, priceCents: true, product: { select: { name: true } } } },
    },
  });

  if (!order) return { message: "Commande introuvable." };
  if (order.status === "CANCELLED") return { message: "Cette commande est annulée : aucune étiquette ne peut être créée." };
  if (order.shipment && !order.shipment.cancelledAt) {
    return { message: "Une étiquette est déjà active pour cette commande. Annulez-la avant d'en créer une nouvelle." };
  }

  let parcel;
  try {
    parcel = await createParcel({
      orderReference: orderReference(order.id),
      name: order.customerName,
      email: order.customerEmail,
      phone: order.phone,
      address: order.shippingAddress,
      city: order.shippingCity,
      postalCode: order.shippingPostalCode,
      country: order.shippingCountry,
      weightGrams,
      methodId,
      items: order.items.map((item) => ({
        description: item.product.name,
        quantity: item.quantity,
        valueCents: item.priceCents,
        currency: order.currency,
      })),
    });
  } catch (error) {
    return { message: sendcloudErrorMessage(error) };
  }

  const data = {
    parcelId: String(parcel.id),
    trackingNumber: parcel.tracking_number,
    trackingUrl: parcel.tracking_url,
    carrier: parcel.carrier?.code ?? null,
    methodId: parcel.shipment?.id ?? methodId,
    methodName: parcel.shipment?.name ?? null,
    weightGrams,
    statusId: parcel.status?.id ?? null,
    statusMessage: parcel.status?.message ?? null,
    labelPrinted: false,
    cancelledAt: null,
  };

  await prisma.shipment.upsert({
    where: { orderId: id },
    create: { orderId: id, ...data },
    update: data,
  });

  revalidateOrder(id);
  return { success: true };
}

export async function refreshShipmentTracking(id: string): Promise<{ message?: string }> {
  await requireAdmin();

  const shipment = await prisma.shipment.findUnique({ where: { orderId: id } });
  if (!shipment?.parcelId) return { message: "Aucun colis Sendcloud rattaché à cette commande." };

  try {
    const parcel = await getParcel(Number(shipment.parcelId));
    await prisma.shipment.update({
      where: { orderId: id },
      data: {
        trackingNumber: parcel.tracking_number,
        trackingUrl: parcel.tracking_url,
        carrier: parcel.carrier?.code ?? shipment.carrier,
        statusId: parcel.status?.id ?? null,
        statusMessage: parcel.status?.message ?? null,
      },
    });
  } catch (error) {
    return { message: sendcloudErrorMessage(error) };
  }

  revalidateOrder(id);
  return {};
}

export async function cancelShippingLabel(id: string): Promise<{ message?: string }> {
  await requireAdmin();

  const shipment = await prisma.shipment.findUnique({ where: { orderId: id } });
  if (!shipment?.parcelId) return { message: "Aucune étiquette à annuler." };
  if (shipment.cancelledAt) return { message: "Cette étiquette est déjà annulée." };

  try {
    await cancelParcel(Number(shipment.parcelId));
  } catch (error) {
    return { message: sendcloudErrorMessage(error) };
  }

  await prisma.shipment.update({
    where: { orderId: id },
    data: { cancelledAt: new Date(), statusMessage: "Annulée" },
  });

  revalidateOrder(id);
  return {};
}

/* ------------------------------------------------------------------ */
/* Facture                                                             */
/* ------------------------------------------------------------------ */

export async function generateInvoice(id: string): Promise<{ message?: string }> {
  await requireAdmin();

  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return { message: "Commande introuvable." };
  if (order.status === "PENDING") return { message: "La facture est émise une fois la commande payée." };

  await ensureInvoiceForOrder(id);
  revalidateOrder(id);
  return {};
}

/* ------------------------------------------------------------------ */
/* Paiement complémentaire                                             */
/* ------------------------------------------------------------------ */

export async function createExtraPayment(
  id: string,
  _state: ExtraPaymentState,
  formData: FormData
): Promise<ExtraPaymentState> {
  await requireAdmin();

  const validatedFields = ExtraPaymentSchema.safeParse({
    label: formData.get("label"),
    // La virgule décimale est la saisie naturelle en français.
    amountEuros: String(formData.get("amountEuros") ?? "").replace(",", "."),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  if (!isStripeConfigured()) {
    return { message: "Stripe n'est pas configuré : le lien de paiement ne peut pas être généré." };
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, currency: true, customerName: true, customerEmail: true },
  });
  if (!order) return { message: "Commande introuvable." };

  const { label } = validatedFields.data;
  const amountCents = Math.round(validatedFields.data.amountEuros * 100);

  const payment = await prisma.extraPayment.create({
    data: { orderId: id, label, amountCents, currency: order.currency },
  });

  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: order.currency.toLowerCase(),
            unit_amount: amountCents,
            product_data: { name: `${label} — commande ${orderReference(order.id)}` },
          },
        },
      ],
      metadata: { extraPaymentId: payment.id, orderId: order.id },
      success_url: `${APP_URL}/commande/confirmation?order=${order.id}`,
      cancel_url: `${APP_URL}/commande/confirmation?order=${order.id}`,
    });

    if (!checkoutSession.url) throw new Error("Session Stripe sans URL de paiement.");

    await prisma.extraPayment.update({
      where: { id: payment.id },
      data: { stripeSessionId: checkoutSession.id, checkoutUrl: checkoutSession.url },
    });

    await sendExtraPaymentEmail(order.customerEmail, order.customerName, {
      orderId: order.id,
      label,
      amountCents,
      currency: order.currency,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    await prisma.extraPayment.delete({ where: { id: payment.id } });
    console.error("[extra-payment] Échec de la création du lien Stripe:", error);
    return { message: "Le lien de paiement n'a pas pu être créé. Réessayez dans quelques instants." };
  }

  revalidateOrder(id);
  return { success: true };
}

export async function cancelExtraPayment(paymentId: string): Promise<{ message?: string }> {
  await requireAdmin();

  const payment = await prisma.extraPayment.findUnique({ where: { id: paymentId } });
  if (!payment) return { message: "Paiement introuvable." };
  if (payment.status !== "PENDING") return { message: "Ce paiement n'est plus en attente." };

  if (payment.stripeSessionId && isStripeConfigured()) {
    try {
      await getStripe().checkout.sessions.expire(payment.stripeSessionId);
    } catch (error) {
      // La session peut avoir déjà expiré côté Stripe : on annule quand même.
      console.error("[extra-payment] Expiration de la session Stripe impossible:", error);
    }
  }

  await prisma.extraPayment.update({
    where: { id: paymentId },
    data: { status: "CANCELLED", checkoutUrl: null },
  });

  revalidateOrder(payment.orderId);
  return {};
}
