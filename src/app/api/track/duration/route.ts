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
  const origin = request.headers.get("origin");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: "Origine refusée" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Origine refusée" }, { status: 403 });
    }
  }

  try {
    await prisma.pageView.update({
      where: { id },
      data: { duration: Math.min(duration, MAX_DURATION_MS) },
    });
  } catch {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
