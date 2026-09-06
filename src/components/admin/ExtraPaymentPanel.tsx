"use client";

import { useActionState, useState, useTransition } from "react";
import { cancelExtraPayment, createExtraPayment } from "@/app/actions/orders";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatCentsExact, formatDate } from "@/lib/format";
import type { ExtraPaymentState } from "@/lib/definitions";
import type { ExtraPayment } from "@/generated/prisma/client";

const BORDER = "1px solid rgba(55,53,47,0.09)";
const MUTED = "rgba(55,53,47,0.45)";

const STATUS_STYLE = {
  PENDING: { label: "En attente", bg: "#fbf3db", ink: "#8a6416" },
  PAID: { label: "Réglé", bg: "#dbeddb", ink: "#1c6b3a" },
  CANCELLED: { label: "Annulé", bg: "#f1f1ef", ink: "rgba(55,53,47,0.6)" },
} as const;

export function ExtraPaymentPanel({ orderId, payments }: { orderId: string; payments: ExtraPayment[] }) {
  const [open, setOpen] = useState(payments.length > 0);
  const action = createExtraPayment.bind(null, orderId);

  // Le formulaire est remonté (donc vidé) une fois le lien créé et envoyé.
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState<ExtraPaymentState, FormData>(async (previous, formData) => {
    const result = await action(previous, formData);
    if (result?.success) setFormKey((key) => key + 1);
    return result;
  }, undefined);

  const [cancelTarget, setCancelTarget] = useState<ExtraPayment | null>(null);
  const [cancelPending, startCancel] = useTransition();
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  return (
    <div style={{ padding: "18px 20px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 14 }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: 0,
          border: "none",
          background: "transparent",
          fontFamily: "inherit",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>
          PAIEMENT COMPLÉMENTAIRE
        </span>
        <span style={{ fontSize: 12, color: MUTED }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          <p style={{ fontSize: 13, color: "rgba(55,53,47,0.55)", margin: 0, lineHeight: 1.6 }}>
            Génère un lien de paiement Stripe à montant libre (frais de réexpédition après correction d&apos;adresse,
            article ajouté…) et l&apos;envoie par e-mail au client.
          </p>

          {payments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {payments.map((payment) => {
                const style = STATUS_STYLE[payment.status];
                return (
                  <div
                    key={payment.id}
                    style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 10, borderBottom: BORDER }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{payment.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {formatCentsExact(payment.amountCents, payment.currency)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: style.bg,
                          fontSize: 11,
                          fontWeight: 500,
                          color: style.ink,
                        }}
                      >
                        {style.label}
                      </span>
                      <span style={{ fontSize: 12, color: MUTED }}>
                        {payment.status === "PAID" && payment.paidAt
                          ? `le ${formatDate(payment.paidAt)}`
                          : `créé le ${formatDate(payment.createdAt)}`}
                      </span>
                      {payment.status === "PENDING" && payment.checkoutUrl && (
                        <a
                          href={payment.checkoutUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-green, #1c6b3a)" }}
                        >
                          Ouvrir le lien
                        </a>
                      )}
                      {payment.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(payment)}
                          style={{
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: "inherit",
                            color: "#a82c2c",
                            cursor: "pointer",
                          }}
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cancelMessage && <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{cancelMessage}</p>}

          <form key={formKey} action={formAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="label" style={{ fontSize: 12, fontWeight: 600, color: "rgba(55,53,47,0.7)" }}>
                Motif
              </label>
              <input id="label" name="label" placeholder="Frais de réexpédition" style={inputStyle} />
              {state?.errors?.label && <FieldError message={state.errors.label[0]} />}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="amountEuros" style={{ fontSize: 12, fontWeight: 600, color: "rgba(55,53,47,0.7)" }}>
                Montant (€)
              </label>
              <input id="amountEuros" name="amountEuros" inputMode="decimal" placeholder="12.50" style={inputStyle} />
              {state?.errors?.amountEuros && <FieldError message={state.errors.amountEuros[0]} />}
            </div>

            {state?.message && <FieldError message={state.message} />}
            {state?.success && (
              <p style={{ fontSize: 12, color: "var(--brand-green, #1c6b3a)", margin: 0, fontWeight: 500 }}>
                Lien créé et envoyé au client par e-mail.
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              style={{
                padding: "9px 16px",
                borderRadius: 6,
                border: "none",
                background: "#37352f",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: pending ? "default" : "pointer",
                opacity: pending ? 0.7 : 1,
              }}
            >
              {pending ? "Création du lien..." : "Créer et envoyer le lien"}
            </button>
          </form>
        </>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Annuler le paiement"
        message="Le lien de paiement sera désactivé : le client ne pourra plus régler ce complément."
        confirmLabel="Annuler le paiement"
        cancelLabel="Fermer"
        danger
        pending={cancelPending}
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          setCancelMessage(null);
          startCancel(async () => {
            const result = await cancelExtraPayment(cancelTarget.id);
            if (result.message) setCancelMessage(result.message);
            setCancelTarget(null);
          });
        }}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "8px 11px",
  borderRadius: 6,
  border: "1px solid rgba(55,53,47,0.15)",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#37352f",
  outline: "none",
};

function FieldError({ message }: { message: string }) {
  return <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{message}</p>;
}
