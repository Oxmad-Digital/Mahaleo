import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_STYLE: Record<OrderStatus, { label: string; bg: string; ink: string }> = {
  PENDING: { label: "En attente", bg: "#fbf3db", ink: "#8a6416" },
  PAID: { label: "Payée", bg: "#dbeddb", ink: "#1c6b3a" },
  SHIPPED: { label: "Expédiée", bg: "#f1f1ef", ink: "rgba(55,53,47,0.65)" },
  DELIVERED: { label: "Livrée", bg: "#dbeddb", ink: "#1c6b3a" },
  CANCELLED: { label: "Annulée", bg: "#fbe4e4", ink: "#a82c2c" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span
      style={{
        justifySelf: "start",
        padding: "3px 9px",
        borderRadius: 4,
        background: style.bg,
        fontSize: 12,
        fontWeight: 500,
        color: style.ink,
      }}
    >
      {style.label}
    </span>
  );
}
