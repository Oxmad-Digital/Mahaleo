import type { Metadata } from "next";
import { LegalCard, LegalSection } from "@/components/scene/LegalCard";
import { SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <LegalCard
      crumb="Mentions légales"
      title="Mentions légales"
      updatedAt="21 octobre 2026"
    >
      <LegalSection title="1. Éditeur du site">
        <p style={{ margin: 0 }}>
          La boutique en ligne Mahaleo est éditée et exploitée par {SELLER.name}, {SELLER.legalForm},
          immatriculée au Registre national des entreprises sous le numéro SIREN {SELLER.siren}
          (SIRET {SELLER.siret}, code APE {SELLER.ape}), dont le siège social est situé{" "}
          {SELLER.addressLines.join(", ")}.
        </p>
        <p style={{ margin: 0 }}>E-mail : {SELLER.email}</p>
        <p style={{ margin: 0 }}>
          Directeur de la publication : {SELLER.president}, Président de {SELLER.name}.
        </p>
      </LegalSection>

      <LegalSection title="2. Hébergement">
        <p style={{ margin: 0 }}>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis — https://vercel.com.
        </p>
      </LegalSection>

      <LegalSection title="3. Conception et réalisation">
        <p style={{ margin: 0 }}>Le site a été conçu et réalisé par Oxmad Digital.</p>
      </LegalSection>

      <LegalSection title="4. Propriété intellectuelle">
        <p style={{ margin: 0 }}>
          L&apos;ensemble des contenus présents sur le site (textes, images, logos, éléments
          graphiques, photographies) est protégé par le droit d&apos;auteur et reste la propriété
          de {SELLER.name} ou de leurs titulaires respectifs, qui en ont autorisé
          l&apos;utilisation, sauf mention contraire. Toute reproduction ou utilisation sans autorisation
          préalable est interdite.
        </p>
      </LegalSection>

      <LegalSection title="5. Données personnelles">
        <p style={{ margin: 0 }}>
          Les informations recueillies lors de la création d&apos;un compte ou d&apos;une commande
          font l&apos;objet d&apos;un traitement destiné à la gestion de la relation client.
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
          suppression de vos données, exerçable à l&apos;adresse {SELLER.email}.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p style={{ margin: 0 }}>
          Le site utilise des cookies nécessaires à son fonctionnement (panier, session) ainsi que
          des cookies de mesure d&apos;audience. Vous pouvez gérer vos préférences depuis les
          paramètres de votre navigateur.
        </p>
      </LegalSection>
    </LegalCard>
  );
}
