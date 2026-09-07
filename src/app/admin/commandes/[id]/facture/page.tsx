import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getOrderById, itemsSubtotalCents } from "@/lib/admin/orders";
import { PrintButton } from "@/components/admin/PrintButton";
import { formatCents, formatCentsExact, formatDate } from "@/lib/format";
import { countryLabel } from "@/lib/country-label";
import { orderReference } from "@/lib/order-status";
import { SITE_NAME, SUPPORT_EMAIL, APP_URL } from "@/lib/emails/constants";

const INK = "#37352f";
const MUTED = "rgba(55,53,47,0.5)";
const BORDER = "1px solid rgba(55,53,47,0.09)";

export default async function AdminOrderInvoicePage(props: PageProps<"/admin/commandes/[id]/facture">) {
  await requireAdmin();
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();
  if (!order.invoice) notFound();

  const subtotalCents = itemsSubtotalCents(order.items);
  const shippingCents = order.totalCents - subtotalCents;

  return (
    <div style={{ minHeight: "100dvh", background: "#f7f7f5", fontFamily: "var(--font-family)", color: INK }}>
      {/* Barre d'outils : à l'écran seulement, elle disparaît à l'impression. */}
      <div
        className="invoice-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "12px 24px",
          background: "#fff",
          borderBottom: BORDER,
        }}
      >
        <Link
          href={`/admin/commandes/${order.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500, color: MUTED }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          Retour à la commande
        </Link>
        <PrintButton />
      </div>

      <div className="invoice-sheet" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 64px" }}>
        <div style={{ background: "#fff", border: BORDER, borderRadius: 8, padding: "44px 48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{SITE_NAME}</div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.6 }}>
                {APP_URL.replace(/^https?:\/\//, "")}
                <br />
                {SUPPORT_EMAIL}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Facture
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{order.invoice.number}</div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 6, lineHeight: 1.6 }}>
                Émise le {formatDate(order.invoice.issuedAt)}
                <br />
                Commande {orderReference(order.id)} du {formatDate(order.createdAt)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 36, paddingTop: 24, borderTop: BORDER }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, marginBottom: 8 }}>Facturé à</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customerName}</div>
            <div style={{ fontSize: 13, color: "rgba(55,53,47,0.7)", marginTop: 4, lineHeight: 1.6 }}>
              {order.shippingAddress}
              <br />
              {order.shippingPostalCode} {order.shippingCity}, {countryLabel(order.shippingCountry)}
              <br />
              {order.customerEmail}
              {order.phone ? ` · ${order.phone}` : ""}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 12, fontWeight: 500, color: MUTED, paddingBottom: 10, borderBottom: BORDER }}>
                  Désignation
                </th>
                <th style={{ textAlign: "right", fontSize: 12, fontWeight: 500, color: MUTED, paddingBottom: 10, borderBottom: BORDER, width: 100 }}>
                  Prix unit.
                </th>
                <th style={{ textAlign: "right", fontSize: 12, fontWeight: 500, color: MUTED, paddingBottom: 10, borderBottom: BORDER, width: 60 }}>
                  Qté
                </th>
                <th style={{ textAlign: "right", fontSize: 12, fontWeight: 500, color: MUTED, paddingBottom: 10, borderBottom: BORDER, width: 110 }}>
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontSize: 14, padding: "12px 0", borderBottom: BORDER }}>{item.product.name}</td>
                  <td style={{ fontSize: 14, padding: "12px 0", borderBottom: BORDER, textAlign: "right" }}>
                    {formatCents(item.priceCents, order.currency)}
                  </td>
                  <td style={{ fontSize: 14, padding: "12px 0", borderBottom: BORDER, textAlign: "right" }}>{item.quantity}</td>
                  <td style={{ fontSize: 14, fontWeight: 600, padding: "12px 0", borderBottom: BORDER, textAlign: "right" }}>
                    {formatCents(item.priceCents * item.quantity, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 8 }}>
              <TotalRow label="Sous-total" value={formatCents(subtotalCents, order.currency)} />
              {shippingCents !== 0 && (
                <TotalRow
                  label="Livraison"
                  value={shippingCents > 0 ? formatCents(shippingCents, order.currency) : "Offerte"}
                />
              )}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: BORDER }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Total TTC</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{formatCents(order.totalCents, order.currency)}</span>
              </div>
            </div>
          </div>

          {order.extraPayments.filter((payment) => payment.status === "PAID").length > 0 && (
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: BORDER }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, marginBottom: 10 }}>Compléments réglés</div>
              {order.extraPayments
                .filter((payment) => payment.status === "PAID")
                .map((payment) => (
                  <div key={payment.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0" }}>
                    <span>
                      {payment.label}
                      {payment.paidAt ? <span style={{ color: MUTED }}> · {formatDate(payment.paidAt)}</span> : null}
                    </span>
                    <span style={{ fontWeight: 600 }}>{formatCentsExact(payment.amountCents, payment.currency)}</span>
                  </div>
                ))}
            </div>
          )}

          <p style={{ fontSize: 12, color: MUTED, marginTop: 36, lineHeight: 1.6 }}>
            Montants exprimés en euros, toutes taxes comprises. Facture émise par {SITE_NAME} et payée par carte
            bancaire via Stripe. Pour toute question relative à cette facture, écrivez-nous à {SUPPORT_EMAIL}.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          .invoice-toolbar { display: none !important; }
          .invoice-sheet { max-width: none; padding: 0; }
          .invoice-sheet > div { border: none !important; border-radius: 0 !important; padding: 0 !important; }
          @page { margin: 18mm; }
        }
      `}</style>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "rgba(55,53,47,0.65)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
