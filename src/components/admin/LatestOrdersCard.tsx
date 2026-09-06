import { formatCents, formatDateTime } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import type { DashboardData } from "@/lib/admin/dashboard";

const GRID_COLUMNS = "minmax(64px, 0.7fr) minmax(0, 1.6fr) minmax(84px, 1fr) minmax(88px, 1fr) minmax(58px, 0.7fr)";

export function LatestOrdersCard({ orders }: { orders: DashboardData["latestOrders"] }) {
  return (
    <div
      style={{
        padding: "22px 24px 12px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600 }}>Dernières commandes</div>

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
          borderBottom: "1px solid rgba(55,53,47,0.09)",
        }}
      >
        <span>Commande</span>
        <span>Client</span>
        <span>Statut</span>
        <span>Date</span>
        <span style={{ textAlign: "right" }}>Montant</span>
      </div>

      {orders.length === 0 ? (
        <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "16px 0" }}>Aucune commande pour le moment.</div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {orders.map((order, i) => (
            <div
              key={order.id}
              className="admin-orders-row"
              style={{
                display: "grid",
                gridTemplateColumns: GRID_COLUMNS,
                gap: 16,
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i === orders.length - 1 ? "none" : "1px solid rgba(55,53,47,0.06)",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(55,53,47,0.6)" }}>#{order.id.slice(-5).toUpperCase()}</span>
              <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {order.customerName || order.customerEmail}
              </span>
              <StatusBadge status={order.status} />
              <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.5)" }}>{formatDateTime(order.createdAt)}</span>
              <span className="admin-orders-amount" style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>{formatCents(order.totalCents, order.currency)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
