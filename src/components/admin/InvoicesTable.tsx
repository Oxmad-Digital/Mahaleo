import type { ReactNode } from "react";
import Link from "next/link";
import { formatCents, formatDate } from "@/lib/format";
import { orderReference } from "@/lib/order-status";
import type { InvoicesData } from "@/lib/admin/invoices";

const GRID_COLUMNS = "minmax(90px, 0.7fr) minmax(0, 1.6fr) minmax(90px, 0.7fr) minmax(88px, 1fr) minmax(88px, 0.8fr)";

function buildHref(params: { q?: string; page: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return `/admin/factures${qs ? `?${qs}` : ""}`;
}

export function InvoicesTable({ data, query }: { data: InvoicesData; query?: string }) {
  const { invoices, page, pageCount, total } = data;

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
          {total} facture{total > 1 ? "s" : ""}
        </div>
      </div>

      {/* Du téléphone à la tablette le tableau ne rétrécit pas : il défile latéralement. */}
      <div className="admin-table-scroll">
        <div className="admin-table-scroll-inner">
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
            <span>Facture</span>
            <span>Client</span>
            <span>Commande</span>
            <span>Émise le</span>
            <span style={{ textAlign: "right" }}>Montant</span>
          </div>

          {invoices.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {invoices.map((invoice, i) => (
                <Link
                  key={invoice.id}
                  href={`/admin/commandes/${invoice.order.id}/facture?from=factures`}
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
                  <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {invoice.order.customerName || invoice.order.customerEmail}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.55)" }}>
                    {orderReference(invoice.order.id)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.5)", whiteSpace: "nowrap" }}>
                    {formatDate(invoice.issuedAt)}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatCents(invoice.order.totalCents, invoice.order.currency)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hors de la zone défilante : le message reste lisible sans défiler. */}
      {invoices.length === 0 && (
        <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "24px 0" }}>
          Aucune facture ne correspond à ces critères.
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
            borderTop: "1px solid rgba(55,53,47,0.09)",
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(55,53,47,0.5)" }}>
            Page {page} / {pageCount}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <PageLink disabled={page <= 1} href={buildHref({ q: query, page: page - 1 })}>
              Précédent
            </PageLink>
            <PageLink disabled={page >= pageCount} href={buildHref({ q: query, page: page + 1 })}>
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
