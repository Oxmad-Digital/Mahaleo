import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/lib/cart";
import { Tracker } from "@/components/Tracker";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = localFont({
  // Sous-ensemble latin (accents, ponctuation, €, flèches) converti en woff2.
  src: "../assets/mahaleo/barlow-condensed.woff2",
  variable: "--font-barlow-condensed",
  weight: "700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mahaleo — Boutique officielle",
  description: "La boutique officielle Mahaleo : vêtements et souvenirs musicaux depuis 1972.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${plusJakartaSans.variable} ${barlowCondensed.variable}`}>
      <body>
        <Tracker />
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
