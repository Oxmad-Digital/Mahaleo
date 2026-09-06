import { requireAdmin } from "@/lib/admin/require-admin";
import { getClientsData } from "@/lib/admin/clients";
import { AdminShell } from "@/components/admin/AdminShell";
import { ClientSearchForm } from "@/components/admin/ClientsFilters";
import { ClientsTable } from "@/components/admin/ClientsTable";

export default async function AdminClientsPage(props: PageProps<"/admin/clients">) {
  const session = await requireAdmin();
  const searchParams = await props.searchParams;

  const queryParam = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const query = queryParam.length > 0 ? queryParam : undefined;

  const pageParam = Number(searchParams.page);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const data = await getClientsData({ query, page });

  return (
    <AdminShell
      breadcrumb={[{ label: "Tableau de bord", href: "/admin" }, { label: "Clients" }]}
      active="clients"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div
        className="admin-page-header-row"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}
      >
        <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Clients
        </div>
        <ClientSearchForm query={query} />
      </div>

      <ClientsTable data={data} query={query} />
    </AdminShell>
  );
}
