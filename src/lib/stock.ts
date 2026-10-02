import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CATALOG_TAG } from "@/lib/shop";
import type { OrderStatus } from "@/generated/prisma/client";

/** Statuts pour lesquels les articles d'une commande sont sortis du stock. */
const STOCK_HOLDING_STATUSES: OrderStatus[] = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"];

function holdsStock(status: OrderStatus) {
  return STOCK_HOLDING_STATUSES.includes(status);
}

/**
 * Répercute un changement de statut de commande sur le stock : sortie au
 * paiement, réintégration à l'annulation d'une commande payée (et nouvelle
 * sortie si elle est payée ensuite malgré tout).
 *
 * Le stock est décrémenté au paiement plutôt qu'au checkout pour ne pas bloquer
 * d'articles sur des paniers abandonnés ; il est plafonné à 0 si deux paiements
 * se croisent sur la dernière pièce. Les lignes sans taille (commandes
 * antérieures à son enregistrement) sont ignorées.
 */
export async function applyStockForTransition(orderId: string, from: OrderStatus, to: OrderStatus) {
  const direction = !holdsStock(from) && holdsStock(to) ? -1 : holdsStock(from) && !holdsStock(to) ? 1 : 0;
  if (direction === 0) return;

  const items = await prisma.orderItem.findMany({
    where: { orderId, size: { not: null } },
    select: { productId: true, size: true, quantity: true },
  });

  await prisma.$transaction(
    items.map(
      (item) => prisma.$executeRaw`
        UPDATE "ProductSize"
        SET "stock" = GREATEST("stock" + ${direction * item.quantity}, 0)
        WHERE "productId" = ${item.productId} AND "size" = ${item.size}
      `
    )
  );

  // Pas de contenu périmé toléré : la boutique ne doit pas proposer une taille
  // qui vient de partir (le checkout revérifie de toute façon le stock).
  if (items.length > 0) revalidateTag(CATALOG_TAG, { expire: 0 });
}
