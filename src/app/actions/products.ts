"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATALOG_TAG } from "@/lib/shop";
import { requireAdmin } from "@/lib/admin/require-admin";
import { Prisma } from "@/generated/prisma/client";
import { ProductFormSchema, type ProductFormState, type ProductSizeEntry } from "@/lib/definitions";

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

/**
 * Enregistre les tailles d'un produit existant. Pour une taille déjà en base,
 * c'est l'écart saisi par rapport au stock affiché à l'ouverture du formulaire
 * qui est appliqué : une vente payée pendant l'édition n'est pas effacée.
 */
async function saveSizes(productId: string, sizes: ProductSizeEntry[]) {
  const existing = await prisma.productSize.findMany({ where: { productId }, select: { size: true } });
  const existingSizes = new Set(existing.map((row) => row.size));
  const keptSizes = sizes.map((entry) => entry.size);

  await prisma.$transaction([
    prisma.productSize.deleteMany({ where: { productId, size: { notIn: keptSizes } } }),
    ...sizes.map((entry) => {
      const stock = parseInt(entry.stock, 10);
      if (!existingSizes.has(entry.size)) {
        return prisma.productSize.create({ data: { productId, size: entry.size, stock } });
      }
      if (entry.initialStock == null) {
        return prisma.productSize.update({
          where: { productId_size: { productId, size: entry.size } },
          data: { stock },
        });
      }
      const delta = stock - parseInt(entry.initialStock, 10);
      return prisma.$executeRaw`
        UPDATE "ProductSize" SET "stock" = GREATEST("stock" + ${delta}, 0)
        WHERE "productId" = ${productId} AND "size" = ${entry.size}
      `;
    }),
  ]);
}

export async function createProduct(
  redirectOnSuccess: boolean,
  _state: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    color: formData.get("color") ?? undefined,
    productType: formData.get("productType") ?? undefined,
    colorName: formData.get("colorName") ?? undefined,
    material: formData.get("material") ?? undefined,
    fit: formData.get("fit") ?? undefined,
    care: formData.get("care") ?? undefined,
    price: formData.get("price"),
    images: formData.get("images"),
    sizes: formData.get("sizes"),
    onSale: formData.get("onSale") ?? undefined,
    salePrice: formData.get("salePrice") ?? undefined,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, slug, description, color, price, images, sizes, onSale, salePrice, productType, colorName, material, fit, care } =
    validatedFields.data;

  try {
    await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || null,
        productType: productType || null,
        colorName: colorName || null,
        material: material || null,
        fit: fit || null,
        care: care || null,
        priceCents: parsePriceCents(price),
        onSale,
        salePriceCents: onSale && salePrice ? parsePriceCents(salePrice) : null,
        images: parseImages(images),
        sizes: {
          create: sizes.map((entry) => ({ size: entry.size, stock: parseInt(entry.stock, 10) })),
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { slug: ["Ce slug est déjà utilisé par un autre produit."] } };
    }
    throw error;
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/produits");
  if (redirectOnSuccess) redirect("/admin/produits");
  return { success: true };
}

export async function updateProduct(
  id: string,
  redirectOnSuccess: boolean,
  _state: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    color: formData.get("color") ?? undefined,
    productType: formData.get("productType") ?? undefined,
    colorName: formData.get("colorName") ?? undefined,
    material: formData.get("material") ?? undefined,
    fit: formData.get("fit") ?? undefined,
    care: formData.get("care") ?? undefined,
    price: formData.get("price"),
    images: formData.get("images"),
    sizes: formData.get("sizes"),
    onSale: formData.get("onSale") ?? undefined,
    salePrice: formData.get("salePrice") ?? undefined,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, slug, description, color, price, images, sizes, onSale, salePrice, productType, colorName, material, fit, care } =
    validatedFields.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        color: color || null,
        productType: productType || null,
        colorName: colorName || null,
        material: material || null,
        fit: fit || null,
        care: care || null,
        priceCents: parsePriceCents(price),
        onSale,
        salePriceCents: onSale && salePrice ? parsePriceCents(salePrice) : null,
        images: parseImages(images),
      },
    });
    await saveSizes(id, sizes);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { slug: ["Ce slug est déjà utilisé par un autre produit."] } };
    }
    throw error;
  }

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/produits");
  if (redirectOnSuccess) redirect("/admin/produits");
  return { success: true };
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

  updateTag(CATALOG_TAG);
  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}
