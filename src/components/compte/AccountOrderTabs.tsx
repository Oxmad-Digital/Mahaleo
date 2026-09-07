import Link from "next/link";
import { ACCOUNT_STATUS_FILTERS } from "@/lib/account/orders";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/client";

export function AccountOrderTabs({
  active,
  counts,
  total,
}: {
  active?: OrderStatus;
  counts: Record<(typeof ACCOUNT_STATUS_FILTERS)[number], number>;
  total: number;
}) {
  const tabs: { key?: OrderStatus; label: string; count: number }[] = [
    { key: undefined, label: "Toutes", count: total },
    ...ACCOUNT_STATUS_FILTERS.map((s) => ({ key: s as OrderStatus, label: ORDER_STATUS_LABELS[s], count: counts[s] })),
  ];

  return (
    <div
      className="admin-order-tabs"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
        padding: 3,
        borderRadius: 8,
        background: "#f7f7f5",
        border: "1px solid rgba(55,53,47,0.09)",
        width: "fit-content",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.label}
            href={tab.key ? `/compte/commandes?status=${tab.key}` : "/compte/commandes"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              background: isActive ? "#ffffff" : "transparent",
              border: isActive ? "1px solid rgba(55,53,47,0.09)" : "1px solid transparent",
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#37352f" : "rgba(55,53,47,0.6)",
            }}
          >
            {tab.label}
            <span style={{ fontSize: 12, fontWeight: 500, color: isActive ? "rgba(55,53,47,0.45)" : "rgba(55,53,47,0.35)" }}>
              {tab.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
