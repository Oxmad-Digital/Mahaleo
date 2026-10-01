import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_DURATION_MS = 30 * 60 * 1000;

export async function POST(request: NextRequest) {
  let body: { id?: unknown; duration?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const duration = typeof body.duration === "number" ? body.duration : NaN;

  if (!id || !Number.isFinite(duration) || duration <= 0) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const host = request.headers.get("host");
  // Les navigateurs envoient toujours Origin sur un POST (fetch comme
  // sendBeacon) : son absence signale un appel scripté hors du site.
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(origin && host && new URL(origin).host === host);
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    return NextResponse.json({ error: "Origine refusée" }, { status: 403 });
  }

  // Une durée ne s'écrit qu'une fois : une vue déjà renseignée ne peut pas
  // être réécrite par un tiers qui connaîtrait son identifiant.
  await prisma.pageView.updateMany({
    where: { id, duration: null },
    data: { duration: Math.round(Math.min(duration, MAX_DURATION_MS)) },
  });

  return NextResponse.json({ ok: true });
}
