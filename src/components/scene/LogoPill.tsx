import Link from "next/link";
import { vmin } from "@/lib/fluid";

/**
 * Le logo de la barre du haut. C'est un lien vers la boutique : sur toutes les
 * pages sauf celle-ci, il est le chemin de retour attendu — et sur la boutique
 * elle-même, cliquer le logo ne fait que recharger la page où l'on est.
 */
export function LogoPill() {
  return (
    <Link
      href="/"
      aria-label="Mahaleo — retour à la boutique"
      className="logo-pill"
      style={{
        display: "flex",
        alignItems: "center",
        padding: `${vmin(10)} ${vmin(22)}`,
        borderRadius: "var(--radius-pill)",
        background: "var(--surface-logo-pill)",
        border: "1px solid var(--surface-logo-pill-border)",
        boxShadow: "var(--shadow-logo-pill)",
      }}
    >
      <img
        src="/images/logo-mahaleo.webp"
        alt="Mahaleo"
        style={{ height: vmin(26), width: "auto", display: "block" }}
      />
    </Link>
  );
}
