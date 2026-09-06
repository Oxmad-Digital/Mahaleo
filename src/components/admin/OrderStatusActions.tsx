"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import type { OrderStatus } from "@/generated/prisma/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Marquer en attente",
  PAID: "Marquer payée",
  SHIPPED: "Marquer expédiée",
  DELIVERED: "Marquer livrée",
  CANCELLED: "Annuler",
};

const ORDER = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const buttonStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 6,
  border: "1px solid rgba(55,53,47,0.09)",
  background: "transparent",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

function ActionButton({ id, status }: { id: string; status: OrderStatus }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const tone = status === "CANCELLED" ? "danger" : undefined;
  const style: React.CSSProperties = {
    ...buttonStyle,
    color: tone === "danger" ? "#a82c2c" : "#37352f",
    borderColor: tone === "danger" ? "rgba(168,44,44,0.25)" : "rgba(55,53,47,0.09)",
  };

  const run = () => {
    startTransition(async () => {
      await updateOrderStatus(id, status);
      setConfirmOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        style={style}
        onClick={() => (status === "CANCELLED" ? setConfirmOpen(true) : run())}
      >
        {STATUS_LABEL[status]}
      </button>
      {status === "CANCELLED" && (
        <ConfirmDialog
          open={confirmOpen}
          title="Annuler la commande"
          message="Annuler cette commande ? Le client sera prévenu par e-mail."
          confirmLabel="Annuler la commande"
          danger
          pending={pending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={run}
        />
      )}
    </>
  );
}

export function OrderStatusActions({ id, status }: { id: string; status: OrderStatus }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {ORDER.filter((s) => s !== status).map((s) => (
        <ActionButton key={s} id={id} status={s} />
      ))}
    </div>
  );
}
