import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

export const ACCOUNT_ORDERS_PAGE_SIZE = 10;
export const ACCOUNT_INVOICES_PAGE_SIZE = 10;

/**
 * Statuts proposés au client. `PENDING` est volontairement absent des onglets :
 * une commande non payée n'a pas d'intérêt pour lui, mais elle reste visible
 * dans « Toutes ».
 */
export const ACCOUNT_STATUS_FILTERS = ["PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

/** Commandes encore en cours de traitement, mises en avant sur le tableau de bord. */
export const ACCOUNT_ACTIVE_STATUSES: OrderStatus[] = ["PENDING", "PAID", "PREPARING", "SHIPPED"];

export type AccountStatusFilter = (typeof ACCOUNT_STATUS_FILTERS)[number];

export function isAccountOrderStatus(value: string): value is AccountStatusFilter {
  return (ACCOUNT_STATUS_FILTERS as readonly string[]).includes(value);
}

export async function getAccountOrdersData({
  userId,
  status,
  page,
}: {
  userId: string;
  status?: OrderStatus;
  page: number;
}) {
  const pageSize = ACCOUNT_ORDERS_PAGE_SIZE;

  const where: Prisma.OrderWhereInput = { userId, ...(status ? { status } : {}) };

  const [orders, total, statusCounts, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        status: true,
        totalCents: true,
        currency: true,
        createdAt: true,
        _count: { select: { items: true } },
        invoice: { select: { number: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], where: { userId }, _count: { _all: true } }),
    prisma.order.count({ where: { userId } }),
  ]);

  const countsByStatus = Object.fromEntries(ACCOUNT_STATUS_FILTERS.map((s) => [s, 0])) as Record<
    AccountStatusFilter,
    number
  >;
  for (const row of statusCounts) {
    if (isAccountOrderStatus(row.status)) {
      countsByStatus[row.status] = row._count._all;
    }
  }

  return {
    orders,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    countsByStatus,
    totalCount,
  };
}

export type AccountOrdersData = Awaited<ReturnType<typeof getAccountOrdersData>>;

/**
 * Une commande du client. Le `userId` fait partie du filtre : une commande qui
 * ne lui appartient pas est introuvable, pas simplement masquée.
 */
export async function getAccountOrderById(userId: string, id: string) {
  return prisma.order.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      customerName: true,
      customerEmail: true,
      phone: true,
      shippingAddress: true,
      shippingCity: true,
      shippingPostalCode: true,
      shippingCountry: true,
      stripePaymentIntentId: true,
      items: {
        select: {
          id: true,
          quantity: true,
          priceCents: true,
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
      },
      shipment: {
        select: {
          carrier: true,
          methodName: true,
          trackingNumber: true,
          trackingUrl: true,
          statusMessage: true,
          cancelledAt: true,
        },
      },
      invoice: { select: { number: true, issuedAt: true } },
      extraPayments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type AccountOrderDetail = NonNullable<Awaited<ReturnType<typeof getAccountOrderById>>>;

export async function getAccountInvoicesData({ userId, page }: { userId: string; page: number }) {
  const pageSize = ACCOUNT_INVOICES_PAGE_SIZE;
  const where: Prisma.InvoiceWhereInput = { order: { userId } };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        number: true,
        issuedAt: true,
        order: { select: { id: true, totalCents: true, currency: true, createdAt: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type AccountInvoicesData = Awaited<ReturnType<typeof getAccountInvoicesData>>;

/** Chiffres et derniers éléments affichés sur le tableau de bord du client. */
export async function getAccountOverview(userId: string) {
  const [orderCount, activeCount, spend, favoriteCount, invoiceCount, latestOrders, lastOrder] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, status: { in: ACCOUNT_ACTIVE_STATUSES } } }),
    prisma.order.aggregate({
      where: { userId, status: { not: "CANCELLED" } },
      _sum: { totalCents: true },
    }),
    prisma.favorite.count({ where: { userId } }),
    prisma.invoice.count({ where: { order: { userId } } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        totalCents: true,
        currency: true,
        createdAt: true,
        _count: { select: { items: true } },
        invoice: { select: { number: true } },
      },
    }),
    prisma.order.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        customerName: true,
        phone: true,
        shippingAddress: true,
        shippingPostalCode: true,
        shippingCity: true,
        shippingCountry: true,
      },
    }),
  ]);

  return {
    orderCount,
    activeCount,
    totalSpentCents: spend._sum.totalCents ?? 0,
    favoriteCount,
    invoiceCount,
    latestOrders,
    lastAddress: lastOrder,
  };
}

export type AccountOverview = Awaited<ReturnType<typeof getAccountOverview>>;
