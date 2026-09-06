import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

export const ORDERS_PAGE_SIZE = 20;

export const ORDER_STATUS_FILTERS = ["PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUS_FILTERS as readonly string[]).includes(value);
}

export async function getOrdersData({
  status,
  query,
  page,
}: {
  status?: OrderStatus;
  query?: string;
  page: number;
}) {
  const pageSize = ORDERS_PAGE_SIZE;

  const queryWhere: Prisma.OrderWhereInput | undefined = query
    ? {
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          { customerName: { contains: query, mode: "insensitive" } },
          { customerEmail: { contains: query, mode: "insensitive" } },
        ],
      }
    : undefined;

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...queryWhere,
  };

  const [orders, total, statusCounts] = await Promise.all([
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
        customerName: true,
        customerEmail: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], where: queryWhere, _count: { _all: true } }),
  ]);

  const countsByStatus = Object.fromEntries(ORDER_STATUS_FILTERS.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const row of statusCounts) {
    countsByStatus[row.status] = row._count._all;
  }
  const totalCount = Object.values(countsByStatus).reduce((a, b) => a + b, 0);

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

export type OrdersData = Awaited<ReturnType<typeof getOrdersData>>;

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      customerName: true,
      customerEmail: true,
      shippingAddress: true,
      shippingCity: true,
      shippingPostalCode: true,
      shippingCountry: true,
      phone: true,
      stripePaymentIntentId: true,
      user: { select: { id: true, name: true, email: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          priceCents: true,
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
      },
      shipment: true,
      invoice: true,
      extraPayments: { orderBy: { createdAt: "desc" } },
    },
  });
}

/**
 * Sous-total des articles. Il peut différer du total de la commande, qui inclut
 * les frais de livraison calculés au moment du paiement.
 */
export function itemsSubtotalCents(items: { quantity: number; priceCents: number }[]) {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;
