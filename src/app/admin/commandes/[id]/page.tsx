import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getOrderById, itemsSubtotalCents } from "@/lib/admin/orders";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderStatusStepper } from "@/components/admin/OrderStatusStepper";
import { OrderCustomerCard } from "@/components/admin/OrderCustomerCard";
import { OrderShippingPanel } from "@/components/admin/OrderShippingPanel";
import { ExtraPaymentPanel } from "@/components/admin/ExtraPaymentPanel";
import { GenerateInvoiceButton } from "@/components/admin/GenerateInvoiceButton";
import { updateOrderCustomer } from "@/app/actions/orders";
import { isSendcloudConfigured } from "@/lib/sendcloud";
import { formatCents, formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { orderReference } from "@/lib/order-status";

const BORDER = "1px solid rgba(55,53,47,0.09)";
const MUTED = "rgba(55,53,47,0.45)";

export default async function AdminOrderDetailPage(props: PageProps<"/admin/commandes/[id]">) {
  const session = await requireAdmin();
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const reference = orderReference(order.id);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalCents = itemsSubtotalCents(order.items);
  const shippingCents = order.totalCents - subtotalCents;

  // Tous les paiements passent par Stripe : le moyen n'est confirmé qu'une fois
  // l'intention de paiement rattachée à la commande.
  const paymentLabel = order.stripePaymentIntentId ? "Carte bancaire" : "En attente de paiement";

  return (
    <AdminShell
      breadcrumb={[
        { label: "Tableau de bord", href: "/admin" },
        { label: "Commandes", href: "/admin/commandes" },
        { label: reference },
      ]}
      active="commandes"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div
        className="admin-order-header"
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/admin/commandes"
            style={{ padding: "7px 14px", borderRadius: 6, border: BORDER, fontSize: 13, fontWeight: 500, color: "#37352f" }}
          >
            ← Commandes
          </Link>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Commande {reference}
            </div>
            <div style={{ fontSize: 13, color: MUTED }}>{formatDateTime(order.createdAt)}</div>
          </div>
        </div>

        <div className="admin-order-pills" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Pill label="Paiement" value={paymentLabel} />
          <Pill label="Articles" value={formatNumber(itemCount)} />
          <Pill label="Total" value={formatCents(order.totalCents, order.currency)} strong />
        </div>
      </div>

      <div
        className="admin-order-layout"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", alignItems: "start", gap: 24 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <OrderStatusStepper id={order.id} status={order.status} />

          <OrderCustomerCard
            action={updateOrderCustomer.bind(null, order.id)}
            accountId={order.user?.id ?? null}
            customer={{
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              phone: order.phone,
              shippingAddress: order.shippingAddress,
              shippingPostalCode: order.shippingPostalCode,
              shippingCity: order.shippingCity,
              shippingCountry: order.shippingCountry,
            }}
          />

          <div style={{ padding: "22px 24px 18px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>ARTICLES COMMANDÉS</div>

            <div className="admin-order-items-scroll" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div
                className="admin-order-items-header"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 110px 70px 110px",
                  gap: 16,
                  paddingBottom: 10,
                  borderBottom: BORDER,
                  fontSize: 12,
                  fontWeight: 500,
                  color: MUTED,
                }}
              >
                <span>Produit</span>
                <span style={{ textAlign: "right" }}>Prix unit.</span>
                <span style={{ textAlign: "right" }}>Qté</span>
                <span style={{ textAlign: "right" }}>Sous-total</span>
              </div>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="admin-order-item-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) 110px 70px 110px",
                    gap: 16,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: BORDER,
                    fontSize: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        flex: "none",
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        background: "#f7f7f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {item.product.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          style={{ width: "84%", height: "84%", objectFit: "contain" }}
                        />
                      )}
                    </div>
                    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      <Link
                        href={`/admin/produits/${item.product.id}`}
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#37352f",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.product.name}
                      </Link>
                      <span style={{ fontSize: 12, color: MUTED }}>{item.product.slug}</span>
                    </div>
                  </div>
                  <span style={{ textAlign: "right" }}>{formatCents(item.priceCents, order.currency)}</span>
                  <span style={{ textAlign: "right", color: MUTED }}>× {item.quantity}</span>
                  <span style={{ textAlign: "right", fontWeight: 600 }}>
                    {formatCents(item.priceCents * item.quantity, order.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 8 }}>
                <SummaryRow label="Sous-total" value={formatCents(subtotalCents, order.currency)} />
                {shippingCents !== 0 && (
                  <SummaryRow
                    label="Livraison"
                    value={shippingCents > 0 ? formatCents(shippingCents, order.currency) : "Offerte"}
                  />
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: BORDER }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Total commande</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{formatCents(order.totalCents, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          <OrderShippingPanel
            key={order.shipment ? `${order.shipment.id}:${order.shipment.cancelledAt ? "cancelled" : "active"}` : "none"}
            orderId={order.id}
            shipment={order.shipment}
            configured={isSendcloudConfigured()}
            canShip={order.status !== "CANCELLED"}
          />
        </div>

        <div className="admin-order-sidebar" style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <div style={{ padding: "18px 20px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>RÉSUMÉ</div>
            <SidebarRow label="Statut">
              <StatusBadge status={order.status} />
            </SidebarRow>
            <SidebarRow label="Paiement">
              <span style={{ fontSize: 13, fontWeight: 600 }}>{paymentLabel}</span>
            </SidebarRow>
            <SidebarRow label="Articles">
              <span style={{ fontSize: 13, fontWeight: 600 }}>{formatNumber(itemCount)}</span>
            </SidebarRow>
            <SidebarRow label="Dernière mise à jour">
              <span style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(order.updatedAt)}</span>
            </SidebarRow>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: BORDER }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{formatCents(order.totalCents, order.currency)}</span>
            </div>
          </div>

          <div style={{ padding: "18px 20px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>FACTURE</div>
            {order.invoice ? (
              <>
                <SidebarRow label="Numéro">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{order.invoice.number}</span>
                </SidebarRow>
                <SidebarRow label="Émise le">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(order.invoice.issuedAt)}</span>
                </SidebarRow>
                <Link
                  href={`/admin/commandes/${order.id}/facture`}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 6,
                    background: "#37352f",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Voir la facture
                </Link>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "rgba(55,53,47,0.55)", margin: 0, lineHeight: 1.6 }}>
                  {order.status === "PENDING"
                    ? "La facture est émise automatiquement dès que le paiement est confirmé."
                    : "Aucune facture n'a encore été émise pour cette commande."}
                </p>
                <GenerateInvoiceButton orderId={order.id} disabled={order.status === "PENDING"} />
              </>
            )}
          </div>

          <ExtraPaymentPanel orderId={order.id} payments={order.extraPayments} />
        </div>
      </div>
    </AdminShell>
  );
}

function Pill({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        border: BORDER,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 90,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: strong ? 16 : 14, fontWeight: strong ? 700 : 600 }}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "rgba(55,53,47,0.65)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function SidebarRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontSize: 13, color: "rgba(55,53,47,0.55)" }}>{label}</span>
      {children}
    </div>
  );
}
