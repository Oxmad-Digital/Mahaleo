"use client";

import { useActionState, useCallback, useEffect, useState, useTransition } from "react";
import {
  cancelShippingLabel,
  createShippingLabel,
  listShippingOptions,
  refreshShipmentTracking,
} from "@/app/actions/orders";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { ShippingLabelState } from "@/lib/definitions";
import type { Shipment } from "@/generated/prisma/client";

const BORDER = "1px solid rgba(55,53,47,0.09)";
const GREEN = "var(--brand-green, #1c6b3a)";
const MUTED = "rgba(55,53,47,0.45)";

type ShippingMethodOption = { id: number; name: string; carrier: string };

export function OrderShippingPanel({
  orderId,
  shipment,
  configured,
  canShip,
}: {
  orderId: string;
  shipment: Shipment | null;
  configured: boolean;
  canShip: boolean;
}) {
  const activeLabel = shipment && !shipment.cancelledAt ? shipment : null;
  const [tab, setTab] = useState<"tracking" | "label">(activeLabel ? "tracking" : "label");

  return (
    <div style={{ padding: "22px 24px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>EXPÉDITION SENDCLOUD</div>
        <div style={{ display: "flex", gap: 4, padding: 3, borderRadius: 8, background: "#f7f7f5" }}>
          <TabButton active={tab === "tracking"} onClick={() => setTab("tracking")}>
            Suivi
          </TabButton>
          <TabButton active={tab === "label"} onClick={() => setTab("label")}>
            {activeLabel ? "Remplacer l'étiquette" : "Créer l'étiquette"}
          </TabButton>
        </div>
      </div>

      {!configured && (
        <Notice tone="warning">
          Sendcloud n&apos;est pas configuré : renseignez <code>SENDCLOUD_PUBLIC_KEY</code> et{" "}
          <code>SENDCLOUD_SECRET_KEY</code> pour générer des étiquettes depuis cette fiche.
        </Notice>
      )}

      {tab === "tracking" ? (
        <TrackingView orderId={orderId} shipment={shipment} activeLabel={activeLabel} />
      ) : (
        <LabelForm orderId={orderId} activeLabel={activeLabel} configured={configured} canShip={canShip} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TrackingView({
  orderId,
  shipment,
  activeLabel,
}: {
  orderId: string;
  shipment: Shipment | null;
  activeLabel: Shipment | null;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!shipment) {
    return (
      <p style={{ fontSize: 14, color: "rgba(55,53,47,0.6)", margin: 0 }}>
        Aucun colis n&apos;a encore été créé pour cette commande. Passez par l&apos;onglet « Créer l&apos;étiquette ».
      </p>
    );
  }

  const run = (fn: () => Promise<{ message?: string }>) => {
    setMessage(null);
    startTransition(async () => {
      const result = await fn();
      if (result.message) setMessage(result.message);
      setConfirmCancel(false);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {!activeLabel && <Notice tone="warning">Cette étiquette a été annulée. Vous pouvez en générer une nouvelle.</Notice>}

      <div className="admin-order-shipping-grid" style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
        <ReadField label="N° de suivi" value={shipment.trackingNumber ?? "—"} mono />
        <ReadField label="Transporteur" value={shipment.carrier ? shipment.carrier.toUpperCase() : "—"} />
        <ReadField label="Méthode" value={shipment.methodName ?? "—"} />
        <ReadField label="Poids" value={`${(shipment.weightGrams / 1000).toFixed(2)} kg`} />
        <ReadField label="Statut Sendcloud" value={shipment.statusMessage ?? "—"} />
      </div>

      {message && <Notice tone="danger">{message}</Notice>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {activeLabel && (
          <a
            href={`/admin/commandes/${orderId}/etiquette`}
            style={{
              padding: "9px 16px",
              borderRadius: 6,
              background: "#37352f",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Télécharger l&apos;étiquette
          </a>
        )}
        <SecondaryButton disabled={pending} onClick={() => run(() => refreshShipmentTracking(orderId))}>
          {pending ? "…" : "Actualiser le suivi"}
        </SecondaryButton>
        {shipment.trackingUrl && (
          <a
            href={shipment.trackingUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "9px 16px",
              borderRadius: 6,
              border: BORDER,
              fontSize: 14,
              fontWeight: 600,
              color: "#37352f",
            }}
          >
            Suivre le colis
          </a>
        )}
        {activeLabel && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmCancel(true)}
            style={{
              padding: "9px 16px",
              borderRadius: 6,
              border: "1px solid rgba(168,44,44,0.25)",
              background: "transparent",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              color: "#a82c2c",
              cursor: pending ? "default" : "pointer",
            }}
          >
            ✕ Annuler l&apos;étiquette
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Annuler l'étiquette"
        message="L'étiquette sera annulée chez Sendcloud et ne pourra plus être utilisée. Le colis devra être recréé pour être expédié."
        confirmLabel="Annuler l'étiquette"
        cancelLabel="Fermer"
        danger
        pending={pending}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => run(() => cancelShippingLabel(orderId))}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function LabelForm({
  orderId,
  activeLabel,
  configured,
  canShip,
}: {
  orderId: string;
  activeLabel: Shipment | null;
  configured: boolean;
  canShip: boolean;
}) {
  const action = createShippingLabel.bind(null, orderId);
  const [state, formAction, pending] = useActionState<ShippingLabelState, FormData>(action, undefined);

  const [weightKg, setWeightKg] = useState(activeLabel ? (activeLabel.weightGrams / 1000).toFixed(2) : "1.00");
  const [methods, setMethods] = useState<ShippingMethodOption[]>([]);
  const [methodsMessage, setMethodsMessage] = useState<string | null>(null);
  const [loadingMethods, startLoadingMethods] = useTransition();

  const weightGrams = Math.round(Number(weightKg.replace(",", ".")) * 1000) || 0;

  const loadMethods = useCallback(
    (grams: number) => {
      startLoadingMethods(async () => {
        const result = await listShippingOptions(orderId, grams);
        setMethods(result.methods.map((m) => ({ id: m.id, name: m.name, carrier: m.carrier })));
        setMethodsMessage(
          result.message ??
            (result.methods.length === 0 ? "Aucune méthode d'expédition disponible pour ce poids et ce pays." : null)
        );
      });
    },
    [orderId]
  );

  // Les méthodes proposées dépendent du poids : on recharge la liste après une
  // courte pause pour ne pas appeler Sendcloud à chaque frappe.
  useEffect(() => {
    if (!configured || weightGrams <= 0) return;
    const timer = setTimeout(() => loadMethods(weightGrams), 400);
    return () => clearTimeout(timer);
  }, [configured, weightGrams, loadMethods]);

  if (activeLabel) {
    return (
      <p style={{ fontSize: 14, color: "rgba(55,53,47,0.6)", margin: 0, lineHeight: 1.6 }}>
        Une étiquette est déjà active pour cette commande. Annulez-la depuis l&apos;onglet « Suivi » avant d&apos;en
        générer une nouvelle — par exemple après une correction d&apos;adresse.
      </p>
    );
  }

  if (!canShip) {
    return (
      <p style={{ fontSize: 14, color: "rgba(55,53,47,0.6)", margin: 0 }}>
        Cette commande est annulée : aucune étiquette ne peut être créée.
      </p>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input type="hidden" name="weightGrams" value={weightGrams} />

      <div className="admin-order-form-grid" style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="weightKg" style={{ fontSize: 13, fontWeight: 600, color: "rgba(55,53,47,0.7)" }}>
            Poids (kg)
          </label>
          <input
            id="weightKg"
            inputMode="decimal"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            style={{
              boxSizing: "border-box",
              width: "100%",
              padding: "9px 12px",
              borderRadius: 6,
              border: "1px solid rgba(55,53,47,0.15)",
              fontSize: 14,
              fontFamily: "inherit",
              color: "#37352f",
              outline: "none",
            }}
          />
          {state?.errors?.weightGrams && (
            <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{state.errors.weightGrams[0]}</p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="methodId" style={{ fontSize: 13, fontWeight: 600, color: "rgba(55,53,47,0.7)" }}>
            Méthode d&apos;expédition
          </label>
          <select
            id="methodId"
            name="methodId"
            disabled={!configured || methods.length === 0}
            style={{
              boxSizing: "border-box",
              width: "100%",
              padding: "9px 12px",
              borderRadius: 6,
              border: "1px solid rgba(55,53,47,0.15)",
              fontSize: 14,
              fontFamily: "inherit",
              color: "#37352f",
              background: "#fff",
              outline: "none",
            }}
          >
            {methods.length === 0 ? (
              <option value="">{loadingMethods ? "Chargement…" : "Aucune méthode disponible"}</option>
            ) : (
              methods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} — {method.carrier.toUpperCase()}
                </option>
              ))
            )}
          </select>
          {state?.errors?.methodId && <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{state.errors.methodId[0]}</p>}
        </div>
      </div>

      {methodsMessage && <Notice tone="warning">{methodsMessage}</Notice>}
      {state?.message && <Notice tone="danger">{state.message}</Notice>}

      <p style={{ fontSize: 13, color: "rgba(55,53,47,0.5)", margin: 0, lineHeight: 1.6 }}>
        L&apos;étiquette est générée chez Sendcloud avec l&apos;adresse de livraison ci-dessus. Vérifiez-la avant de
        valider : une étiquette émise doit être annulée pour être refaite.
      </p>

      <div>
        <button
          type="submit"
          disabled={pending || !configured || methods.length === 0}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "none",
            background: GREEN,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: pending || !configured || methods.length === 0 ? "default" : "pointer",
            opacity: pending || !configured || methods.length === 0 ? 0.6 : 1,
          }}
        >
          {pending ? "Création de l'étiquette..." : "Générer l'étiquette"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        border: "none",
        background: active ? "#fff" : "transparent",
        boxShadow: active ? "0 1px 2px rgba(15,15,15,0.1)" : "none",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "inherit",
        color: active ? "#37352f" : "rgba(55,53,47,0.55)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "9px 16px",
        borderRadius: 6,
        border: BORDER,
        background: "transparent",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "inherit",
        color: "#37352f",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ReadField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 120 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: mono ? "ui-monospace, SFMono-Regular, monospace" : "inherit" }}>
        {value}
      </span>
    </div>
  );
}

function Notice({ tone, children }: { tone: "warning" | "danger"; children: React.ReactNode }) {
  const palette =
    tone === "danger" ? { bg: "#fbe4e4", ink: "#a82c2c" } : { bg: "#fbf3db", ink: "#8a6416" };
  return (
    <div style={{ padding: "10px 14px", borderRadius: 6, background: palette.bg, fontSize: 13, color: palette.ink, lineHeight: 1.5 }}>
      {children}
    </div>
  );
}
