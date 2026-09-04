import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { isBot, device } = userAgent(request);
  if (isBot) {
    return NextResponse.json({ ok: true });
  }

  let body: { path?: unknown; referrer?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "";
  if (!path.startsWith("/")) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  if (path.startsWith("/admin")) {
    return NextResponse.json({ ok: true });
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

  let referrer = "";
  if (typeof body.referrer === "string" && body.referrer) {
    try {
      const refUrl = new URL(body.referrer);
      if (refUrl.host !== host) referrer = refUrl.host;
    } catch {
      referrer = "";
    }
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const pepper = process.env.AUTH_SECRET ?? "";
  const visitorHash = crypto
    .createHash("sha256")
    .update(`${ip}|${request.headers.get("user-agent") ?? ""}|${day}|${pepper}`)
    .digest("hex")
    .slice(0, 32);

  const country = request.headers.get("x-vercel-ip-country") ?? "";

  const created = await prisma.pageView.create({
    data: {
      day,
      path,
      referrer,
      deviceType: device.type ?? "desktop",
      country,
      visitorHash,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: created.id });
}
