import type { ReactNode } from "react";
import Link from "next/link";
import { formatCents, formatDateTime } from "@/lib/format";
import { orderReference } from "@/lib/order-status";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { AccountOrdersData } from "@/lib/account/orders";
import type { OrderStatus } from "@/generated/prisma/client";

const GRID_COLUMNS = "minmax(72px, 0.7fr) minmax(70px, 0.6fr) minmax(84px, 1fr) minmax(96px, 1fr) minmax(70px, 0.7fr)";
const BORDER = "1px solid rgba(55,53,47,0.09)";
const MUTED = "rgba(55,53,47,0.45)";

function buildHref(params: { status?: OrderStatus; page: number }) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return `/compte/commandes${qs ? `?${qs}` : ""}`;
}

export function AccountOrdersTable({
  data,
  status,
  title = "Mes commandes",
}: {
  data: AccountOrdersData;
  status?: OrderStatus;
  title?: string;
}) {
  const { orders, page, pageCount, total } = data;

  return (
    <div
      style={{
        padding: "22px 24px 18px",
        borderRadius: 8,
        border: BORDER,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(55,53,47,0.5)" }}>
          {total} commande{total > 1 ? "s" : ""}
        </div>
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
          color: MUTED,
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
        <EmptyOrders filtered={Boolean(status)} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
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

      {pageCount > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            rowGap: 8,
            paddingTop: 12,
            borderTop: BORDER,
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(55,53,47,0.5)" }}>
            Page {page} / {pageCount}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <PageLink disabled={page <= 1} href={buildHref({ status, page: page - 1 })}>
              Précédent
            </PageLink>
            <PageLink disabled={page >= pageCount} href={buildHref({ status, page: page + 1 })}>
              Suivant
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyOrders({ filtered }: { filtered: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, padding: "24px 0" }}>
      <p style={{ fontSize: 14, color: "rgba(55,53,47,0.55)", margin: 0 }}>
        {filtered ? "Aucune commande avec ce statut pour le moment." : "Vous n'avez pas encore passé de commande."}
      </p>
      {!filtered && (
        <Link
          href="/"
          style={{
            padding: "9px 16px",
            borderRadius: 6,
            background: "#37352f",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Découvrir la boutique
        </Link>
      )}
    </div>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: ReactNode }) {
  const style = {
    padding: "6px 14px",
    borderRadius: 6,
    border: BORDER,
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
