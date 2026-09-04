import Link from "next/link";
import type { CSSProperties } from "react";
import { vmin } from "@/lib/fluid";

export type FooterActive = "mentions" | "conditions";

export function Footer({ active }: { active?: FooterActive }) {
  const linkStyle = (isActive: boolean): CSSProperties => ({
    fontSize: vmin(13),
    fontWeight: 500,
    color: isActive ? "#ffffff" : "var(--text-on-scene-tertiary)",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: vmin(22),
        right: vmin(22),
        height: "var(--space-footer-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: vmin(40),
      }}
    >
      <Link
        href="/mentions-legales"
        className="footer-link"
        style={linkStyle(active === "mentions")}
      >
        Mentions légales
      </Link>
      <Link
        href="/conditions-de-vente"
        className="footer-link"
        style={linkStyle(active === "conditions")}
      >
        Conditions de ventes
      </Link>
      <a
        href="https://oxmad-digital.mg"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-link"
        style={linkStyle(false)}
      >
        Réalisé par Oxmad Digital
      </a>
    </div>
  );
}
