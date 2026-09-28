import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSiteSettings } from "@/lib/admin/settings";

const ALLOWED_DURING_MAINTENANCE = ["/maintenance", "/connexion", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe"];
const STATIC_FILE = /\.[^/]+$/;
// La maintenance ne concerne que le domaine public : mahaleo.vercel.app et le
// local restent accessibles pour préparer la boutique.
const MAINTENANCE_HOSTS = ["mahaleo.shop", "www.mahaleo.shop"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();

  const isBypassed =
    !MAINTENANCE_HOSTS.includes(host) ||
    STATIC_FILE.test(pathname) ||
    pathname.startsWith("/admin") ||
    ALLOWED_DURING_MAINTENANCE.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isBypassed || req.auth?.user?.role === "ADMIN") {
    return NextResponse.next();
  }

  const settings = await getSiteSettings();
  if (!settings.maintenanceMode) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/maintenance", req.url));
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
