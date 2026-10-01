import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { MINUTE, clientIpFrom, rateLimit } from "@/lib/rate-limit";

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
  const hostname = host?.split(":")[0] ?? "";
  const isLocalHost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  if (isLocalHost) {
    return NextResponse.json({ ok: true });
  }

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

  let referrer = "";
  if (typeof body.referrer === "string" && body.referrer) {
    try {
      const refUrl = new URL(body.referrer);
      if (refUrl.host !== host) referrer = refUrl.host;
    } catch {
      referrer = "";
    }
  }

  const ip = clientIpFrom(request.headers);
  if (!(await rateLimit(`track:ip:${ip}`, 60, MINUTE))) {
    return NextResponse.json({ ok: true });
  }

  const day = new Date().toISOString().slice(0, 10);
  // HMAC sous une clé dérivée : AUTH_SECRET signe les sessions et ne doit pas
  // servir tel quel à un autre usage.
  const visitorKey = crypto
    .createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update("mahaleo:visitor-hash")
    .digest();
  const visitorHash = crypto
    .createHmac("sha256", visitorKey)
    .update(`${ip}|${request.headers.get("user-agent") ?? ""}|${day}`)
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
