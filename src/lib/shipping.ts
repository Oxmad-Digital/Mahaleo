/**
 * Règles de livraison partagées par le panier, le checkout (client et serveur)
 * et les textes de la boutique. Ce module est importé côté client : les appels
 * Sendcloud vivent dans `shipping-quote.ts`.
 */

/**
 * Tarif de repli de la livraison à domicile, appliqué quand Sendcloud ne
 * renvoie aucun tarif (API injoignable, pays sans méthode) : le checkout ne
 * doit jamais être bloqué par le transporteur.
 */
export const FALLBACK_SHIPPING_COST_CENTS = 800;
export const FALLBACK_SHIPPING_OPTION_ID = "standard";

/**
 * Poids estimé du colis pour choisir la tranche de tarif Sendcloud : les
 * produits n'ont pas de poids en base, on compte un vêtement moyen par article
 * plus l'emballage. L'admin saisit le poids réel au moment de l'étiquette.
 */
const PACKAGING_WEIGHT_GRAMS = 150;
const ITEM_WEIGHT_GRAMS = 400;

export function estimatedParcelWeightGrams(itemCount: number) {
  return PACKAGING_WEIGHT_GRAMS + ITEM_WEIGHT_GRAMS * Math.max(1, itemCount);
}

export const DELIVERY_MODES = ["HOME", "SERVICE_POINT"] as const;
export type DeliveryModeCode = (typeof DELIVERY_MODES)[number];

export const DELIVERY_MODE_LABELS: Record<DeliveryModeCode, string> = {
  HOME: "Livraison à domicile",
  SERVICE_POINT: "Livraison en point relais",
};

const CARRIER_LABELS: Record<string, string> = {
  colissimo: "Colissimo",
  chronopost: "Chronopost",
  mondial_relay: "Mondial Relay",
};

export function carrierLabel(code: string | null | undefined) {
  if (!code) return "";
  return CARRIER_LABELS[code] ?? code.replace(/_/g, " ").toUpperCase();
}

/**
 * Pays livrés, en code ISO 3166-1 alpha-2 : c'est ce code qui est enregistré
 * sur la commande et transmis à Sendcloud. Le tarif dépend du pays, du poids
 * et du mode de livraison (cf. `src/lib/shipping-quote.ts`).
 */
export const SHIPPING_COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "LU", label: "Luxembourg" },
  { code: "MC", label: "Monaco" },
  { code: "CH", label: "Suisse" },
  { code: "DE", label: "Allemagne" },
  { code: "NL", label: "Pays-Bas" },
  { code: "ES", label: "Espagne" },
  { code: "IT", label: "Italie" },
  { code: "PT", label: "Portugal" },
  { code: "AT", label: "Autriche" },
  { code: "IE", label: "Irlande" },
] as const;

export type ShippingCountryCode = (typeof SHIPPING_COUNTRIES)[number]["code"];

export const SHIPPING_COUNTRY_CODES = SHIPPING_COUNTRIES.map((country) => country.code) as [
  ShippingCountryCode,
  ...ShippingCountryCode[],
];

/** Quantité maximale d'une même taille dans une commande. */
export const MAX_QTY_PER_LINE = 20;
