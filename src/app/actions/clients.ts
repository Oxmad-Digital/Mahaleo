"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { Prisma } from "@/generated/prisma/client";
import type { UserStatus } from "@/generated/prisma/client";
import { ClientFormSchema, type ClientFormState } from "@/lib/definitions";

export async function updateClient(id: string, _state: ClientFormState, formData: FormData): Promise<ClientFormState> {
  await requireAdmin();

  const validatedFields = ClientFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email } = validatedFields.data;

  try {
    await prisma.user.update({
      where: { id },
      data: { name: name || null, email },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["Cette adresse e-mail est déjà utilisée par un autre compte."] } };
    }
    throw error;
  }

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  redirect(`/admin/clients/${id}?saved=1`);
}

const USER_STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "BANNED"];

/**
 * Un admin ne se gère pas depuis la fiche client : ses droits se retirent dans
 * Paramètres, qui protège le dernier administrateur.
 */
async function adminGuardError(sessionUserId: string, id: string) {
  if (sessionUserId === id) return "Vous ne pouvez pas modifier votre propre compte depuis cette page.";
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (target?.role === "ADMIN") {
    return "Ce compte est administrateur : retirez d'abord ses droits dans Paramètres.";
  }
  return null;
}

export async function setClientStatus(id: string, status: UserStatus) {
  const session = await requireAdmin();

  if (!USER_STATUSES.includes(status)) redirect(`/admin/clients/${id}`);
  const guardError = await adminGuardError(session.user.id, id);
  if (guardError) redirect(`/admin/clients/${id}?error=${encodeURIComponent(guardError)}`);

  await prisma.user.update({ where: { id }, data: { status } });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  redirect(`/admin/clients/${id}`);
}

export async function deleteClient(id: string) {
  const session = await requireAdmin();

  const guardError = await adminGuardError(session.user.id, id);
  if (guardError) redirect(`/admin/clients/${id}?error=${encodeURIComponent(guardError)}`);

  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      redirect(
        `/admin/clients/${id}?error=${encodeURIComponent(
          "Impossible de supprimer ce client : il a des commandes existantes. Suspendez ou bannissez-le à la place."
        )}`
      );
    }
    throw error;
  }

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}
