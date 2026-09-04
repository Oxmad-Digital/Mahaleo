"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function addFavorite(productId: string) {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" as const };

  await prisma.favorite.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: {},
    create: { userId: session.user.id, productId },
  });

  revalidatePath("/favoris");
  revalidatePath("/produit/[slug]", "page");
  return { ok: true as const };
}

export async function removeFavorite(productId: string) {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" as const };

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, productId },
  });

  revalidatePath("/favoris");
  revalidatePath("/produit/[slug]", "page");
  return { ok: true as const };
}
