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

export type OrderFlowStep = (typeof ORDER_FLOW)[number];

export function orderReference(orderId: string) {
  return `#${orderId.slice(-5).toUpperCase()}`;
}
