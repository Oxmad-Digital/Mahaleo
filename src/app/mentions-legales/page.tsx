import { LegalCard, LegalSection } from "@/components/scene/LegalCard";

export default function MentionsLegalesPage() {
  return (
    <LegalCard
      crumb="Mentions légales"
      title="Mentions légales"
      updatedAt="28 septembre 2026"
    >
      <LegalSection title="1. Éditeur du site">
        <p style={{ margin: 0 }}>
          La boutique en ligne Mahaleo est éditée et exploitée par ULTRAMAILLE S.A, société
          immatriculée à Madagascar, dont le siège social est situé Lot II G 55 ter NBA Ambatomaro,
          BP 3298, Antananarivo (101), Madagascar.
        </p>
        <p style={{ margin: 0 }}>
          Téléphone : +261 34 11 855 10 / +261 34 11 855 22. E-mail : contact@ultramaille.com
        </p>
        <p style={{ margin: 0 }}>
          La direction de la publication est assurée par la direction générale d&apos;ULTRAMAILLE S.A.
        </p>
      </LegalSection>

      <LegalSection title="2. Hébergement">
        <p style={{ margin: 0 }}>
          Le site est hébergé par [nom de l&apos;hébergeur à compléter], [adresse de l&apos;hébergeur
          à compléter].
        </p>
      </LegalSection>

      <LegalSection title="3. Conception et réalisation">
        <p style={{ margin: 0 }}>Le site a été conçu et réalisé par Oxmad Digital.</p>
      </LegalSection>

      <LegalSection title="4. Propriété intellectuelle">
        <p style={{ margin: 0 }}>
          L&apos;ensemble des contenus présents sur le site (textes, images, logos, éléments
          graphiques, photographies) est protégé par le droit d&apos;auteur et reste la propriété
          d&apos;ULTRAMAILLE S.A ou de leurs titulaires respectifs, qui en ont autorisé
          l&apos;utilisation, sauf mention contraire. Toute reproduction ou utilisation sans autorisation
          préalable est interdite.
        </p>
      </LegalSection>

      <LegalSection title="5. Données personnelles">
        <p style={{ margin: 0 }}>
          Les informations recueillies lors de la création d&apos;un compte ou d&apos;une commande
          font l&apos;objet d&apos;un traitement destiné à la gestion de la relation client.
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
          suppression de vos données, exerçable à l&apos;adresse contact@ultramaille.com.
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
