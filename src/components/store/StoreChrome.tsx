"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart";
import logo from "../../assets/mahaleo/logo-mahaleo.png";

export function StoreHeader() {
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const accountHref = session?.user
    ? session.user.role === "ADMIN" ? "/admin" : "/compte"
    : "/connexion";

  return (
    <>
      <div className="retro-edition" aria-label="Informations éditoriales">
        <span>ANTSIRABE · MADAGASCAR</span>
        <span>LA MUSIQUE EN HÉRITAGE</span>
        <span>DEPUIS 1972</span>
      </div>
      <header className="retro-header">
        <div className="retro-header-context">
          <Link href="/" className="retro-nav-selected">LA BOUTIQUE</Link>
          <span>Vêtements &amp; souvenirs musicaux</span>
        </div>
        <Link href="/" className="retro-logo" aria-label="Mahaleo — retour à la boutique">
          <Image src={logo} alt="Mahaleo" priority sizes="(max-width: 600px) 185px, 265px" />
        </Link>
        <nav className="retro-actions" aria-label="Navigation principale">
          <Link href={accountHref} className="retro-action retro-action-secondary">
            {session?.user ? "Compte" : "Connexion"}
          </Link>
          <Link href="/panier" className="retro-action" aria-label={`Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2" /></svg>
            <span className="retro-action-label">Panier</span>
            <strong>{itemCount}</strong>
          </Link>
        </nav>
      </header>
    </>
  );
}

export function StoreFooter() {
  return (
    <footer className="retro-footer">
      <span>MAHALEO · DEPUIS 1972</span>
      <p className="retro-footer-credit">
        Réalisé par{" "}
        <a href="https://oxmad-digital.mg" target="_blank" rel="noopener noreferrer">
          Oxmad Digital
        </a>
      </p>
      <nav aria-label="Liens légaux">
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/conditions-de-vente">Vente &amp; retours</Link>
      </nav>
    </footer>
  );
}

export function StoreShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`retro-page ${className}`.trim()}>
      <StoreHeader />
      {children}
      <StoreFooter />
    </div>
  );
}
