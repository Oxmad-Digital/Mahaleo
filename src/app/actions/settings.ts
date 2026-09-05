"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin/require-admin";
import { setMaintenanceMode as persistMaintenanceMode } from "@/lib/admin/settings";
import { sendAdminInviteEmail } from "@/lib/emails/send";
import { APP_URL } from "@/lib/emails/constants";
import { hashToken } from "@/lib/tokens";
import { InviteAdminSchema, type InviteAdminState } from "@/lib/definitions";

const INVITE_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function setMaintenanceMode(enabled: boolean) {
  await requireAdmin();

  await persistMaintenanceMode(enabled);

  revalidatePath("/admin/parametres");
}

export async function inviteAdmin(_state: InviteAdminState, formData: FormData): Promise<InviteAdminState> {
  await requireAdmin();

  const validatedFields = InviteAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email } = validatedFields.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Un compte existe déjà avec cette adresse e-mail." };
  }

  const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash: randomPasswordHash, role: "ADMIN" },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    },
  });

  const setPasswordUrl = `${APP_URL}/reinitialiser-mot-de-passe?token=${token}`;
  await sendAdminInviteEmail(email, name, setPasswordUrl);

  revalidatePath("/admin/parametres");
  return { success: true };
}

export async function revokeAdmin(id: string) {
  const session = await requireAdmin();

  if (session.user.id === id) {
    redirect(`/admin/parametres?error=${encodeURIComponent("Vous ne pouvez pas retirer vos propres droits administrateur.")}`);
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount <= 1) {
    redirect(`/admin/parametres?error=${encodeURIComponent("Impossible de retirer le dernier administrateur.")}`);
  }

  try {
    await prisma.user.update({ where: { id, role: "ADMIN" }, data: { role: "USER" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      redirect(`/admin/parametres?error=${encodeURIComponent("Cet administrateur est introuvable.")}`);
    }
    throw error;
  }

  revalidatePath("/admin/parametres");
  redirect("/admin/parametres");
}
