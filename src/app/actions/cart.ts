"use server";

import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { effectivePriceCents } from "@/lib/pricing";
import { MAX_QTY_PER_LINE } from "@/lib/shipping";
import type { CartItem } from "@/lib/cart";

const PLACEHOLDER_IMAGE = "/images/product-photo-sample.webp";

const RefreshCartSchema = z
  .array(
    z.object({
      productId: z.string().min(1).max(64),
      size: z.string().min(1).max(32).optional(),
      qty: z.number().int().min(1),
      priceCents: z.number().int().optional(),
    })
  )
  .max(50);

/**
 * Remet le panier du navigateur à jour avec le catalogue : prix, nom, photo et
 * stock courants. Les articles disparus ou épuisés sont retirés et les
 * quantités ramenées au stock, avec un message pour chaque correction.
 * Lecture seule : rien n'est écrit en base.
 */
export async function refreshCart(input: { productId: string; size?: string; qty: number; priceCents?: number }[]) {
  const parsed = RefreshCartSchema.safeParse(input);
  if (!parsed.success) return { items: [] as CartItem[], notices: ["Votre panier a été vidé car il était illisible."] };

  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(parsed.data.map((item) => item.productId))] } },
    select: {
      id: true,
      slug: true,
      name: true,
      images: true,
      currency: true,
      priceCents: true,
      onSale: true,
      salePriceCents: true,
      sizes: { select: { size: true, stock: true } },
    },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  const items: CartItem[] = [];
  const notices: string[] = [];

  for (const line of parsed.data) {
    const product = productById.get(line.productId);
    if (!product) {
      notices.push("Un article n'est plus disponible et a été retiré de votre panier.");
      continue;
    }

    const label = `${product.name}${line.size ? ` (taille ${line.size})` : ""}`;
    const sizeRow = line.size ? product.sizes.find((entry) => entry.size === line.size) : undefined;
    if (!sizeRow || sizeRow.stock <= 0) {
      notices.push(`${label} est épuisé et a été retiré de votre panier.`);
      continue;
    }

    const maxQty = Math.min(sizeRow.stock, MAX_QTY_PER_LINE);
    const qty = Math.min(line.qty, maxQty);
    if (qty < line.qty) {
      notices.push(`${label} : quantité ramenée à ${qty}, le maximum disponible.`);
    }

    const priceCents = effectivePriceCents(product);
    if (line.priceCents != null && line.priceCents !== priceCents) {
      notices.push(`Le prix de ${product.name} a changé : le panier affiche le tarif actuel.`);
    }

    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? PLACEHOLDER_IMAGE,
      priceCents,
      currency: product.currency,
      size: line.size,
      qty,
      maxQty,
    });
  }

  return { items, notices };
}
