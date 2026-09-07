import type { OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const STATUS_STYLE: Record<OrderStatus, { bg: string; ink: string }> = {
  PENDING: { bg: "#fbf3db", ink: "#8a6416" },
  PAID: { bg: "#dbeddb", ink: "#1c6b3a" },
  PREPARING: { bg: "#e8e3f5", ink: "#5b4b8a" },
  SHIPPED: { bg: "#f1f1ef", ink: "rgba(55,53,47,0.65)" },
  DELIVERED: { bg: "#dbeddb", ink: "#1c6b3a" },
  CANCELLED: { bg: "#fbe4e4", ink: "#a82c2c" },
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
        whiteSpace: "nowrap",
      }}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
