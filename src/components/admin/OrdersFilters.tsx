import Link from "next/link";
import { ORDER_STATUS_FILTERS } from "@/lib/admin/orders";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/client";

function buildHref(params: { status?: OrderStatus; q?: string }) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  const qs = search.toString();
  return `/admin/commandes${qs ? `?${qs}` : ""}`;
}

export function OrderStatusTabs({
  active,
  query,
  counts,
  total,
}: {
  active?: OrderStatus;
  query?: string;
  counts: Record<OrderStatus, number>;
  total: number;
}) {
  const tabs: { key?: OrderStatus; label: string; count: number }[] = [
    { key: undefined, label: "Toutes", count: total },
    ...ORDER_STATUS_FILTERS.map((s) => ({ key: s, label: ORDER_STATUS_LABELS[s], count: counts[s] })),
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
            href={buildHref({ status: tab.key, q: query })}
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

export function OrderSearchForm({ query, status }: { query?: string; status?: OrderStatus }) {
  return (
    <form action="/admin/commandes" method="get" className="admin-order-search-form" style={{ display: "flex" }}>
      {status && <input type="hidden" name="status" value={status} />}
      <input
        type="text"
        name="q"
        defaultValue={query}
        placeholder="Rechercher une commande, un client…"
        className="admin-order-search-input"
        style={{
          width: 260,
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid rgba(55,53,47,0.15)",
          fontSize: 14,
          color: "#37352f",
          outline: "none",
        }}
      />
    </form>
  );
}
