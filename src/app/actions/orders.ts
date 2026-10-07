"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { ensureCreditNoteForOrder, ensureInvoiceForOrder } from "@/lib/admin/invoices";
import { applyStockForTransition, holdsStock } from "@/lib/stock";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { APP_URL } from "@/lib/emails/constants";
import { orderReference } from "@/lib/order-status";
import { extraPaymentUrl } from "@/lib/extra-payments";
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
  Record<OrderStatus, (to: string, name: string | null, order: OrderEmailData) => Promise<unknown>>
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

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<{ message?: string; warning?: string }> {
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
      stripePaymentIntentId: true,
      refundedAt: true,
      servicePointName: true,
      servicePointAddress: true,
      invoice: { select: { id: true } },
      extraPayments: { where: { status: "PAID" }, select: { id: true } },
      shipment: {
        select: { parcelId: true, trackingNumber: true, trackingUrl: true, carrier: true, cancelledAt: true },
      },
      items: {
        select: { size: true, quantity: true, priceCents: true, product: { select: { name: true } } },
      },
    },
  });

  if (!order) redirect("/admin/commandes");
  if (order.status === status) return {};

  // Un remboursement est définitif : la commande ne peut plus repartir dans le
  // circuit, il faudrait encaisser à nouveau le client.
  if (order.refundedAt && status !== "CANCELLED") {
    return { message: "Cette commande a été remboursée : elle ne peut plus changer de statut." };
  }

  const warnings: string[] = [];
  let refundedCents: number | null = null;

  // Annuler une commande payée rembourse le client : le remboursement est fait
  // avant tout changement, pour ne rien modifier s'il échoue.
  if (status === "CANCELLED" && holdsStock(order.status)) {
    if (order.refundedAt) {
      // Remboursement déjà fait lors d'une tentative précédente interrompue.
    } else if (order.stripePaymentIntentId && isStripeConfigured()) {
      try {
        const refund = await getStripe().refunds.create(
          { payment_intent: order.stripePaymentIntentId, metadata: { orderId: order.id } },
          { idempotencyKey: `order-refund-${order.id}` }
        );
        refundedCents = refund.amount;
        await prisma.order.update({
          where: { id },
          data: { stripeRefundId: refund.id, refundedAt: new Date() },
        });
      } catch (error) {
        console.error("[orders] Remboursement Stripe impossible:", error);
        return {
          message:
            "Le remboursement Stripe a échoué : la commande n'a pas été annulée. Vérifiez le paiement dans le tableau de bord Stripe puis réessayez.",
        };
      }
    } else {
      warnings.push("Aucun paiement Stripe n'est rattaché à cette commande : remboursez le client manuellement.");
    }
    if (order.extraPayments.length > 0) {
      warnings.push("Les compléments déjà réglés ne sont pas remboursés automatiquement : faites-le depuis Stripe si besoin.");
    }

    // Un colis pas encore parti est retiré de Sendcloud ; un colis expédié
    // doit être récupéré par le transporteur.
    const shipment = order.shipment;
    if (shipment?.parcelId && !shipment.cancelledAt && order.status !== "SHIPPED" && order.status !== "DELIVERED") {
      try {
        await cancelParcel(Number(shipment.parcelId));
        await prisma.shipment.update({
          where: { orderId: id },
          data: { cancelledAt: new Date(), statusMessage: "Annulée" },
        });
      } catch (error) {
        warnings.push(`L'étiquette Sendcloud n'a pas pu être annulée : ${sendcloudErrorMessage(error)}`);
      }
    }
  }

  await prisma.order.update({ where: { id }, data: { status } });
  await applyStockForTransition(id, order.status, status);

  // Une commande payée doit toujours porter une facture numérotée.
  if (status === "PAID" || status === "PREPARING" || status === "SHIPPED" || status === "DELIVERED") {
    await ensureInvoiceForOrder(id);
  }

  // Une facture émise ne disparaît pas : l'annulation produit un avoir.
  if (status === "CANCELLED" && order.invoice) {
    await ensureCreditNoteForOrder(id, refundedCents ?? order.totalCents);
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
        size: item.size,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
      tracking: shipment
        ? { number: shipment.trackingNumber, url: shipment.trackingUrl, carrier: shipment.carrier }
        : null,
      refundedCents,
      servicePoint: order.servicePointName ? { name: order.servicePointName, address: order.servicePointAddress } : null,
    };
    await sender(order.customerEmail, order.customerName, emailData);
  }

  revalidateOrder(id);
  return warnings.length > 0 ? { warning: warnings.join(" ") } : {};
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

  const order = await prisma.order.findUnique({
    where: { id },
    select: { shippingCountry: true, deliveryMode: true, shippingCarrier: true },
  });
  if (!order) return { methods: [], message: "Commande introuvable." };

  try {
    const methods = await listShippingMethods({
      toCountry: order.shippingCountry,
      weightGrams: weightGrams > 0 ? weightGrams : undefined,
    });
    // Une commande en point relais ne peut partir qu'avec une méthode point
    // relais du transporteur du point choisi ; une livraison à domicile, jamais.
    if (order.deliveryMode === "SERVICE_POINT") {
      return {
        methods: methods.filter(
          (method) =>
            method.service_point_input === "required" &&
            (!order.shippingCarrier || method.carrier === order.shippingCarrier)
        ),
      };
    }
    return { methods: methods.filter((method) => method.service_point_input !== "required") };
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
      deliveryMode: true,
      servicePointId: true,
      servicePointPostNumber: true,
      shipment: { select: { cancelledAt: true } },
      items: { select: { quantity: true, priceCents: true, product: { select: { name: true } } } },
    },
  });

  if (!order) return { message: "Commande introuvable." };
  if (order.status === "CANCELLED") return { message: "Cette commande est annulée : aucune étiquette ne peut être créée." };
  if (order.deliveryMode === "SERVICE_POINT" && !order.servicePointId) {
    return { message: "Cette commande en point relais n'a pas de point relais enregistré." };
  }
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
      servicePointId: order.deliveryMode === "SERVICE_POINT" ? order.servicePointId : null,
      servicePointPostNumber: order.servicePointPostNumber,
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

  // Le lien envoyé est permanent : la session Stripe est ouverte au clic, une
  // session Checkout expirant au bout de 24 h.
  const sent = await sendExtraPaymentEmail(order.customerEmail, order.customerName, {
    orderId: order.id,
    label,
    amountCents,
    currency: order.currency,
    checkoutUrl: `${APP_URL}${extraPaymentUrl(payment.id)}`,
  });

  revalidateOrder(id);
  if (!sent) {
    return {
      success: true,
      message: "Le complément est créé mais l'e-mail n'a pas pu partir : transmettez le lien au client vous-même.",
    };
  }
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
