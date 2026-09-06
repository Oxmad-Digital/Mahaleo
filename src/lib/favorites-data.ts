import { prisma } from "@/lib/prisma";

export async function getUserFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          priceCents: true,
          currency: true,
          images: true,
        },
      },
    },
  });
}

export async function isProductFavorite(userId: string, productId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return !!favorite;
}

export async function getFavoriteCount(userId: string) {
  return prisma.favorite.count({ where: { userId } });
}
