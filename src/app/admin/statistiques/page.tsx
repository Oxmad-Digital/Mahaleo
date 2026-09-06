import { requireAdmin } from "@/lib/admin/require-admin";
import { getAnalyticsData, isDashboardRange, type DashboardRange } from "@/lib/admin/analytics";
import { formatNumber, formatDuration } from "@/lib/format";
import { countryLabel } from "@/lib/country-label";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { RangeSwitcher } from "@/components/admin/RangeSwitcher";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { BarList, BarListCard } from "@/components/admin/BarListCard";
import { WorldMapCard } from "@/components/admin/WorldMapCard";

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Ordinateur",
  mobile: "Mobile",
  tablet: "Tablette",
  console: "Console",
  smarttv: "TV connectée",
  wearable: "Montre connectée",
  embedded: "Autre",
  bot: "Robot",
};

export default async function AdminStatsPage(props: PageProps<"/admin/statistiques">) {
  const session = await requireAdmin();
  const searchParams = await props.searchParams;
  const parsedRange = Number(searchParams.range);
  const range: DashboardRange = isDashboardRange(parsedRange) ? parsedRange : 30;

  const data = await getAnalyticsData(range);
  const avgPerDay = range > 0 ? Math.round(data.totalViews / range) : 0;

  return (
    <AdminShell
      breadcrumb={[{ label: "Statistiques" }]}
      active="statistiques"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Statistiques
          </div>
          <div style={{ fontSize: 15, fontWeight: 400, color: "rgba(55,53,47,0.6)" }}>
            Fréquentation du site sur les {range} derniers jours
          </div>
        </div>
        <RangeSwitcher active={range} basePath="/admin/statistiques" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <StatCard label={`Vues (${range} j)`} value={formatNumber(data.totalViews)} />
        <StatCard label="Visiteurs uniques" value={formatNumber(data.totalVisitors)} />
        <StatCard label="Moyenne / jour" value={formatNumber(avgPerDay)} />
        <StatCard label="Durée moyenne / session" value={formatDuration(data.avgDurationMs)} tint />
      </div>

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
        <div style={{ fontSize: 17, fontWeight: 600 }}>Trafic quotidien</div>
        <TrafficChart daily={data.daily} />
      </div>

      <div className="admin-stats-topgrid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, alignItems: "stretch" }}>
        <BarListCard title="Pages les plus vues" items={data.topPages.map((p) => ({ label: p.path, value: p.views }))} />
        <BarListCard
          title="Provenance"
          items={[
            { label: "Direct", value: data.directViews },
            ...data.topReferrers.map((r) => ({ label: r.referrer, value: r.views })),
          ]}
        />
        <BarListCard
          title="Appareils"
          items={data.deviceTypes.map((d) => ({ label: DEVICE_LABELS[d.deviceType] ?? d.deviceType, value: d.views }))}
        />
      </div>

      <div
        style={{
          padding: "22px 24px 20px",
          borderRadius: 8,
          border: "1px solid rgba(55,53,47,0.09)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600 }}>Origine géographique</div>
        <div
          className="admin-stats-geo-grid"
          style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)", gap: 24, alignItems: "center" }}
        >
          <BarList items={data.topCountries.slice(0, 10).map((c) => ({ label: countryLabel(c.country), value: c.views }))} />
          <WorldMapCard countries={data.topCountries} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          rowGap: 8,
          gap: 28,
          paddingTop: 8,
          borderTop: "1px solid rgba(55,53,47,0.09)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>Mentions légales</span>
        <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>Conditions de ventes</span>
        <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>Réalisé par Oxmad Digital</span>
      </div>
    </AdminShell>
  );
}
