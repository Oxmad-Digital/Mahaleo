import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { StoreShell } from "./StoreChrome";
import guitar from "../../assets/mahaleo/guitar-retro.webp";

const GROUP_PHOTO_URL = "https://pub-a76a4f2627064f018ee45b30ccc516e6.r2.dev/mahaleo-photo-de-groupe.webp";

export function StorePage({
  eyebrow,
  title,
  backHref = "/",
  backLabel = "Retour à la boutique",
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <StoreShell className={`retro-content-page ${className}`.trim()}>
      <main className="retro-content-main">
        <header className="retro-page-heading">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
          </div>
          <Link href={backHref}>&larr; {backLabel}</Link>
        </header>
        {children}
      </main>
    </StoreShell>
  );
}

export function AuthPanel({
  children,
  groupPhoto = false,
  notes,
}: {
  children: ReactNode;
  groupPhoto?: boolean;
  notes?: ReactNode;
}) {
  return (
    <div className="retro-auth-wrap">
      <aside className="retro-auth-visual" aria-hidden="true">
        <div className="retro-panel-label"><span>MAHALEO</span><span>DEPUIS 1972</span></div>
        <div className={groupPhoto ? "retro-guitar-image retro-group-photo" : "retro-guitar-image"}>
          {groupPhoto
            ? <img src={GROUP_PHOTO_URL} alt="" />
            : <Image src={guitar} alt="" fill sizes="300px" />}
          {!groupPhoto && <div><span>UNE HISTOIRE</span><strong>QUI SE TRANSMET.</strong></div>}
        </div>
        {groupPhoto && <span className="retro-photo-credit">© Lucien Rajaonina</span>}
      </aside>
      <section className="retro-auth-form">{children}</section>
      {notes ?? (
        <aside className="retro-auth-notes" aria-label="Votre espace client">
          <span className="retro-eyebrow">VOTRE ESPACE</span>
          <ol>
            <li><strong>01</strong><span>Suivez vos commandes, de la préparation à la livraison.</span></li>
            <li><strong>02</strong><span>Retrouvez vos factures à tout moment.</span></li>
            <li><strong>03</strong><span>Gérez vos informations et votre mot de passe.</span></li>
          </ol>
          <p>Le nom d’un groupe. Le lien entre des générations.</p>
        </aside>
      )}
    </div>
  );
}
