import Link from "next/link";
import { formatCents, formatDateTime } from "@/lib/format";
import { orderReference } from "@/lib/order-status";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AccountOverview } from "@/lib/account/orders";

const GRID_COLUMNS = "minmax(72px, 0.7fr) minmax(60px, 0.5fr) minmax(84px, 1fr) minmax(96px, 1fr) minmax(64px, 0.7fr)";
const BORDER = "1px solid rgba(55,53,47,0.09)";

export function AccountLatestOrders({ orders }: { orders: AccountOverview["latestOrders"] }) {
  return (
    <div
      style={{
        padding: "22px 24px 12px",
        borderRadius: 8,
        border: BORDER,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Dernières commandes</div>
        <Link href="/compte/commandes" style={{ fontSize: 13, fontWeight: 500, color: "rgba(55,53,47,0.5)" }}>
          Tout voir
        </Link>
      </div>

      <div
        className="admin-orders-header"
        style={{
          display: "grid",
          gridTemplateColumns: GRID_COLUMNS,
          gap: 16,
          alignItems: "center",
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(55,53,47,0.45)",
          paddingBottom: 10,
          borderBottom: BORDER,
        }}
      >
        <span>Commande</span>
        <span>Articles</span>
        <span>Statut</span>
        <span>Date</span>
        <span style={{ textAlign: "right" }}>Montant</span>
      </div>

      {orders.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, padding: "16px 0 20px" }}>
          <p style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", margin: 0 }}>
            {"Vous n'avez pas encore passé de commande."}
          </p>
          <Link
            href="/"
            style={{ padding: "9px 16px", borderRadius: 6, background: "#37352f", color: "#fff", fontSize: 14, fontWeight: 600 }}
          >
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {orders.map((order, i) => (
            <Link
              key={order.id}
              href={`/compte/commandes/${order.id}`}
              className="admin-orders-row"
              style={{
                display: "grid",
                gridTemplateColumns: GRID_COLUMNS,
                gap: 16,
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i === orders.length - 1 ? "none" : "1px solid rgba(55,53,47,0.06)",
                color: "inherit",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>{orderReference(order.id)}</span>
              <span className="admin-orders-items" data-label="Articles" style={{ fontSize: 13, color: "rgba(55,53,47,0.55)" }}>
                {order._count.items}
              </span>
              <StatusBadge status={order.status} />
              <span style={{ fontSize: 13, color: "rgba(55,53,47,0.5)" }}>{formatDateTime(order.createdAt)}</span>
              <span className="admin-orders-amount" style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>
                {formatCents(order.totalCents, order.currency)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
