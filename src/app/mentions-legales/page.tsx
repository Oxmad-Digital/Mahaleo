import { LegalCard, LegalSection } from "@/components/scene/LegalCard";

export default function MentionsLegalesPage() {
  return (
    <LegalCard
      crumb="Mentions légales"
      footerActive="mentions"
      title="Mentions légales"
      updatedAt="3 septembre 2026"
    >
      <LegalSection title="1. Éditeur du site">
        <p style={{ margin: 0 }}>
          Le site Mahaleo est édité par Mahaleo SAS, société par actions simplifiée au capital de
          10 000 €, immatriculée au Registre du Commerce et des Sociétés sous le numéro [SIRET à
          compléter], dont le siège social est situé [adresse à compléter].
        </p>
        <p style={{ margin: 0 }}>
          Directeur de la publication : [nom à compléter]. Contact : contact@mahaleo.fr
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
          graphiques) est protégé par le droit d&apos;auteur et reste la propriété exclusive de
          Mahaleo SAS, sauf mention contraire. Toute reproduction ou utilisation sans autorisation
          préalable est interdite.
        </p>
      </LegalSection>

      <LegalSection title="5. Données personnelles">
        <p style={{ margin: 0 }}>
          Les informations recueillies lors de la création d&apos;un compte ou d&apos;une commande
          font l&apos;objet d&apos;un traitement destiné à la gestion de la relation client.
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
          suppression de vos données, exerçable à l&apos;adresse contact@mahaleo.fr.
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
