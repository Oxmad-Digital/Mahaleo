"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/account/require-user";
import { Prisma } from "@/generated/prisma/client";
import {
  ProfileFormSchema,
  ChangePasswordSchema,
  type ProfileFormState,
  type ChangePasswordState,
} from "@/lib/definitions";

export async function updateProfile(_state: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const session = await requireUser();

  const validatedFields = ProfileFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email } = validatedFields.data;

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["Cette adresse e-mail est déjà utilisée par un autre compte."] } };
    }
    throw error;
  }

  revalidatePath("/compte/profil");
  revalidatePath("/compte");
  return { success: true, message: "Vos informations ont été enregistrées." };
}

export async function changePassword(
  _state: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await requireUser();

  const validatedFields = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { currentPassword, password } = validatedFields.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) {
    return { message: "Compte introuvable." };
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { errors: { currentPassword: ["Mot de passe actuel incorrect."] } };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });

  return { success: true, message: "Votre mot de passe a été mis à jour." };
}
