import type { ReactNode } from "react";
import Link from "next/link";
import { formatCents, formatDate } from "@/lib/format";
import { orderReference } from "@/lib/order-status";
import type { AccountInvoicesData } from "@/lib/account/orders";

const GRID_COLUMNS = "minmax(110px, 1fr) minmax(90px, 0.7fr) minmax(96px, 0.9fr) minmax(88px, 0.7fr)";
const BORDER = "1px solid rgba(55,53,47,0.09)";

function buildHref(page: number) {
  return page > 1 ? `/compte/factures?page=${page}` : "/compte/factures";
}

export function AccountInvoicesTable({ data }: { data: AccountInvoicesData }) {
  const { invoices, page, pageCount, total } = data;

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
        <div style={{ fontSize: 17, fontWeight: 600 }}>Mes factures</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(55,53,47,0.5)" }}>
          {total} facture{total > 1 ? "s" : ""}
        </div>
      </div>

      <div
        className="admin-invoices-header"
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
        <span>Facture</span>
        <span>Commande</span>
        <span>Émise le</span>
        <span style={{ textAlign: "right" }}>Montant</span>
      </div>

      {invoices.length === 0 ? (
        <p style={{ fontSize: 14, color: "rgba(55,53,47,0.55)", margin: 0, padding: "24px 0" }}>
          {"Aucune facture pour le moment. Une facture est émise dès qu'une commande est payée."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {invoices.map((invoice, i) => (
            <Link
              key={invoice.id}
              href={`/compte/commandes/${invoice.order.id}/facture?from=factures`}
              className="admin-invoices-row"
              style={{
                display: "grid",
                gridTemplateColumns: GRID_COLUMNS,
                gap: 16,
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i === invoices.length - 1 ? "none" : "1px solid rgba(55,53,47,0.06)",
                color: "inherit",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>{invoice.number}</span>
              <span
                className="admin-invoices-order"
                data-label="Commande"
                style={{ fontSize: 13, color: "rgba(55,53,47,0.55)" }}
              >
                {orderReference(invoice.order.id)}
              </span>
              <span style={{ fontSize: 13, color: "rgba(55,53,47,0.5)" }}>{formatDate(invoice.issuedAt)}</span>
              <span className="admin-invoices-amount" style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>
                {formatCents(invoice.order.totalCents, invoice.order.currency)}
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
            <PageLink disabled={page <= 1} href={buildHref(page - 1)}>
              Précédent
            </PageLink>
            <PageLink disabled={page >= pageCount} href={buildHref(page + 1)}>
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
