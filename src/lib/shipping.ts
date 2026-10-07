/**
 * Règles de livraison partagées par le panier, le checkout (client et serveur)
 * et les textes de la boutique : une seule source pour le tarif affiché et le
 * tarif facturé.
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
export const SHIPPING_COST_CENTS = 800;

/**
 * Pays livrés, en code ISO 3166-1 alpha-2 : c'est ce code qui est enregistré
 * sur la commande et transmis à Sendcloud. Le tarif est le même partout.
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

export function shippingCostCents(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
}

/** Quantité maximale d'une même taille dans une commande. */
export const MAX_QTY_PER_LINE = 20;
