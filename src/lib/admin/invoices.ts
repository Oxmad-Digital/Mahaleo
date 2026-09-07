import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const INVOICES_PAGE_SIZE = 20;

export async function getInvoicesData({ query, page }: { query?: string; page: number }) {
  const pageSize = INVOICES_PAGE_SIZE;

  const where: Prisma.InvoiceWhereInput | undefined = query
    ? {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
          { orderId: { contains: query, mode: "insensitive" } },
          { order: { customerName: { contains: query, mode: "insensitive" } } },
          { order: { customerEmail: { contains: query, mode: "insensitive" } } },
        ],
      }
    : undefined;

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
        order: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            totalCents: true,
            currency: true,
          },
        },
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

export type InvoicesData = Awaited<ReturnType<typeof getInvoicesData>>;

function invoiceNumber(year: number, sequence: number) {
  return `FACT-${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Renvoie la facture de la commande, en la créant si besoin. Le numéro est
 * séquentiel par année : deux créations simultanées peuvent viser le même
 * numéro, la contrainte d'unicité les départage et on retente.
 */
export async function ensureInvoiceForOrder(orderId: string) {
  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return existing;

  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await prisma.invoice.findFirst({
      where: { year },
      orderBy: { sequence: "desc" },
      select: { sequence: true },
    });
    const sequence = (last?.sequence ?? 0) + 1;

    try {
      return await prisma.invoice.create({
        data: { orderId, year, sequence, number: invoiceNumber(year, sequence) },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        // Numéro (ou facture de commande) déjà pris entre-temps.
        const raced = await prisma.invoice.findUnique({ where: { orderId } });
        if (raced) return raced;
        continue;
      }
      throw error;
    }
  }

  throw new Error("Le numéro de facture n'a pas pu être attribué. Réessayez.");
}
