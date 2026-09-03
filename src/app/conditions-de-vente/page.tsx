import { LegalCard, LegalSection } from "@/components/scene/LegalCard";

export default function ConditionsDeVentePage() {
  return (
    <LegalCard
      crumb="Conditions de vente"
      footerActive="conditions"
      title="Conditions générales de vente"
      updatedAt="3 septembre 2026"
    >
      <LegalSection title="1. Champ d'application">
        <p style={{ margin: 0 }}>
          Les présentes conditions générales de vente régissent les relations contractuelles entre
          Mahaleo SAS et tout client effectuant un achat sur le site mahaleo.fr. Toute commande
          passée sur le site implique l&apos;acceptation sans réserve de ces conditions.
        </p>
      </LegalSection>

      <LegalSection title="2. Produits et prix">
        <p style={{ margin: 0 }}>
          Les prix des produits sont indiqués en euros (€), toutes taxes comprises, hors frais de
          livraison. Mahaleo se réserve le droit de modifier ses prix à tout moment, les produits
          étant facturés au tarif en vigueur au moment de la validation de la commande.
        </p>
      </LegalSection>

      <LegalSection title="3. Commande">
        <p style={{ margin: 0 }}>
          La commande est validée après confirmation du panier, saisie des informations de
          livraison et paiement. Un e-mail de confirmation est envoyé au client à la validation de
          la commande.
        </p>
      </LegalSection>

      <LegalSection title="4. Paiement">
        <p style={{ margin: 0 }}>
          Le paiement est exigible immédiatement à la commande. Il s&apos;effectue par carte
          bancaire via un prestataire de paiement sécurisé. Aucun montant n&apos;est débité avant
          l&apos;expédition de la commande.
        </p>
      </LegalSection>

      <LegalSection title="5. Livraison">
        <p style={{ margin: 0 }}>
          Les commandes sont livrées à l&apos;adresse indiquée par le client lors de la commande.
          La livraison est offerte dès 150 € d&apos;achat ; en dessous de ce montant, des frais de
          livraison forfaitaires s&apos;appliquent et sont indiqués avant validation du paiement.
          Les délais de livraison sont communiqués à titre indicatif.
        </p>
      </LegalSection>

      <LegalSection title="6. Droit de rétractation et retours">
        <p style={{ margin: 0 }}>
          Le client dispose d&apos;un délai de 30 jours à compter de la réception de sa commande
          pour exercer son droit de rétractation, sans avoir à justifier de motif. Les produits
          doivent être retournés neufs, non portés et dans leur emballage d&apos;origine. Le
          remboursement est effectué dans un délai de 14 jours suivant la réception du retour.
        </p>
      </LegalSection>

      <LegalSection title="7. Garanties">
        <p style={{ margin: 0 }}>
          Tous les produits vendus bénéficient de la garantie légale de conformité et de la
          garantie contre les vices cachés, dans les conditions prévues par le Code de la
          consommation et le Code civil.
        </p>
      </LegalSection>

      <LegalSection title="8. Responsabilité">
        <p style={{ margin: 0 }}>
          Mahaleo ne pourra être tenue responsable des dommages résultant d&apos;une mauvaise
          utilisation des produits achetés ou de circonstances hors de son contrôle (cas de force
          majeure, grève, incident de transport).
        </p>
      </LegalSection>

      <LegalSection title="9. Droit applicable et litiges">
        <p style={{ margin: 0 }}>
          Les présentes conditions sont soumises au droit français. En cas de litige, le client
          peut recourir à une médiation conventionnelle avant toute action judiciaire. À défaut de
          résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </LegalSection>
    </LegalCard>
  );
}
