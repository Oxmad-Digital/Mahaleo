import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getDashboardData, isDashboardRange, type DashboardRange } from "@/lib/admin/dashboard";
import { formatCents, formatNumber, formatPercent } from "@/lib/format";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { RangeSwitcher } from "@/components/admin/RangeSwitcher";
import { SalesChart } from "@/components/admin/SalesChart";
import { TopProductsCard } from "@/components/admin/TopProductsCard";
import { LatestOrdersCard } from "@/components/admin/LatestOrdersCard";
import { StockAlertsCard } from "@/components/admin/StockAlertsCard";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminDashboardPage(props: PageProps<"/admin">) {
  const session = await requireAdmin();
  const searchParams = await props.searchParams;
  const parsedRange = Number(searchParams.range);
  const range: DashboardRange = isDashboardRange(parsedRange) ? parsedRange : 30;

  const data = await getDashboardData(range);

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <AdminShell breadcrumb={[{ label: "Tableau de bord" }]} active="dashboard" userName={session.user.name} userEmail={session.user.email ?? ""}>
      <div className="retro-admin-page-heading">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="retro-admin-kicker">Vue d’ensemble · boutique officielle</span>
          <div className="admin-page-title">Tableau de bord</div>
          <div className="retro-admin-date">
            {today} — activité des {range} derniers jours
          </div>
        </div>
        <RangeSwitcher active={range} />
      </div>

      <div className="retro-admin-stats">
        <StatCard
          label="Chiffre d'affaires"
          value={formatCents(data.periodRevenueCents, data.currency)}
          delta={
            data.revenueDeltaPercent === null
              ? null
              : { text: formatPercent(data.revenueDeltaPercent, { signed: true }), positive: data.revenueDeltaPercent >= 0 }
          }
          hint="vs période précédente"
        />
        <StatCard
          label="Commandes"
          value={formatNumber(data.ordersInPeriod)}
          hint={`${formatNumber(data.ordersToday)} aujourd'hui`}
        />
        <StatCard
          label="Panier moyen"
          value={formatCents(data.avgBasketCents, data.currency)}
          hint={`${data.avgItemsPerOrder.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} articles par commande`}
        />
        <StatCard
          label="Nouveaux clients"
          value={formatNumber(data.newCustomersCount)}
          hint={`${formatPercent(data.newCustomersShare)} des commandes`}
          tint
        />
        <StatCard
          label="Articles en rupture"
          value={formatNumber(data.outOfStockCount)}
          hint={`sur ${formatNumber(data.productCount)} références`}
          tint
        />
      </div>

      <div className="admin-dashboard-split retro-admin-dashboard-split">
        <div className="retro-admin-card retro-admin-sales-card">
          <div className="retro-admin-card-heading">
            <div className="retro-admin-card-title">Ventes</div>
            <div className="retro-admin-card-note">
              {range} jours · {formatCents(data.periodRevenueCents, data.currency)} encaissés
            </div>
          </div>
          <SalesChart series={data.dailySeries} />
        </div>

        <TopProductsCard products={data.topProducts} currency={data.currency} />
      </div>

      <div className="admin-dashboard-split retro-admin-dashboard-split">
        <LatestOrdersCard orders={data.latestOrders} />
        <StockAlertsCard products={data.lowStockProducts} />
      </div>
    </AdminShell>
  );
}
