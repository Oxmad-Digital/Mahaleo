"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { findUserByEmail } from "@/lib/users";
import { HOUR, clientIp, rateLimit } from "@/lib/rate-limit";
import { Prisma } from "@/generated/prisma/client";
import { APP_URL } from "@/lib/emails/constants";
import { hashToken } from "@/lib/tokens";
import {
  sendExistingAccountSignupEmail,
  sendSignupVerificationEmail,
  sendWelcomeEmail,
} from "@/lib/emails/send";
import {
  SignupFormSchema,
  LoginFormSchema,
  type SignupFormState,
  type LoginFormState,
} from "@/lib/definitions";

const SIGNUP_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function signup(
  _state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validatedFields.data;

  if (!(await rateLimit(`signup:ip:${await clientIp()}`, 5, HOUR))) {
    return { message: "Trop de tentatives. Réessayez dans une heure." };
  }

  // Une seule réponse, que l'adresse soit libre ou déjà inscrite : c'est
  // l'e-mail envoyé qui diffère. Le mot de passe est haché dans les deux cas
  // pour que le temps de réponse ne trahisse pas non plus l'existence du compte.
  const passwordHash = await bcrypt.hash(password, 10);

  // Au-delà de la limite par adresse, plus aucun e-mail ne part vers elle, sans
  // que la réponse change : le formulaire ne sert pas à bombarder une boîte.
  if (await rateLimit(`signup:email:${email.toLowerCase()}`, 3, HOUR)) {
    const existing = await findUserByEmail(email);
    if (existing) {
      await sendExistingAccountSignupEmail(
        existing.email,
        existing.name,
        `${APP_URL}/connexion`,
        `${APP_URL}/mot-de-passe-oublie`
      );
    } else {
      // Seul le dernier lien envoyé reste valable pour une adresse donnée.
      await prisma.pendingSignup.deleteMany({
        where: { OR: [{ email }, { expiresAt: { lt: new Date() } }] },
      });

      const token = crypto.randomBytes(32).toString("hex");
      await prisma.pendingSignup.create({
        data: {
          email,
          name,
          passwordHash,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + SIGNUP_TOKEN_TTL_MS),
        },
      });

      await sendSignupVerificationEmail(email, name, `${APP_URL}/verifier-email?token=${token}`);
    }
  }

  return {
    success: true,
    message: `Un e-mail vient d'être envoyé à ${email}. Cliquez sur le lien qu'il contient pour activer votre compte.`,
  };
}

/**
 * Active une inscription en attente. Appelée depuis le bouton de la page
 * /verifier-email et non au simple chargement du lien, que les antivirus de
 * messagerie visitent d'eux-mêmes.
 */
export async function confirmSignup(token: string): Promise<{ message: string }> {
  const pending = await prisma.pendingSignup.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!pending || pending.expiresAt < new Date()) {
    return { message: "Ce lien d'activation est invalide ou a expiré. Inscrivez-vous à nouveau." };
  }

  const { email, name, passwordHash } = pending;
  try {
    await prisma.$transaction([
      prisma.user.create({ data: { email, name, passwordHash } }),
      prisma.pendingSignup.deleteMany({ where: { email } }),
    ]);
  } catch (error) {
    // Adresse inscrite entre-temps (autre lien, invitation admin…).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      await prisma.pendingSignup.deleteMany({ where: { email } });
      redirect("/connexion?compte-active=1");
    }
    throw error;
  }

  await sendWelcomeEmail(email, name);
  redirect("/connexion?compte-active=1");
}

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", { ...validatedFields.data, redirect: false });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "rate_limited") {
      return { message: "Trop de tentatives de connexion. Réessayez dans 15 minutes." };
    }
    if (error instanceof AuthError) {
      return { message: "E-mail ou mot de passe incorrect." };
    }
    throw error;
  }

  const user = await findUserByEmail(validatedFields.data.email);

  // Chacun arrive dans sa console : l'admin sur /admin, le client sur /compte.
  // La navigation est faite côté client, après rafraîchissement de la session.
  return { redirectTo: user?.role === "ADMIN" ? "/admin" : "/compte" };
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/connexion");
}
