"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { findUserByEmail } from "@/lib/users";
import { sendPasswordResetEmail } from "@/lib/emails/send";
import { APP_URL } from "@/lib/emails/constants";
import { hashToken } from "@/lib/tokens";
import { HOUR, MINUTE, clientIp, rateLimit } from "@/lib/rate-limit";
import {
  RequestPasswordResetSchema,
  ResetPasswordSchema,
  type RequestPasswordResetState,
  type ResetPasswordState,
} from "@/lib/definitions";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordReset(
  _state: RequestPasswordResetState,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const validatedFields = RequestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email } = validatedFields.data;

  if (!(await rateLimit(`reset:ip:${await clientIp()}`, 5, 15 * MINUTE))) {
    return { message: "Trop de demandes. Réessayez dans 15 minutes." };
  }
  // Au-delà de la limite par adresse, on répond comme d'habitude sans envoyer :
  // un refus explicite révélerait que le compte existe.
  const emailAllowed = await rateLimit(`reset:email:${email.toLowerCase()}`, 3, HOUR);

  const user = emailAllowed ? await findUserByEmail(email) : null;
  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${APP_URL}/reinitialiser-mot-de-passe?token=${token}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  }

  // Always report success, whether or not the account exists, so we never reveal which emails are registered.
  return { success: true };
}

export async function resetPassword(
  token: string,
  _state: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const validatedFields = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { message: "Ce lien de réinitialisation est invalide ou a expiré." };
  }

  const passwordHash = await bcrypt.hash(validatedFields.data.password, 10);

  await prisma.$transaction([
    // sessionVersion déconnecte toutes les sessions ouvertes avec l'ancien mot de passe.
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  redirect("/connexion?reset=1");
}
