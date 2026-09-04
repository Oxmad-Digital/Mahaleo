import { prisma } from "@/lib/prisma";

export async function getShopProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      priceCents: true,
      currency: true,
      images: true,
      createdAt: true,
    },
  });
}

export type ShopProduct = Awaited<ReturnType<typeof getShopProducts>>[number];

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { sizes: { orderBy: { size: "asc" } } },
  });
}

export type ShopProductDetail = Awaited<ReturnType<typeof getProductBySlug>>;

const NEW_ARRIVAL_WINDOW_DAYS = 14;

export function isNewArrival(createdAt: Date) {
  return Date.now() - createdAt.getTime() < NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}
