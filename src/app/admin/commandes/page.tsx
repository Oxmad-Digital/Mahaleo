import { requireAdmin } from "@/lib/admin/require-admin";
import { getOrdersData, isOrderStatus } from "@/lib/admin/orders";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrderStatusTabs, OrderSearchForm } from "@/components/admin/OrdersFilters";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default async function AdminOrdersPage(props: PageProps<"/admin/commandes">) {
  const session = await requireAdmin();
  const searchParams = await props.searchParams;

  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const status = statusParam && isOrderStatus(statusParam) ? statusParam : undefined;

  const queryParam = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const query = queryParam.length > 0 ? queryParam : undefined;

  const pageParam = Number(searchParams.page);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const data = await getOrdersData({ status, query, page });

  return (
    <AdminShell
      breadcrumb={[{ label: "Tableau de bord", href: "/admin" }, { label: "Commandes" }]}
      active="commandes"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div
        className="admin-page-header-row"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}
      >
        <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Commandes
        </div>
        <OrderSearchForm query={query} status={status} />
      </div>

      <OrderStatusTabs active={status} query={query} counts={data.countsByStatus} total={data.totalCount} />

      <OrdersTable data={data} status={status} query={query} />
    </AdminShell>
  );
}
