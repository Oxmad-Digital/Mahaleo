import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Tag du catalogue en cache : invalidé à chaque modification de produit
 * (actions admin) et à chaque mouvement de stock (lib/stock).
 */
export const CATALOG_TAG = "catalog";

// Filet de sécurité pour une modification faite hors de l'application
// (Prisma Studio, SQL direct), qui n'invalide pas le tag.
const CATALOG_REVALIDATE_SECONDS = 300;

// Le cache sérialise en JSON : les dates sont renvoyées en chaînes ISO pour que
// le type reste le même que la valeur vienne du cache ou de la base.
export const getShopProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        productType: true,
        color: true,
        colorName: true,
        priceCents: true,
        currency: true,
        onSale: true,
        salePriceCents: true,
        images: true,
        sizes: {
          orderBy: { size: "asc" },
          select: { size: true, stock: true },
        },
      },
    });
  },
  ["shop-products"],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS },
);

export type ShopProduct = Awaited<ReturnType<typeof getShopProducts>>[number];

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        productType: true,
        color: true,
        colorName: true,
        material: true,
        fit: true,
        care: true,
        priceCents: true,
        currency: true,
        onSale: true,
        salePriceCents: true,
        images: true,
        createdAt: true,
        sizes: {
          orderBy: { size: "asc" },
          select: { id: true, size: true, stock: true },
        },
      },
    });
    return product && { ...product, createdAt: product.createdAt.toISOString() };
  },
  ["shop-product-by-slug"],
  { tags: [CATALOG_TAG], revalidate: CATALOG_REVALIDATE_SECONDS },
);

export type ShopProductDetail = Awaited<ReturnType<typeof getProductBySlug>>;

const NEW_ARRIVAL_WINDOW_DAYS = 14;

export function isNewArrival(createdAt: Date | string) {
  return Date.now() - new Date(createdAt).getTime() < NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}
