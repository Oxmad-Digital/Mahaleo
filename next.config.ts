import type { NextConfig } from "next";
import { PRODUCT_IMAGE_HOST } from "./src/lib/images";

const isDev = process.env.NODE_ENV === "development";

// CSP sans nonce (cf. guide Next « Content Security Policy › Without Nonces ») :
// un nonce imposerait le rendu dynamique de toutes les pages. Les images
// produit viennent d'URLs saisies dans l'admin (R2 ou autre), d'où `https:`.
// Le paiement se fait par redirection vers Stripe Checkout, sans script Stripe.
// Le choix du point relais passe par le widget Sendcloud : script servi par
// embed.sendcloud.sc, carte affichée dans une iframe servicepoints.sendcloud.sc.
const SENDCLOUD_PICKER = "https://embed.sendcloud.sc";
const SENDCLOUD_SERVICE_POINTS = "https://servicepoints.sendcloud.sc";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${SENDCLOUD_PICKER}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  `frame-src ${SENDCLOUD_PICKER} ${SENDCLOUD_SERVICE_POINTS}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: PRODUCT_IMAGE_HOST, pathname: "/**" }],
    // Les images produit ont une clé UUID qui ne change jamais de contenu : leur
    // version optimisée peut rester en cache bien au-delà des 4 h par défaut.
    minimumCacheTTL: 31 * 24 * 60 * 60,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
