import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CATALOG_TAG } from "@/lib/shop";
import { sendOversoldAlertEmail } from "@/lib/emails/send";
import type { OrderStatus } from "@/generated/prisma/client";

/** Statuts pour lesquels les articles d'une commande sont sortis du stock. */
const STOCK_HOLDING_STATUSES: OrderStatus[] = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"];

export function holdsStock(status: OrderStatus) {
  return STOCK_HOLDING_STATUSES.includes(status);
}

/**
 * Répercute un changement de statut de commande sur le stock : sortie au
 * paiement, réintégration à l'annulation d'une commande payée (et nouvelle
 * sortie si elle est payée ensuite malgré tout).
 *
 * Le stock est décrémenté au paiement plutôt qu'au checkout pour ne pas bloquer
 * d'articles sur des paniers abandonnés ; il est plafonné à 0 si deux paiements
 * se croisent sur la dernière pièce, et l'équipe est alors prévenue par e-mail.
 * Les lignes sans taille (commandes antérieures à son enregistrement) sont
 * ignorées.
 */
export async function applyStockForTransition(orderId: string, from: OrderStatus, to: OrderStatus) {
  const direction = !holdsStock(from) && holdsStock(to) ? -1 : holdsStock(from) && !holdsStock(to) ? 1 : 0;
  if (direction === 0) return;

  const items = await prisma.orderItem.findMany({
    where: { orderId, size: { not: null } },
    select: { productId: true, size: true, quantity: true, product: { select: { name: true } } },
  });

  // Le stock d'avant la mise à jour est relu sous verrou : c'est lui qui dit
  // si la sortie était couverte.
  const results = await prisma.$transaction(
    items.map(
      (item) => prisma.$queryRaw<{ before: number }[]>`
        WITH prev AS (
          SELECT "id", "stock" FROM "ProductSize"
          WHERE "productId" = ${item.productId} AND "size" = ${item.size}
          FOR UPDATE
        )
        UPDATE "ProductSize" ps
        SET "stock" = GREATEST(ps."stock" + ${direction * item.quantity}, 0)
        FROM prev
        WHERE ps."id" = prev."id"
        RETURNING prev."stock" AS "before"
      `
    )
  );

  // Pas de contenu périmé toléré : la boutique ne doit pas proposer une taille
  // qui vient de partir (le checkout revérifie de toute façon le stock).
  if (items.length > 0) revalidateTag(CATALOG_TAG, { expire: 0 });

  if (direction === -1) {
    const oversold = items.flatMap((item, index) => {
      const available = Number(results[index][0]?.before ?? 0);
      return available < item.quantity
        ? [{ productName: item.product.name, size: item.size ?? "", ordered: item.quantity, available }]
        : [];
    });
    if (oversold.length > 0) {
      console.warn(`[stock] Survente sur la commande ${orderId}:`, oversold);
      await sendOversoldAlertEmail(orderId, oversold);
    }
  }
}
