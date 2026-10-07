import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// Une session Stripe vit au plus 24 h : au-delà (avec une marge), une commande
// jamais payée ne peut plus l'être.
const ABANDONED_AFTER_MS = 25 * 60 * 60 * 1000;

/**
 * Commande créée au clic sur « Payer » mais jamais réglée. Une commande dont
 * le paiement a été initié (prélèvement SEPA en cours : intention de paiement
 * connue) ou qui porte déjà une trace de traitement n'est jamais concernée.
 */
const ABANDONED_ORDER: Prisma.OrderWhereInput = {
  status: "PENDING",
  stripePaymentIntentId: null,
  invoice: null,
  shipment: null,
  extraPayments: { none: {} },
};

/** Supprime la commande d'une session Stripe expirée ou échouée, si elle est restée abandonnée. */
export async function deleteAbandonedOrder(orderId: string) {
  await prisma.order.deleteMany({ where: { id: orderId, ...ABANDONED_ORDER } });
}

/** Filet de sécurité : supprime les commandes abandonnées dont la session Stripe a forcément expiré. */
export async function deleteAbandonedOrders() {
  await prisma.order.deleteMany({
    where: { ...ABANDONED_ORDER, createdAt: { lt: new Date(Date.now() - ABANDONED_AFTER_MS) } },
  });
}

/**
 * Filtre des commandes montrées au client : un paiement abandonné ne l'intéresse
 * pas et ne doit pas apparaître comme une commande « en attente ».
 */
export const VISIBLE_TO_CUSTOMER: Prisma.OrderWhereInput = {
  NOT: { status: "PENDING", stripePaymentIntentId: null },
};
