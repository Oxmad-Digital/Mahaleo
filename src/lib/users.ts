import { prisma } from "@/lib/prisma";

/**
 * Filtre e-mail insensible à la casse. Les adresses sont enregistrées en
 * minuscules, mais des comptes antérieurs à cette règle peuvent encore porter
 * des majuscules : la recherche ne doit pas dépendre de la saisie.
 */
export function emailEquals(email: string) {
  return { equals: email, mode: "insensitive" as const };
}

export function findUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email: emailEquals(email) }, orderBy: { createdAt: "asc" } });
}

/** Vrai si un autre compte que `exceptUserId` utilise déjà cette adresse. */
export async function isEmailTaken(email: string, exceptUserId?: string) {
  const user = await prisma.user.findFirst({
    where: { email: emailEquals(email), ...(exceptUserId ? { NOT: { id: exceptUserId } } : {}) },
    select: { id: true },
  });
  return user !== null;
}
