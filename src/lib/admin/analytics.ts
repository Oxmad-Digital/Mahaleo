import { prisma } from "@/lib/prisma";
import { DASHBOARD_RANGES, isDashboardRange, type DashboardRange } from "./dashboard";

export { DASHBOARD_RANGES, isDashboardRange };
export type { DashboardRange };

function dayString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number, from: Date) {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return dayString(d);
}

function rank<T extends string>(items: T[], limit?: number) {
  const counts = new Map<T, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries())
    .map(([value, views]) => ({ value, views }))
    .sort((a, b) => b.views - a.views);
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getAnalyticsData(range: DashboardRange) {
  const now = new Date();
  const startDay = daysAgo(range - 1, now);

  const views = await prisma.pageView.findMany({
    where: { day: { gte: startDay } },
    select: { day: true, path: true, referrer: true, deviceType: true, country: true, duration: true, visitorHash: true },
  });

  const totalViews = views.length;
  const totalVisitors = new Set(views.map((v) => v.visitorHash)).size;

  const viewsByDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (let i = 0; i < range; i++) {
    viewsByDay.set(daysAgo(range - 1 - i, now), { views: 0, visitors: new Set() });
  }
  for (const v of views) {
    const entry = viewsByDay.get(v.day);
    if (!entry) continue;
    entry.views += 1;
    entry.visitors.add(v.visitorHash);
  }
  const daily = Array.from(viewsByDay.entries()).map(([day, entry]) => ({
    day,
    views: entry.views,
    visitors: entry.visitors.size,
  }));

  const topPages = rank(views.map((v) => v.path), 10).map((r) => ({ path: r.value, views: r.views }));

  const referrers = views.map((v) => v.referrer).filter((r) => r !== "");
  const topReferrers = rank(referrers, 10).map((r) => ({ referrer: r.value, views: r.views }));
  const directViews = totalViews - referrers.length;

  const deviceTypes = rank(views.map((v) => v.deviceType)).map((r) => ({ deviceType: r.value, views: r.views }));

  const countries = views.map((v) => v.country).filter((c) => c !== "");
  const topCountries = rank(countries).map((r) => ({ country: r.value, views: r.views }));

  const durations = views.map((v) => v.duration).filter((d): d is number => typeof d === "number" && d > 0);
  const avgDurationMs = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : null;

  return {
    range,
    totalViews,
    totalVisitors,
    daily,
    topPages,
    topReferrers,
    directViews,
    deviceTypes,
    topCountries,
    avgDurationMs,
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;
