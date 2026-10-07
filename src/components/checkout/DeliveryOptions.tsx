"use client";

import { useEffect, useState, type RefObject } from "react";
import { getShippingQuote, type CheckoutShippingQuote } from "@/app/actions/checkout";
import { formatCents } from "@/lib/format";
import type { PointKind, ShippingOption } from "@/lib/shipping-quote";

const PICKER_SCRIPT = "https://embed.sendcloud.sc/spp/1.0.0/api.min.js";

type PickedServicePoint = {
  id: number;
  name: string;
  carrier: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  general_shop_type?: string;
};

type PickerConfig = {
  apiKey: string;
  country: string;
  language: string;
  carriers?: string;
  postalCode?: string;
  city?: string;
  address1?: string;
  shopType?: string;
  servicePointId?: number;
};

declare global {
  interface Window {
    sendcloud?: {
      servicePoints: {
        open: (
          config: PickerConfig,
          onSuccess: (servicePoint: PickedServicePoint, postNumber: string) => void,
          onFailure: (errors: string[]) => void
        ) => void;
      };
    };
  }
}

let pickerLoader: Promise<void> | null = null;

/** Charge le widget Sendcloud à la première ouverture seulement. */
function loadPicker() {
  if (window.sendcloud?.servicePoints) return Promise.resolve();
  pickerLoader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PICKER_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      pickerLoader = null;
      script.remove();
      reject(new Error("La carte des points de retrait n'a pas pu être chargée."));
    };
    document.head.appendChild(script);
  });
  return pickerLoader;
}

export type ServicePointSelection = {
  id: number;
  name: string;
  address: string;
  carrier: string;
  country: string;
  kind: PointKind;
  postNumber: string;
};

/**
 * Options Sendcloud et choix du client, partagés entre le formulaire (choix de
 * l'option) et le récapitulatif (montant de la livraison).
 */
export function useDelivery({ country, itemCount }: { country: string; itemCount: number }) {
  const [quote, setQuote] = useState<CheckoutShippingQuote | null>(null);
  const [quoteKey, setQuoteKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [servicePoint, setServicePoint] = useState<ServicePointSelection | null>(null);

  const key = `${country}|${itemCount}`;
  const loading = quoteKey !== key;

  useEffect(() => {
    let ignore = false;
    getShippingQuote(country, itemCount)
      .then((result) => {
        if (ignore) return;
        setQuote(result);
        setQuoteKey(`${country}|${itemCount}`);
      })
      .catch(() => {
        if (!ignore) setQuoteKey(`${country}|${itemCount}`);
      });
    return () => {
      ignore = true;
    };
  }, [country, itemCount]);

  const options = loading ? [] : (quote?.options ?? []);
  // Option retenue : celle cochée si elle existe encore pour ce pays et ce
  // poids, sinon la moins chère à domicile (première de la liste).
  const option = options.find((entry) => entry.id === selectedId) ?? options[0] ?? null;

  // Un point n'est valable que pour son pays, le transporteur et le type de
  // point (relais ou consigne) de l'option facturée.
  const validPoint =
    servicePoint &&
    option?.mode === "SERVICE_POINT" &&
    servicePoint.country === country &&
    servicePoint.carrier === option.carrier &&
    servicePoint.kind === option.pointKind
      ? servicePoint
      : null;

  return {
    options,
    apiKey: quote?.servicePointApiKey ?? null,
    loading,
    option,
    select: setSelectedId,
    servicePoint: validPoint,
    setServicePoint,
    shippingCents: option ? option.rateCents : null,
    ready: !loading && !!option && (option.mode === "HOME" || !!validPoint),
  };
}

export type Delivery = ReturnType<typeof useDelivery>;

export function DeliveryOptions({
  delivery,
  country,
  currency,
  formRef,
  errors,
}: {
  delivery: Delivery;
  country: string;
  currency: string;
  formRef: RefObject<HTMLFormElement | null>;
  errors?: string[];
}) {
  const { options, apiKey, loading, option, select, servicePoint, setServicePoint } = delivery;
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  const price = (rateCents: number) => formatCents(rateCents, currency);

  const openPicker = async () => {
    if (!apiKey || !option?.carrier || !option.pointKind) return;
    const { carrier, pointKind, pickerShopType } = option;
    setPickerError(null);
    setOpening(true);
    try {
      await loadPicker();
    } catch (error) {
      setPickerError(error instanceof Error ? error.message : "La carte des points de retrait n'a pas pu être chargée.");
      setOpening(false);
      return;
    }
    setOpening(false);

    // La carte s'ouvre centrée sur l'adresse déjà saisie, si elle l'est.
    const value = (name: string) => {
      const field = formRef.current?.elements.namedItem(name);
      return field instanceof HTMLInputElement && field.value.trim() ? field.value.trim() : undefined;
    };

    window.sendcloud?.servicePoints.open(
      {
        apiKey,
        country,
        language: "fr-fr",
        carriers: carrier,
        shopType: pickerShopType ?? undefined,
        postalCode: value("postalCode"),
        city: value("city"),
        address1: value("address"),
        servicePointId: servicePoint?.id,
      },
      (point, postNumber) => {
        const kind: PointKind = point.general_shop_type === "locker" ? "locker" : "servicepoint";
        if (point.carrier !== carrier || kind !== pointKind) {
          setPickerError(
            pointKind === "locker"
              ? "Ce mode livre en consigne automatique : choisissez une consigne."
              : "Ce mode livre en point relais : choisissez un point relais, pas une consigne."
          );
          return;
        }
        setPickerError(null);
        setServicePoint({
          id: point.id,
          name: point.name,
          carrier: point.carrier,
          country,
          kind,
          address: `${[point.house_number, point.street].filter(Boolean).join(" ")}, ${point.postal_code} ${point.city}`,
          postNumber: postNumber ?? "",
        });
      },
      (pickerErrors) => {
        // Fermer la carte sans choisir renvoie aussi une erreur : rien à afficher.
        const messages = pickerErrors.filter((message) => !/closed/i.test(message));
        if (messages.length) setPickerError(messages.join(" "));
      }
    );
  };

  const groups: { title: string; options: ShippingOption[] }[] = [
    { title: "À domicile", options: options.filter((entry) => entry.mode === "HOME") },
    { title: "En point relais ou consigne", options: options.filter((entry) => entry.mode === "SERVICE_POINT") },
  ].filter((group) => group.options.length > 0);

  const isLocker = option?.pointKind === "locker";

  return (
    <fieldset className="retro-delivery">
      <legend>Mode de livraison</legend>
      <input type="hidden" name="shippingOption" value={option?.id ?? ""} />
      <input type="hidden" name="servicePointId" value={servicePoint ? servicePoint.id : ""} />
      <input type="hidden" name="servicePointPostNumber" value={servicePoint ? servicePoint.postNumber : ""} />

      {loading ? (
        <p className="retro-delivery-loading" role="status">Calcul des tarifs de livraison…</p>
      ) : (
        groups.map((group) => (
          <div key={group.title} className="retro-delivery-group" role="radiogroup" aria-label={group.title}>
            <span className="retro-delivery-group-title">{group.title}</span>
            {group.options.map((entry) => (
              <label key={entry.id} className="retro-delivery-option">
                <input
                  type="radio"
                  name="deliveryChoice"
                  checked={option?.id === entry.id}
                  onChange={() => {
                    select(entry.id);
                    setPickerError(null);
                  }}
                />
                <span>
                  <strong>{entry.label}</strong>
                  <small>{entry.description}</small>
                </span>
                <em>{price(entry.rateCents)}</em>
              </label>
            ))}
          </div>
        ))
      )}

      {option?.mode === "SERVICE_POINT" && !loading && (
        <div className="retro-delivery-point">
          {servicePoint ? (
            <p>
              <strong>{servicePoint.name}</strong>
              <span>{servicePoint.address}</span>
            </p>
          ) : (
            <p className="retro-delivery-point-empty">
              {isLocker ? "Aucune consigne sélectionnée." : "Aucun point relais sélectionné."}
            </p>
          )}
          <button type="button" className="retro-delivery-pick" onClick={openPicker} disabled={opening || !apiKey}>
            {opening
              ? "Ouverture de la carte…"
              : servicePoint
                ? isLocker
                  ? "Changer de consigne"
                  : "Changer de point relais"
                : isLocker
                  ? "Choisir une consigne"
                  : "Choisir un point relais"}
          </button>
        </div>
      )}

      {pickerError && <span className="retro-delivery-error" role="alert">{pickerError}</span>}
      {errors?.map((error) => (
        <span key={error} className="retro-delivery-error">{error}</span>
      ))}
    </fieldset>
  );
}
