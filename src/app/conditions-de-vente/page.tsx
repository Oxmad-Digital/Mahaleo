import type { Metadata } from "next";
import { LegalCard, LegalSection } from "@/components/scene/LegalCard";
import { SUPPORT_EMAIL } from "@/lib/emails/constants";
import { SELLER } from "@/lib/seller";
import { SHIPPING_COUNTRIES } from "@/lib/shipping";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function ConditionsDeVentePage() {
  return (
    <LegalCard
      crumb="Conditions de vente"
      title="Conditions générales de vente"
      updatedAt="7 octobre 2026"
    >
      <LegalSection title="1. Champ d'application">
        <p style={{ margin: 0 }}>
          Les présentes conditions générales de vente régissent les relations contractuelles entre{" "}
          {SELLER.name}, qui édite et exploite la boutique Mahaleo (voir les mentions légales), et
          tout client effectuant un achat sur le site mahaleo.shop. Le client les accepte
          expressément en cochant la case prévue à cet effet avant le paiement.
        </p>
      </LegalSection>

      <LegalSection title="2. Produits et prix">
        <p style={{ margin: 0 }}>
          Les prix des produits sont indiqués en euros (€), toutes taxes comprises, hors frais de
          livraison. Ils peuvent être modifiés à tout moment ; les produits sont facturés au tarif
          en vigueur au moment de la validation de la commande, qui est rappelé avant le paiement.
        </p>
      </LegalSection>

      <LegalSection title="3. Commande">
        <p style={{ margin: 0 }}>
          La commande est validée après confirmation du panier, saisie des informations de
          livraison, acceptation des présentes conditions et paiement. La disponibilité des
          articles est vérifiée au moment du paiement. Un e-mail de confirmation récapitulant la
          commande est envoyé au client dès la réception du paiement, et la facture est disponible
          dans son espace client.
        </p>
      </LegalSection>

      <LegalSection title="4. Paiement">
        <p style={{ margin: 0 }}>
          Le paiement est exigible immédiatement à la commande. Il s&apos;effectue par carte
          bancaire via le prestataire de paiement sécurisé Stripe, et le montant est débité à la
          validation de la commande. Les données bancaires ne transitent pas par le site.
        </p>
      </LegalSection>

      <LegalSection title="5. Livraison">
        <p style={{ margin: 0 }}>
          Les commandes sont livrées à l&apos;adresse indiquée par le client lors de la commande ou, à
          son choix, dans le point relais qu&apos;il sélectionne, dans les pays proposés au moment du
          paiement ({SHIPPING_COUNTRIES.map((country) => country.label).join(", ")}). Les frais de
          livraison dépendent du pays, du poids du colis et du mode choisi. Ils
          sont indiqués avant la validation de la commande. Les délais de livraison sont communiqués à titre indicatif ; un
          numéro de suivi est envoyé par e-mail à l&apos;expédition.
        </p>
      </LegalSection>

      <LegalSection title="6. Droit de rétractation et retours">
        <p style={{ margin: 0 }}>
          Le client dispose d&apos;un délai de 30 jours à compter de la réception de sa commande
          pour exercer son droit de rétractation, sans avoir à justifier de motif, en écrivant à{" "}
          {SUPPORT_EMAIL} avec la référence de sa commande. Les produits doivent être retournés
          neufs, non portés et dans leur emballage d&apos;origine. Le remboursement est effectué sur
          le moyen de paiement utilisé, dans un délai de 14 jours suivant la réception du retour.
        </p>
      </LegalSection>

      <LegalSection title="7. Annulation">
        <p style={{ margin: 0 }}>
          Une commande annulée avant son expédition, à la demande du client ou faute de stock, est
          intégralement remboursée sur le moyen de paiement utilisé, frais de livraison compris. Un
          avoir annulant la facture est alors émis.
        </p>
      </LegalSection>

      <LegalSection title="8. Garanties">
        <p style={{ margin: 0 }}>
          Tous les produits vendus bénéficient de la garantie légale de conformité et de la
          garantie contre les vices cachés, dans les conditions prévues par le Code de la
          consommation et le Code civil.
        </p>
      </LegalSection>

      <LegalSection title="9. Responsabilité">
        <p style={{ margin: 0 }}>
          {SELLER.name} ne pourra être tenue responsable des dommages résultant d&apos;une mauvaise
          utilisation des produits achetés ou de circonstances hors de son contrôle (cas de force
          majeure, grève, incident de transport).
        </p>
      </LegalSection>

      <LegalSection title="10. Droit applicable et litiges">
        <p style={{ margin: 0 }}>
          Les présentes conditions sont soumises au droit français, sans préjudice des dispositions
          impératives plus protectrices du pays de résidence du client consommateur. En cas de
          litige, le client est invité à contacter d&apos;abord le service client à {SUPPORT_EMAIL} ; il
          peut également recourir gratuitement à une médiation de la consommation avant toute
          action judiciaire.
        </p>
      </LegalSection>
    </LegalCard>
  );
}
