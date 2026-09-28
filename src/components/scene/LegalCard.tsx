import type { ReactNode } from "react";
import { StorePage } from "@/components/store/StorePage";
import type { FooterActive } from "./Footer";

export function LegalCard({ crumb, title, updatedAt, children }: { crumb: string; footerActive: FooterActive; title: string; updatedAt: string; children: ReactNode }) {
  return (
    <StorePage eyebrow={crumb.toUpperCase()} title={title.toUpperCase()} className="retro-legal-page">
      <article className="retro-legal-sheet">
        <p className="retro-legal-date">Dernière mise à jour : {updatedAt}</p>
        <div className="retro-legal-body">{children}</div>
      </article>
    </StorePage>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="retro-legal-section"><h2>{title}</h2>{children}</section>;
}
