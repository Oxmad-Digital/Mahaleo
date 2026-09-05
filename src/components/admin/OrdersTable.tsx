import type { ReactNode } from "react";
import Link from "next/link";
import { formatCents, formatDateTime } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import type { OrdersData } from "@/lib/admin/orders";
import type { OrderStatus } from "@/generated/prisma/client";

const GRID_COLUMNS = "minmax(64px, 0.6fr) minmax(0, 1.6fr) minmax(70px, 0.6fr) minmax(84px, 1fr) minmax(88px, 1fr) minmax(70px, 0.7fr)";

function buildHref(params: { status?: OrderStatus; q?: string; page: number }) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return `/admin/commandes${qs ? `?${qs}` : ""}`;
}

export function OrdersTable({ data, status, query }: { data: OrdersData; status?: OrderStatus; query?: string }) {
  const { orders, page, pageCount, total } = data;

  return (
    <div
      style={{
        padding: "22px 24px 18px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Résultats</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(55,53,47,0.5)" }}>
          {total} commande{total > 1 ? "s" : ""}
        </div>
      </div>

      <div
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
        <span>Articles</span>
        <span>Statut</span>
        <span>Date</span>
        <span style={{ textAlign: "right" }}>Montant</span>
      </div>

      {orders.length === 0 ? (
        <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "24px 0" }}>Aucune commande ne correspond à ces critères.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {orders.map((order, i) => (
            <Link
              key={order.id}
              href={`/admin/commandes/${order.id}`}
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
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(55,53,47,0.6)" }}>#{order.id.slice(-5).toUpperCase()}</span>
              <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {order.customerName || order.customerEmail}
              </span>
              <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.55)" }}>{order._count.items}</span>
              <StatusBadge status={order.status} />
              <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.5)" }}>{formatDateTime(order.createdAt)}</span>
              <span style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>{formatCents(order.totalCents, order.currency)}</span>
            </Link>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTop: "1px solid rgba(55,53,47,0.09)",
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(55,53,47,0.5)" }}>
            Page {page} / {pageCount}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <PageLink disabled={page <= 1} href={buildHref({ status, q: query, page: page - 1 })}>
              Précédent
            </PageLink>
            <PageLink disabled={page >= pageCount} href={buildHref({ status, q: query, page: page + 1 })}>
              Suivant
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: ReactNode }) {
  const style = {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid rgba(55,53,47,0.09)",
    fontSize: 13,
    fontWeight: 500,
    color: disabled ? "rgba(55,53,47,0.3)" : "#37352f",
  };
  if (disabled) return <span style={style}>{children}</span>;
  return (
    <Link href={href} style={style}>
      {children}
    </Link>
  );
}
