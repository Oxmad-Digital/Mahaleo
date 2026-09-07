import { requireAdmin } from "@/lib/admin/require-admin";
import { getInvoicesData } from "@/lib/admin/invoices";
import { AdminShell } from "@/components/admin/AdminShell";
import { InvoiceSearchForm } from "@/components/admin/InvoicesFilters";
import { InvoicesTable } from "@/components/admin/InvoicesTable";

export default async function AdminInvoicesPage(props: PageProps<"/admin/factures">) {
  const session = await requireAdmin();
  const searchParams = await props.searchParams;

  const queryParam = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const query = queryParam.length > 0 ? queryParam : undefined;

  const pageParam = Number(searchParams.page);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const data = await getInvoicesData({ query, page });

  return (
    <AdminShell
      breadcrumb={[{ label: "Tableau de bord", href: "/admin" }, { label: "Factures" }]}
      active="factures"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div
        className="admin-page-header-row"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}
      >
        <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Factures
        </div>
        <InvoiceSearchForm query={query} />
      </div>

      <InvoicesTable data={data} query={query} />
    </AdminShell>
  );
}
