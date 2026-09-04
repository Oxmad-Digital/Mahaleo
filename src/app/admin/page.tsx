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

export default async function AdminDashboardPage(props: PageProps<"/admin">) {
  const session = await requireAdmin();
  const searchParams = await props.searchParams;
  const parsedRange = Number(searchParams.range);
  const range: DashboardRange = isDashboardRange(parsedRange) ? parsedRange : 30;

  const data = await getDashboardData(range);

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <AdminShell breadcrumb="Tableau de bord" userName={session.user.name} userEmail={session.user.email ?? ""}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>Tableau de bord</div>
          <div style={{ fontSize: 15, fontWeight: 400, color: "rgba(55,53,47,0.6)", textTransform: "capitalize" }}>
            {today} — activité des {range} derniers jours
          </div>
        </div>
        <RangeSwitcher active={range} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: 12, alignItems: "stretch" }}>
        <div
          style={{
            padding: "22px 24px 18px",
            borderRadius: 8,
            border: "1px solid rgba(55,53,47,0.09)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Ventes</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(55,53,47,0.5)" }}>
              {range} jours · {formatCents(data.periodRevenueCents, data.currency)} encaissés
            </div>
          </div>
          <SalesChart series={data.dailySeries} />
        </div>

        <TopProductsCard products={data.topProducts} currency={data.currency} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: 12, alignItems: "stretch" }}>
        <LatestOrdersCard orders={data.latestOrders} />
        <StockAlertsCard products={data.lowStockProducts} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 28, paddingTop: 8, borderTop: "1px solid rgba(55,53,47,0.09)" }}>
        <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>Mentions légales</span>
        <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>Conditions de ventes</span>
        <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>Réalisé par Oxmad Digital</span>
      </div>
    </AdminShell>
  );
}
