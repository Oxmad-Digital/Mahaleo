import type { Metadata } from "next";
import Link from "next/link";
import { StoreShell } from "@/components/store/StoreChrome";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <StoreShell className="retro-receipt-page">
      <main className="retro-receipt">
        <span className="retro-eyebrow">ERREUR 404</span>
        <h1>PAGE INTROUVABLE</h1>
        <p>Cette page n&apos;existe pas ou plus. La pièce que vous cherchez a peut-être quitté la collection.</p>
        <Link href="/" className="retro-primary"><span>VOIR LA COLLECTION</span><span>↗</span></Link>
      </main>
    </StoreShell>
  );
}
