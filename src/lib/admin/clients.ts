import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const CLIENTS_PAGE_SIZE = 20;

export async function getClientsData({ query, page }: { query?: string; page: number }) {
  const pageSize = CLIENTS_PAGE_SIZE;

  const where: Prisma.UserWhereInput = query
    ? {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const spendByUser = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((user) => user.id) }, status: { not: "CANCELLED" } },
    _sum: { totalCents: true },
  });
  const totalSpentByUserId = new Map(spendByUser.map((row) => [row.userId, row._sum.totalCents ?? 0]));

  const clients = users.map((user) => ({
    ...user,
    totalSpentCents: totalSpentByUserId.get(user.id) ?? 0,
  }));

  return {
    clients,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type ClientsData = Awaited<ReturnType<typeof getClientsData>>;

export async function getClientById(id: string) {
  const client = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  if (!client) return null;

  const spend = await prisma.order.aggregate({
    where: { userId: id, status: { not: "CANCELLED" } },
    _sum: { totalCents: true },
  });

  return { ...client, totalSpentCents: spend._sum.totalCents ?? 0 };
}

export type ClientDetail = NonNullable<Awaited<ReturnType<typeof getClientById>>>;
