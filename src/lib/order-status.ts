import type { OrderStatus } from "@/generated/prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

/**
 * Étapes du cycle de vie d'une commande, dans l'ordre. `CANCELLED` en est
 * volontairement absent : c'est une sortie de parcours, pas une étape.
 */
export const ORDER_FLOW = ["PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;


/**
 * Libellé du paiement d'une commande. Le statut fait foi : une commande passée
 * à « Payée » à la main (lien Stripe envoyé hors du site, virement…) est réglée
 * même sans intention de paiement rattachée.
 */
export function paymentLabel(
  order: { status: OrderStatus; stripePaymentIntentId: string | null; refundedAt?: Date | null },
  audience: "admin" | "client"
) {
  if (order.refundedAt) return "Remboursé";
  if (order.status === "CANCELLED") return "Commande annulée";
  if (order.status === "PENDING") {
    return order.stripePaymentIntentId ? "Paiement en cours" : "En attente de paiement";
  }
  if (order.stripePaymentIntentId) return "Carte bancaire";
  return audience === "admin" ? "Confirmé manuellement" : "Réglé";
}

export function orderReference(orderId: string) {
  return `#${orderId.slice(-5).toUpperCase()}`;
}
