/**
 * Options de livraison calculées à partir des tarifs Sendcloud : utilisées par
 * le checkout pour l'affichage (server action) puis recalculées au paiement, le
 * client ne transmettant jamais de prix, seulement l'identifiant de l'option.
 */

import { cachedShippingMethods, isSendcloudConfigured, type SendcloudShippingMethod } from "@/lib/sendcloud";
import {
  FALLBACK_SHIPPING_COST_CENTS,
  FALLBACK_SHIPPING_OPTION_ID,
  carrierLabel,
  estimatedParcelWeightGrams,
  type DeliveryModeCode,
} from "@/lib/shipping";

/** Type de point attendu par une option point relais. */
export type PointKind = "servicepoint" | "locker";

export type ShippingOption = {
  /** Identifiant de méthode Sendcloud, ou l'option de repli. */
  id: string;
  mode: DeliveryModeCode;
  /** Absent pour le tarif de repli : l'admin choisira la méthode à l'étiquette. */
  methodId: number | null;
  methodName: string | null;
  carrier: string | null;
  label: string;
  description: string;
  rateCents: number;
  /** Options point relais : type de point accepté et filtre du widget. */
  pointKind: PointKind | null;
  pickerShopType: string | null;
};

/** Transporteurs activés pour les points relais dans l'intégration Sendcloud. */
const SERVICE_POINT_CARRIERS = ["mondial_relay", "colissimo", "chronopost"];

// Variantes écartées : lettre non suivie, livraison le samedi (surcoût sans
// intérêt pour des vêtements), droits de douane à la charge du client (DAP) et
// doublons « QR » (même service, dépôt sans étiquette imprimée).
const EXCLUDED = /unstamped|saturday|samedi|DAP|\bQR\b/i;

/**
 * Libellé et délai affichés au client, par famille de méthode Sendcloud. Les
 * noms Sendcloud (« Mondial Relay Home Domestic 0.5-1kg ») ne sont pas faits
 * pour la vitrine ; une famille inconnue garde son nom sans tranche de poids.
 */
const FAMILIES: { match: RegExp; label: string; description: string; pointKind?: PointKind }[] = [
  { match: /locker/i, label: "Consigne automatique", description: "Retrait 24 h/24 dans une consigne", pointKind: "locker" },
  { match: /shop2shop|2shop/i, label: "Shop2Shop", description: "Retrait en relais Pickup, formule économique", pointKind: "servicepoint" },
  { match: /colissimo.*(service point|point retrait)/i, label: "Point retrait", description: "Retrait en bureau de poste ou relais Pickup", pointKind: "servicepoint" },
  { match: /chrono relais/i, label: "Chrono Relais", description: "Retrait en relais Pickup", pointKind: "servicepoint" },
  { match: /point relais|service point|point retrait|relais/i, label: "Point relais", description: "Retrait en point relais", pointKind: "servicepoint" },
  { match: /home signature|avec signature/i, label: "Domicile contre signature", description: "Remise en main propre" },
  { match: /chrono 18 BAL/i, label: "Chrono 18 boîte aux lettres", description: "Le lendemain avant 18 h, en boîte aux lettres" },
  { match: /chrono 18/i, label: "Chrono 18", description: "Le lendemain avant 18 h" },
  { match: /chrono 13/i, label: "Chrono 13", description: "Le lendemain avant 13 h" },
  { match: /chrono 10/i, label: "Chrono 10", description: "Le lendemain avant 10 h" },
  { match: /chrono express/i, label: "Express", description: "Livraison express, 1 à 3 jours" },
  { match: /chrono classic/i, label: "Classic", description: "Livraison à domicile, 2 à 4 jours" },
  { match: /home|domicile/i, label: "Domicile", description: "Livraison à domicile" },
];

/** Filtre du widget Sendcloud par type de point, quand le transporteur en a un. */
const PICKER_SHOP_TYPES: Record<string, Partial<Record<PointKind, string>>> = {
  mondial_relay: { servicepoint: "1", locker: "C" },
};

const fallbackOption: ShippingOption = {
  id: FALLBACK_SHIPPING_OPTION_ID,
  mode: "HOME",
  methodId: null,
  methodName: null,
  carrier: null,
  label: "Livraison à domicile",
  description: "Colis suivi",
  rateCents: FALLBACK_SHIPPING_COST_CENTS,
  pointKind: null,
  pickerShopType: null,
};

/**
 * Prix Sendcloud arrondi à l'euro supérieur : la boutique, les factures et les
 * e-mails affichent des montants entiers (`formatCents`), le total reste exact.
 */
function toRateCents(price: number) {
  return Math.ceil(Math.round(price * 100) / 100) * 100;
}

/** Nom de la méthode sans sa tranche de poids : identifie une famille. */
function familyName(name: string) {
  return name.replace(/\s*[\d.]+-[\d.]+\s*kg$/i, "").trim();
}

function toOption(method: SendcloudShippingMethod, rateCents: number): ShippingOption | null {
  const servicePoint = method.service_point_input === "required";
  if (servicePoint && !SERVICE_POINT_CARRIERS.includes(method.carrier)) return null;

  const family = familyName(method.name);
  const known = FAMILIES.find((entry) => entry.match.test(family) && Boolean(entry.pointKind) === servicePoint);
  const pointKind = servicePoint ? (known?.pointKind ?? "servicepoint") : null;

  return {
    id: String(method.id),
    mode: servicePoint ? "SERVICE_POINT" : "HOME",
    methodId: method.id,
    methodName: method.name,
    carrier: method.carrier,
    label: `${carrierLabel(method.carrier)} · ${known?.label ?? family.replace(/^\(nouvelle\)\s*/i, "")}`,
    description: known?.description ?? (servicePoint ? "Retrait en point relais" : "Livraison à domicile"),
    rateCents,
    pointKind,
    pickerShopType: pointKind ? (PICKER_SHOP_TYPES[method.carrier]?.[pointKind] ?? null) : null,
  };
}

/**
 * Toutes les options pertinentes pour le pays et le nombre d'articles : une
 * par famille de méthode (la tranche de poids qui convient), domicile d'abord,
 * chaque groupe trié par prix.
 */
export async function quoteShipping(country: string, itemCount: number): Promise<ShippingOption[]> {
  if (!isSendcloudConfigured()) return [fallbackOption];

  let methods: SendcloudShippingMethod[];
  try {
    methods = await cachedShippingMethods(country);
  } catch (error) {
    console.error("[shipping] Tarifs Sendcloud indisponibles:", error);
    return [fallbackOption];
  }

  const kg = estimatedParcelWeightGrams(itemCount) / 1000;
  const byFamily = new Map<string, ShippingOption>();

  for (const method of methods) {
    if (method.carrier === "sendcloud" || EXCLUDED.test(method.name)) continue;
    if (kg < Number(method.min_weight) || kg > Number(method.max_weight)) continue;
    const price = method.countries.find((entry) => entry.iso_2 === country)?.price;
    if (!price || price <= 0) continue;

    const option = toOption(method, toRateCents(price));
    if (!option) continue;
    const key = `${method.carrier}|${method.service_point_input}|${familyName(method.name)}`;
    const existing = byFamily.get(key);
    if (!existing || option.rateCents < existing.rateCents) byFamily.set(key, option);
  }

  const options = [...byFamily.values()].sort(
    (a, b) => (a.mode === b.mode ? a.rateCents - b.rateCents : a.mode === "HOME" ? -1 : 1)
  );

  // Sans aucune option à domicile, le client doit toujours pouvoir commander.
  return options.some((option) => option.mode === "HOME") ? options : [fallbackOption, ...options];
}

export function findShippingOption(options: ShippingOption[], id: string) {
  return options.find((option) => option.id === id) ?? null;
}
