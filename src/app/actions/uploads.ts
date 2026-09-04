"use server";

import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { requireAdmin } from "@/lib/admin/require-admin";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadProductImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier sélectionné." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Format d'image non supporté (JPEG, PNG, WEBP, GIF uniquement)." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "L'image dépasse la taille maximale de 5 Mo." };
  }

  const extension = file.type.split("/")[1];
  const key = `products/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return { url: `${R2_PUBLIC_URL}/${key}` };
}
