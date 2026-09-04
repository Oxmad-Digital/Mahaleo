import { prisma } from "@/lib/prisma";
import { formatDayLabel } from "@/lib/format";
import type { OrderStatus } from "@/generated/prisma/client";

export const DASHBOARD_RANGES = [7, 30, 90] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export function isDashboardRange(value: number): value is DashboardRange {
  return (DASHBOARD_RANGES as readonly number[]).includes(value);
}

const REVENUE_STATUSES: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];
const LOW_STOCK_THRESHOLD = 5;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(days: number, from: Date) {
  const d = startOfDay(from);
  d.setDate(d.getDate() - days);
  return d;
}

export async function getDashboardData(range: DashboardRange) {
  const now = new Date();
  const periodStart = daysAgo(range - 1, now);
  const previousStart = daysAgo(range * 2 - 1, now);
  const todayStart = startOfDay(now);

  const [periodOrders, previousRevenue, ordersToday, lowStockProducts, outOfStockCount, productCount, latestOrders, orderItems] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: periodStart } },
        select: {
          totalCents: true,
          currency: true,
          status: true,
          createdAt: true,
          user: { select: { createdAt: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: previousStart, lt: periodStart }, status: { in: REVENUE_STATUSES } },
        _sum: { totalCents: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.product.findMany({
        where: { stock: { lte: LOW_STOCK_THRESHOLD } },
        orderBy: { stock: "asc" },
        take: 4,
        select: { id: true, name: true, stock: true },
      }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          totalCents: true,
          currency: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: periodStart }, status: { in: REVENUE_STATUSES } } },
        select: { productId: true, quantity: true, priceCents: true },
      }),
    ]);

  const revenueOrders = periodOrders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const currency = revenueOrders[0]?.currency ?? "EUR";

  const periodRevenueCents = revenueOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const previousRevenueCents = previousRevenue._sum.totalCents ?? 0;
  const revenueDeltaPercent =
    previousRevenueCents > 0 ? ((periodRevenueCents - previousRevenueCents) / previousRevenueCents) * 100 : null;

  const avgBasketCents = revenueOrders.length > 0 ? Math.round(periodRevenueCents / revenueOrders.length) : 0;
  const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const avgItemsPerOrder = revenueOrders.length > 0 ? totalItemsSold / revenueOrders.length : 0;

  const newCustomerOrders = periodOrders.filter((o) => o.user.createdAt >= periodStart);
  const newCustomersShare = periodOrders.length > 0 ? (newCustomerOrders.length / periodOrders.length) * 100 : 0;
  const newCustomersCount = await prisma.user.count({
    where: { role: "USER", createdAt: { gte: periodStart } },
  });

  const salesByDay = new Map<string, number>();
  for (let i = 0; i < range; i++) {
    const d = daysAgo(range - 1 - i, now);
    salesByDay.set(d.toDateString(), 0);
  }
  for (const order of revenueOrders) {
    const key = startOfDay(order.createdAt).toDateString();
    salesByDay.set(key, (salesByDay.get(key) ?? 0) + order.totalCents);
  }
  const dailySeries = Array.from(salesByDay.entries()).map(([key, revenueCents]) => ({
    label: formatDayLabel(new Date(key)),
    revenueCents,
  }));

  const productSales = new Map<string, { quantity: number; revenueCents: number }>();
  for (const item of orderItems) {
    const entry = productSales.get(item.productId) ?? { quantity: 0, revenueCents: 0 };
    entry.quantity += item.quantity;
    entry.revenueCents += item.quantity * item.priceCents;
    productSales.set(item.productId, entry);
  }
  const topProductIds = Array.from(productSales.entries())
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5)
    .map(([productId]) => productId);
  const topProductRecords = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, images: true, stock: true },
  });
  const maxTopQuantity = Math.max(1, ...topProductIds.map((id) => productSales.get(id)!.quantity));
  const topProducts = topProductIds
    .map((id) => {
      const product = topProductRecords.find((p) => p.id === id);
      const sales = productSales.get(id)!;
      if (!product) return null;
      return {
        id,
        name: product.name,
        image: product.images[0] ?? null,
        stock: product.stock,
        quantity: sales.quantity,
        revenueCents: sales.revenueCents,
        barPercent: Math.round((sales.quantity / maxTopQuantity) * 100),
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return {
    range,
    currency,
    periodRevenueCents,
    revenueDeltaPercent,
    ordersInPeriod: revenueOrders.length,
    ordersToday,
    avgBasketCents,
    avgItemsPerOrder,
    newCustomersCount,
    newCustomersShare,
    outOfStockCount,
    productCount,
    lowStockProducts,
    latestOrders,
    dailySeries,
    topProducts,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
