import { prisma } from "@/lib/prisma";
import { VISIBLE_TO_CUSTOMER } from "@/lib/abandoned-orders";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

const ACCOUNT_ORDERS_PAGE_SIZE = 10;
const ACCOUNT_INVOICES_PAGE_SIZE = 10;

/**
 * Statuts proposés au client. `PENDING` est volontairement absent des onglets :
 * seul un paiement différé en cours (SEPA) reste visible dans « Toutes », un
 * paiement abandonné n'est jamais montré.
 */
export const ACCOUNT_STATUS_FILTERS = ["PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

/** Commandes encore en cours de traitement, mises en avant sur le tableau de bord. */
const ACCOUNT_ACTIVE_STATUSES: OrderStatus[] = ["PENDING", "PAID", "PREPARING", "SHIPPED"];

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

  const where: Prisma.OrderWhereInput = { userId, ...VISIBLE_TO_CUSTOMER, ...(status ? { status } : {}) };

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
    prisma.order.groupBy({ by: ["status"], where: { userId, ...VISIBLE_TO_CUSTOMER }, _count: { _all: true } }),
    prisma.order.count({ where: { userId, ...VISIBLE_TO_CUSTOMER } }),
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
    where: { id, userId, ...VISIBLE_TO_CUSTOMER },
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
      servicePointName: true,
      servicePointAddress: true,
      stripePaymentIntentId: true,
      items: {
        select: {
          id: true,
          size: true,
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
      creditNote: { select: { number: true, issuedAt: true, amountCents: true } },
      refundedAt: true,
      extraPayments: { orderBy: { createdAt: "desc" } },
    },
  });
}


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
  const [orderCount, activeCount, spend, invoiceCount, latestOrders, lastOrder] = await Promise.all([
    prisma.order.count({ where: { userId, ...VISIBLE_TO_CUSTOMER } }),
    prisma.order.count({ where: { userId, ...VISIBLE_TO_CUSTOMER, status: { in: ACCOUNT_ACTIVE_STATUSES } } }),
    prisma.order.aggregate({
      where: { userId, status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] } },
      _sum: { totalCents: true },
    }),
    prisma.invoice.count({ where: { order: { userId } } }),
    prisma.order.findMany({
      where: { userId, ...VISIBLE_TO_CUSTOMER },
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
    invoiceCount,
    latestOrders,
    lastAddress: lastOrder,
  };
}

export type AccountOverview = Awaited<ReturnType<typeof getAccountOverview>>;
