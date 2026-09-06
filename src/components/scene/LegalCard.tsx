import type { ReactNode } from "react";
import { Scene } from "./Scene";
import { TopBar } from "./TopBar";
import { LogoPill } from "./LogoPill";
import { BackLink } from "./BackLink";
import { Breadcrumb } from "./Breadcrumb";
import { Footer, type FooterActive } from "./Footer";
import { capped, vmin } from "@/lib/fluid";

/**
 * Shell des pages légales (mentions, CGV) : une carte claire qui défile dans la
 * scène. Elle passe `scene-mobile` à `Scene`, donc sous 768px (ou sur un
 * téléphone couché) la scène repasse en flux normal et c'est la page qui
 * défile, la carte n'étant plus qu'un bloc de la colonne — voir les règles
 * `.scene-mobile .legal-*` dans globals.css, qui s'appuient sur les classes
 * posées ici pour repasser les tailles en pixels.
 */
export function LegalCard({
  crumb,
  footerActive,
  title,
  updatedAt,
  children,
}: {
  crumb: string;
  footerActive: FooterActive;
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <Scene className="scene-mobile">
      <TopBar
        className="scene-topbar"
        left={
          <>
            <LogoPill />
            <BackLink href="/" label="Retour à la boutique" />
          </>
        }
        right={<Breadcrumb className="legal-crumb" items={["Boutique", crumb]} />}
      />

      <div
        className="legal-card"
        style={{
          position: "absolute",
          top: vmin(112),
          left: "50%",
          transform: "translateX(-50%)",
          width: capped(860),
          height: `min(${vmin(700)}, calc(100% - ${vmin(190)}))`,
          boxSizing: "border-box",
          padding: `${vmin(40)} ${vmin(46)}`,
          borderRadius: "var(--radius-2xl)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))",
          border: "1px solid var(--surface-light-border)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.3)",
          color: "var(--ink)",
          display: "flex",
          flexDirection: "column",
          gap: vmin(18),
        }}
      >
        <div
          className="legal-head"
          style={{ flex: "none", display: "flex", flexDirection: "column", gap: vmin(4) }}
        >
          <div className="legal-title" style={{ fontSize: vmin(30), fontWeight: 700 }}>
            {title}
          </div>
          <div
            className="legal-updated"
            style={{ fontSize: vmin(13), fontWeight: 500, color: "var(--ink-quaternary)" }}
          >
            Dernière mise à jour : {updatedAt}
          </div>
        </div>

        <div
          className="legal-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingRight: vmin(12),
            display: "flex",
            flexDirection: "column",
            gap: vmin(22),
            fontSize: vmin(15),
            lineHeight: 1.65,
            color: "var(--ink-secondary)",
          }}
        >
          {children}
        </div>
      </div>

      <Footer active={footerActive} />
    </Scene>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="legal-section"
      style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}
    >
      <div
        className="legal-section-title"
        style={{ fontSize: vmin(17), fontWeight: 700, color: "var(--ink)" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
