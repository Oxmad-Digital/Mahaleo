"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ORDER_FLOW, ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/client";

const GREEN = "var(--brand-green, #1c6b3a)";
const LINE = "rgba(55,53,47,0.12)";

const CIRCLE = 30;

export function OrderStatusStepper({ id, status }: { id: string; status: OrderStatus }) {
  const [confirm, setConfirm] = useState<null | { next: OrderStatus; title: string; message: string; danger?: boolean }>(
    null
  );
  const [pending, startTransition] = useTransition();

  const cancelled = status === "CANCELLED";
  const currentIndex = cancelled ? -1 : ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);

  const run = (next: OrderStatus) => {
    startTransition(async () => {
      await updateOrderStatus(id, next);
      setConfirm(null);
    });
  };

  const progress = ORDER_FLOW.length > 1 ? Math.max(0, currentIndex) / (ORDER_FLOW.length - 1) : 0;
  const trackInset = 100 / (ORDER_FLOW.length * 2);

  return (
    <div
      style={{
        padding: "22px 24px 18px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Statut de la commande</div>
        {!cancelled && (
          <div className="admin-order-stepper-hint" style={{ fontSize: 13, color: "rgba(55,53,47,0.45)" }}>
            Cliquez sur une étape pour la mettre à jour
          </div>
        )}
      </div>

      {cancelled ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 6,
            background: "#fbe4e4",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#a82c2c" }}>
            Cette commande a été annulée. Le client en a été informé par e-mail.
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              setConfirm({
                next: "PENDING",
                title: "Rétablir la commande",
                message: "La commande repassera en attente. Aucun e-mail n'est envoyé au client pour ce changement.",
              })
            }
            style={{
              padding: "7px 14px",
              borderRadius: 6,
              border: "1px solid rgba(168,44,44,0.25)",
              background: "transparent",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              color: "#a82c2c",
              cursor: pending ? "default" : "pointer",
            }}
          >
            Rétablir la commande
          </button>
        </div>
      ) : (
        <div className="admin-order-stepper" style={{ position: "relative", padding: "4px 0 2px" }}>
          <div
            style={{
              position: "absolute",
              top: CIRCLE / 2 + 4,
              left: `${trackInset}%`,
              right: `${trackInset}%`,
              height: 2,
              background: LINE,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: CIRCLE / 2 + 4,
              left: `${trackInset}%`,
              width: `calc((100% - ${trackInset * 2}%) * ${progress})`,
              height: 2,
              background: GREEN,
            }}
          />
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: `repeat(${ORDER_FLOW.length}, 1fr)`,
            }}
          >
            {ORDER_FLOW.map((step, index) => {
              const done = index < currentIndex;
              const current = index === currentIndex;
              const label = ORDER_STATUS_LABELS[step];

              return (
                <button
                  key={step}
                  type="button"
                  disabled={pending || current}
                  onClick={() =>
                    setConfirm({
                      next: step,
                      title: `Passer en « ${label} »`,
                      message:
                        step === "PENDING"
                          ? "La commande repassera en attente. Aucun e-mail n'est envoyé pour ce changement."
                          : `La commande passera au statut « ${label} » et le client en sera informé par e-mail.`,
                    })
                  }
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    fontFamily: "inherit",
                    cursor: pending || current ? "default" : "pointer",
                  }}
                >
                  <span
                    style={{
                      width: CIRCLE,
                      height: CIRCLE,
                      borderRadius: 999,
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: done ? GREEN : "#fff",
                      border: done || current ? `2px solid ${GREEN}` : `2px solid ${LINE}`,
                      color: "#fff",
                    }}
                  >
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12.5l5.5 5.5L20 6.5" />
                      </svg>
                    ) : current ? (
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: GREEN }} />
                    ) : null}
                  </span>
                  <span
                    className="admin-order-step-label"
                    style={{
                      fontSize: 13,
                      fontWeight: current ? 600 : 500,
                      color: current ? "#37352f" : "rgba(55,53,47,0.55)",
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </span>
                  {current && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: GREEN, marginTop: -4 }}>Étape actuelle</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="admin-order-stepper-footer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          paddingTop: 14,
          borderTop: "1px solid rgba(55,53,47,0.09)",
        }}
      >
        <span style={{ fontSize: 13, color: "rgba(55,53,47,0.5)" }}>
          Un e-mail de notification est envoyé au client à chaque changement.
        </span>
        {!cancelled && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              setConfirm({
                next: "CANCELLED",
                title: "Annuler la commande",
                message: "Annuler cette commande ? Le client sera prévenu par e-mail.",
                danger: true,
              })
            }
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              color: "#a82c2c",
              cursor: pending ? "default" : "pointer",
            }}
          >
            ✕ Annuler la commande
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title}
        message={confirm?.message ?? ""}
        confirmLabel={confirm?.danger ? "Annuler la commande" : "Mettre à jour"}
        cancelLabel="Fermer"
        danger={confirm?.danger}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && run(confirm.next)}
      />
    </div>
  );
}
