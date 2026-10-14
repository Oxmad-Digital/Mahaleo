import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/emails/constants";

// Régénéré au plus toutes les heures : les nouveaux produits y apparaissent
// sans redéploiement.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: { slug: true, updatedAt: true, images: true },
  });

  const latestUpdate = products[0]?.updatedAt ?? new Date();

  return [
    { url: SITE_URL, lastModified: latestUpdate, changeFrequency: "daily", priority: 1 },
    ...products.map((product) => ({
      url: `${SITE_URL}/produit/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.images.slice(0, 1).map((src) => new URL(src, SITE_URL).href),
    })),
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/conditions-de-vente`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
