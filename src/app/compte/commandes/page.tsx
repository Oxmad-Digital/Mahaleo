import { requireUser } from "@/lib/account/require-user";
import { getAccountOrdersData, isAccountOrderStatus } from "@/lib/account/orders";
import { AccountShell } from "@/components/compte/AccountShell";
import { AccountOrderTabs } from "@/components/compte/AccountOrderTabs";
import { AccountOrdersTable } from "@/components/compte/AccountOrdersTable";

export default async function AccountOrdersPage(props: PageProps<"/compte/commandes">) {
  const session = await requireUser();
  const searchParams = await props.searchParams;

  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const status = statusParam && isAccountOrderStatus(statusParam) ? statusParam : undefined;

  const pageParam = Number(searchParams.page);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const data = await getAccountOrdersData({ userId: session.user.id, status, page });

  return (
    <AccountShell
      breadcrumb={[{ label: "Mon espace", href: "/compte" }, { label: "Commandes" }]}
      active="commandes"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div className="admin-page-header-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Mes commandes
        </div>
        <div style={{ fontSize: 15, color: "rgba(55,53,47,0.6)" }}>{"Suivez l'avancement et retrouvez vos factures."}</div>
      </div>

      <AccountOrderTabs active={status} counts={data.countsByStatus} total={data.totalCount} />

      <AccountOrdersTable data={data} status={status} title="Résultats" />
    </AccountShell>
  );
}
