/**
 * Client minimal de l'API Sendcloud v2 (expéditions et étiquettes).
 *
 * L'authentification se fait en Basic avec la paire de clés du panel Sendcloud
 * (Paramètres › Intégrations › API). Toutes les fonctions lèvent une
 * `SendcloudError` avec le message renvoyé par Sendcloud : les server actions
 * qui les appellent le transforment en message d'erreur affiché à l'admin.
 */

const API_BASE = "https://panel.sendcloud.sc/api/v2";
const SERVICE_POINTS_API_BASE = "https://servicepoints.sendcloud.sc/api/v2";

export class SendcloudError extends Error {}

export function isSendcloudConfigured() {
  return Boolean(process.env.SENDCLOUD_PUBLIC_KEY && process.env.SENDCLOUD_SECRET_KEY);
}

function authHeader() {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;
  if (!publicKey || !secretKey) {
    throw new SendcloudError(
      "Sendcloud n'est pas configuré : les variables SENDCLOUD_PUBLIC_KEY et SENDCLOUD_SECRET_KEY sont manquantes."
    );
  }
  return `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`;
}

/** Extrait le message d'erreur du corps Sendcloud, quelle que soit sa forme. */
function errorMessageFrom(body: unknown, fallback: string) {
  if (body && typeof body === "object") {
    const error = (body as { error?: { message?: string } }).error;
    if (error?.message) return error.message;
    const message = (body as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit, base = API_BASE): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const raw = await response.text();
  const body = raw ? (JSON.parse(raw) as unknown) : null;

  if (!response.ok) {
    throw new SendcloudError(errorMessageFrom(body, `Sendcloud a répondu ${response.status}.`));
  }
  return body as T;
}

export type SendcloudShippingMethod = {
  id: number;
  name: string;
  carrier: string;
  min_weight: string;
  max_weight: string;
  /** "required" pour une livraison en point relais, "none" à domicile. */
  service_point_input: "none" | "required" | string;
  /** Tarif contractuel Sendcloud (HT, surcharge carburant comprise) par pays. */
  countries: { iso_2: string; price: number }[];
};

export type SendcloudServicePoint = {
  id: number;
  code: string;
  is_active: boolean;
  /** "servicepoint", "locker", "post_office"… */
  general_shop_type: string;
  name: string;
  carrier: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
};

export type SendcloudParcel = {
  id: number;
  tracking_number: string | null;
  tracking_url: string | null;
  weight: string | null;
  carrier: { code: string } | null;
  status: { id: number; message: string } | null;
  shipment: { id: number; name: string } | null;
  label: { normal_printer?: string[]; label_printer?: string } | null;
};

/**
 * Méthodes d'expédition disponibles pour un pays de destination, filtrées sur
 * le poids du colis (Sendcloud refuse un colis hors de la plage de la méthode).
 */
export async function listShippingMethods({
  toCountry,
  weightGrams,
}: {
  toCountry: string;
  weightGrams?: number;
}): Promise<SendcloudShippingMethod[]> {
  const search = new URLSearchParams({ to_country: toCountry });
  const { shipping_methods: methods } = await request<{ shipping_methods: SendcloudShippingMethod[] }>(
    `/shipping_methods?${search}`
  );

  if (weightGrams == null) return methods;
  const kg = weightGrams / 1000;
  return methods.filter((method) => kg >= Number(method.min_weight) && kg <= Number(method.max_weight));
}

// La liste complète des méthodes d'un pays pèse plusieurs centaines de Ko et
// change rarement : le checkout la relit à chaque devis, on la garde en mémoire.
const METHODS_CACHE_TTL_MS = 15 * 60 * 1000;
const methodsCache = new Map<string, { expiresAt: number; methods: SendcloudShippingMethod[] }>();

/** Toutes les méthodes vers un pays, sans filtre de poids, mises en cache. */
export async function cachedShippingMethods(toCountry: string): Promise<SendcloudShippingMethod[]> {
  const cached = methodsCache.get(toCountry);
  if (cached && cached.expiresAt > Date.now()) return cached.methods;
  const methods = await listShippingMethods({ toCountry });
  methodsCache.set(toCountry, { expiresAt: Date.now() + METHODS_CACHE_TTL_MS, methods });
  return methods;
}

/** Point relais par son identifiant Sendcloud (celui que renvoie le widget). */
export async function getServicePoint(servicePointId: number): Promise<SendcloudServicePoint> {
  return request<SendcloudServicePoint>(`/service-points/${servicePointId}/`, undefined, SERVICE_POINTS_API_BASE);
}

/**
 * Sendcloud attend la rue et le numéro dans deux champs distincts. Nos adresses
 * sont saisies en une seule ligne au checkout : on isole le numéro de tête
 * ("10 rue André Lefebvre") et, à défaut, on laisse la ligne entière.
 */
function splitStreetAddress(address: string) {
  const match = address.trim().match(/^(\d+\s*[a-zA-Z]?)\s+(.*)$/);
  if (match) return { houseNumber: match[1].trim(), street: match[2].trim() };
  return { houseNumber: "", street: address.trim() };
}

export type CreateParcelInput = {
  orderReference: string;
  name: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  weightGrams: number;
  methodId: number;
  /** Livraison en point relais : l'adresse du client reste celle du destinataire. */
  servicePointId?: number | null;
  servicePointPostNumber?: string | null;
  items: { description: string; quantity: number; valueCents: number; currency: string }[];
};

/** Crée le colis chez Sendcloud et demande l'étiquette dans la foulée. */
export async function createParcel(input: CreateParcelInput): Promise<SendcloudParcel> {
  const { houseNumber, street } = splitStreetAddress(input.address);

  const { parcel } = await request<{ parcel: SendcloudParcel }>("/parcels", {
    method: "POST",
    body: JSON.stringify({
      parcel: {
        name: input.name,
        address: street,
        house_number: houseNumber,
        city: input.city,
        postal_code: input.postalCode,
        country: input.country,
        email: input.email,
        telephone: input.phone ?? "",
        order_number: input.orderReference,
        weight: (input.weightGrams / 1000).toFixed(3),
        request_label: true,
        shipment: { id: input.methodId },
        ...(input.servicePointId
          ? { to_service_point: input.servicePointId, to_post_number: input.servicePointPostNumber ?? "" }
          : {}),
        parcel_items: input.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          value: (item.valueCents / 100).toFixed(2),
        })),
      },
    }),
  });

  return parcel;
}

export async function getParcel(parcelId: number): Promise<SendcloudParcel> {
  const { parcel } = await request<{ parcel: SendcloudParcel }>(`/parcels/${parcelId}`);
  return parcel;
}

export async function cancelParcel(parcelId: number): Promise<void> {
  await request(`/parcels/${parcelId}/cancel`, { method: "POST" });
}

/**
 * Récupère le PDF de l'étiquette. Les URLs d'étiquette renvoyées par Sendcloud
 * exigent l'authentification : le téléchargement passe donc par notre serveur.
 */
export async function fetchLabelPdf(parcelId: number): Promise<ArrayBuffer> {
  const response = await fetch(`${API_BASE}/labels/normal_printer/${parcelId}?start_from=0`, {
    cache: "no-store",
    headers: { Authorization: authHeader(), Accept: "application/pdf" },
  });

  if (!response.ok) {
    throw new SendcloudError(`L'étiquette n'a pas pu être récupérée (Sendcloud a répondu ${response.status}).`);
  }
  return response.arrayBuffer();
}
