import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getSiteSettings } from "@/lib/admin/settings";

const ALLOWED_DURING_MAINTENANCE = ["/maintenance", "/connexion", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe"];
// La maintenance ne concerne que le domaine public : mahaleo.vercel.app et le
// local restent accessibles pour préparer la boutique.
const MAINTENANCE_HOSTS = ["mahaleo.shop", "www.mahaleo.shop"];

// Lire la session relit l'utilisateur en base (cf. callback `jwt`) : on ne la
// consulte que lorsque la maintenance est active, pour laisser passer les admins.
const maintenanceGate = auth((req) => {
  if (req.auth?.user?.role === "ADMIN") return NextResponse.next();
  return NextResponse.rewrite(new URL("/maintenance", req.url));
});

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();

  const isBypassed =
    !MAINTENANCE_HOSTS.includes(host) ||
    pathname.startsWith("/admin") ||
    ALLOWED_DURING_MAINTENANCE.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (isBypassed) return NextResponse.next();

  const settings = await getSiteSettings();
  if (!settings.maintenanceMode) return NextResponse.next();

  return maintenanceGate(req, { params: Promise.resolve({}) });
}

export const config = {
  // Les fichiers (chemins avec extension : images de /public, favicon…) ne
  // passent pas par le proxy.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[^/]+$).*)"],
};
