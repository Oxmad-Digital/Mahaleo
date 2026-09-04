"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { Prisma } from "@/generated/prisma/client";
import { ProductFormSchema, type ProductFormState } from "@/lib/definitions";

function parseImages(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parsePriceCents(price: string) {
  return Math.round(parseFloat(price.replace(",", ".")) * 100);
}

export async function createProduct(_state: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    images: formData.get("images"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, slug, description, price, stock, images } = validatedFields.data;

  try {
    await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        priceCents: parsePriceCents(price),
        stock: parseInt(stock, 10),
        images: parseImages(images),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { slug: ["Ce slug est déjà utilisé par un autre produit."] } };
    }
    throw error;
  }

  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}

export async function updateProduct(id: string, _state: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    images: formData.get("images"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, slug, description, price, stock, images } = validatedFields.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        priceCents: parsePriceCents(price),
        stock: parseInt(stock, 10),
        images: parseImages(images),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { slug: ["Ce slug est déjà utilisé par un autre produit."] } };
    }
    throw error;
  }

  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      redirect(`/admin/produits?error=${encodeURIComponent("Impossible de supprimer ce produit : il est lié à des commandes existantes.")}`);
    }
    throw error;
  }

  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}
