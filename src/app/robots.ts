import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/emails/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/compte", "/panier", "/checkout", "/paiement", "/commande"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
