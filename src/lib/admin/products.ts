import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const PRODUCTS_PAGE_SIZE = 20;

export async function getProductsData({ query, page }: { query?: string; page: number }) {
  const pageSize = PRODUCTS_PAGE_SIZE;

  const where: Prisma.ProductWhereInput = query
    ? {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }],
      }
    : {};

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        name: true,
        priceCents: true,
        currency: true,
        images: true,
        sizes: { select: { size: true, stock: true }, orderBy: { size: "asc" } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const products = rawProducts.map((product) => ({
    ...product,
    stock: product.sizes.reduce((sum, s) => sum + s.stock, 0),
  }));

  return {
    products,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type ProductsData = Awaited<ReturnType<typeof getProductsData>>;

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { sizes: { orderBy: { size: "asc" } } },
  });
}
