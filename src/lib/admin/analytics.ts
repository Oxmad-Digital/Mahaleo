import { prisma } from "@/lib/prisma";
import { isDashboardRange, type DashboardRange } from "./dashboard";

export { isDashboardRange };
export type { DashboardRange };

function dayString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number, from: Date) {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return dayString(d);
}

export async function getAnalyticsData(range: DashboardRange) {
  const now = new Date();
  const startDay = daysAgo(range - 1, now);
  const where = { day: { gte: startDay } };

  // Agrégats calculés par Postgres : la table grossit à chaque page vue, la
  // charger en mémoire ne tiendrait pas sur 90 jours de trafic.
  const [[totals], dailyRows, pageRows, referrerRows, deviceRows, countryRows] = await Promise.all([
    prisma.$queryRaw<{ views: number; visitors: number; referred: number; avgDurationMs: number | null }[]>`
      SELECT
        COUNT(*)::int AS "views",
        COUNT(DISTINCT "visitorHash")::int AS "visitors",
        COUNT(*) FILTER (WHERE "referrer" <> '')::int AS "referred",
        (AVG("duration") FILTER (WHERE "duration" > 0))::float8 AS "avgDurationMs"
      FROM "PageView"
      WHERE "day" >= ${startDay}
    `,
    prisma.$queryRaw<{ day: string; views: number; visitors: number }[]>`
      SELECT "day", COUNT(*)::int AS "views", COUNT(DISTINCT "visitorHash")::int AS "visitors"
      FROM "PageView"
      WHERE "day" >= ${startDay}
      GROUP BY "day"
    `,
    prisma.pageView.groupBy({
      by: ["path"],
      where,
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: { ...where, referrer: { not: "" } },
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["deviceType"],
      where,
      _count: { _all: true },
      orderBy: { _count: { deviceType: "desc" } },
    }),
    prisma.pageView.groupBy({
      by: ["country"],
      where: { ...where, country: { not: "" } },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
    }),
  ]);

  const dailyByDay = new Map(dailyRows.map((row) => [row.day, row]));
  const daily = Array.from({ length: range }, (_, i) => {
    const day = daysAgo(range - 1 - i, now);
    const row = dailyByDay.get(day);
    return { day, views: row?.views ?? 0, visitors: row?.visitors ?? 0 };
  });

  return {
    range,
    totalViews: totals.views,
    totalVisitors: totals.visitors,
    daily,
    topPages: pageRows.map((r) => ({ path: r.path, views: r._count._all })),
    topReferrers: referrerRows.map((r) => ({ referrer: r.referrer, views: r._count._all })),
    directViews: totals.views - totals.referred,
    deviceTypes: deviceRows.map((r) => ({ deviceType: r.deviceType, views: r._count._all })),
    topCountries: countryRows.map((r) => ({ country: r.country, views: r._count._all })),
    avgDurationMs: totals.avgDurationMs,
  };
}
