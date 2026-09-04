"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  SignupFormSchema,
  LoginFormSchema,
  type SignupFormState,
  type LoginFormState,
} from "@/lib/definitions";

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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Un compte existe déjà avec cette adresse e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });

  await signIn("credentials", { email, password, redirect: false });
  redirect("/");
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
    if (error instanceof AuthError) {
      return { message: "E-mail ou mot de passe incorrect." };
    }
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: validatedFields.data.email },
    select: { role: true },
  });

  redirect(user?.role === "ADMIN" ? "/admin" : "/");
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/connexion");
}
