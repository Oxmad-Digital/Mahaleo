import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getOrderById } from "@/lib/admin/orders";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";
import { formatCents, formatDateTime } from "@/lib/format";

export default async function AdminOrderDetailPage(props: PageProps<"/admin/commandes/[id]">) {
  const session = await requireAdmin();
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const reference = `#${order.id.slice(-5).toUpperCase()}`;

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
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>Commande {reference}</div>

      <div
        style={{
          padding: "20px 24px",
          borderRadius: 8,
          border: "1px solid rgba(55,53,47,0.09)",
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        <InfoField label="Client" value={order.user.name ?? order.user.email} />
        <InfoField label="Statut">
          <StatusBadge status={order.status} />
        </InfoField>
        <InfoField label="Date" value={formatDateTime(order.createdAt)} />
        <InfoField label="Total" value={formatCents(order.totalCents, order.currency)} />
      </div>

      <div
        style={{
          padding: "20px 24px",
          borderRadius: 8,
          border: "1px solid rgba(55,53,47,0.09)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600 }}>Articles</div>
        {order.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid rgba(55,53,47,0.06)",
              fontSize: 14,
            }}
          >
            <span>
              {item.product.name} <span style={{ color: "rgba(55,53,47,0.5)" }}>× {item.quantity}</span>
            </span>
            <span style={{ fontWeight: 600 }}>{formatCents(item.priceCents * item.quantity, order.currency)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Changer le statut</div>
        <p style={{ fontSize: 13, color: "rgba(55,53,47,0.6)", margin: 0 }}>
          Le client reçoit automatiquement un e-mail lors du passage à Payée, Expédiée, Livrée ou Annulée.
        </p>
        <OrderStatusActions id={order.id} status={order.status} />
      </div>
    </AdminShell>
  );
}

function InfoField({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(55,53,47,0.45)" }}>{label}</span>
      {children ?? <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>}
    </div>
  );
}
