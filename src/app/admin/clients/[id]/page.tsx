import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getClientById } from "@/lib/admin/clients";
import { AdminShell } from "@/components/admin/AdminShell";
import { ClientForm } from "@/components/admin/ClientForm";
import { ClientStatusActions } from "@/components/admin/ClientStatusActions";
import { DeleteClientButton } from "@/components/admin/DeleteClientButton";
import { RoleBadge, StatusBadge } from "@/components/admin/ClientsTable";
import { updateClient } from "@/app/actions/clients";
import { formatCents, formatDate } from "@/lib/format";

export default async function AdminClientDetailPage(props: PageProps<"/admin/clients/[id]">) {
  const session = await requireAdmin();
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const client = await getClientById(id);
  if (!client) notFound();

  const errorParam = typeof searchParams.error === "string" ? searchParams.error : undefined;
  const saved = searchParams.saved === "1";

  const action = updateClient.bind(null, client.id);

  return (
    <AdminShell
      breadcrumb={[
        { label: "Tableau de bord", href: "/admin" },
        { label: "Clients", href: "/admin/clients" },
        { label: client.name ?? client.email },
      ]}
      active="clients"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>{client.name ?? client.email}</div>

      {errorParam && (
        <div style={{ padding: "12px 16px", borderRadius: 6, background: "#fbe4e4", color: "#a82c2c", fontSize: 14, fontWeight: 500 }}>
          {errorParam}
        </div>
      )}
      {saved && (
        <div style={{ padding: "12px 16px", borderRadius: 6, background: "#e3f0e8", color: "var(--brand-green, #1c6b3a)", fontSize: 14, fontWeight: 500 }}>
          Informations enregistrées.
        </div>
      )}

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
        <InfoField label="Rôle">
          <RoleBadge role={client.role} />
        </InfoField>
        <InfoField label="Statut">
          <StatusBadge status={client.status} />
        </InfoField>
        <InfoField label="Inscription" value={formatDate(client.createdAt)} />
        <InfoField label="Commandes" value={String(client._count.orders)} />
        <InfoField label="Total dépensé" value={formatCents(client.totalSpentCents)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Informations</div>
        <ClientForm action={action} initial={{ name: client.name ?? "", email: client.email }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Statut du compte</div>
        <ClientStatusActions id={client.id} status={client.status} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "20px 24px",
          borderRadius: 8,
          border: "1px solid rgba(168,44,44,0.2)",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "#a82c2c" }}>Zone de danger</div>
        <p style={{ fontSize: 13, color: "rgba(55,53,47,0.6)", margin: 0 }}>
          La suppression est définitive et impossible si ce client a des commandes existantes. Préférez suspendre ou bannir dans ce cas.
        </p>
        <div>
          <DeleteClientButton id={client.id} name={client.name ?? client.email} />
        </div>
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
