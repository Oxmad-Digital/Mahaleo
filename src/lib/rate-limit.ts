import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Limite de débit à fenêtre fixe, stockée en base : l'application tourne en
 * serverless (pas de mémoire partagée entre instances) et n'a pas de Redis.
 *
 * L'upsert est atomique côté Postgres : deux requêtes simultanées ne peuvent pas
 * lire le même compteur. Retourne `true` si l'appel est autorisé.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const resetAt = new Date(Date.now() + windowMs);

  const [row] = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
    RETURNING "count"
  `;

  // Purge occasionnelle des compteurs expirés, sans job planifié dédié.
  if (Math.random() < 0.01) {
    await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } }).catch(() => {});
  }

  return row.count <= limit;
}

/**
 * IP du client. Sur Vercel, `x-forwarded-for` est réécrit par la plateforme :
 * sa première entrée est fiable.
 */
export function clientIpFrom(requestHeaders: Headers) {
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

/** IP du client depuis une server action. */
export async function clientIp() {
  return clientIpFrom(await headers());
}

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
