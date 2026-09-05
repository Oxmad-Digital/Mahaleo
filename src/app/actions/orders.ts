"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { OrderStatus } from "@/generated/prisma/client";
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "@/lib/emails/send";
import type { OrderEmailData } from "@/lib/emails/templates";

const EMAIL_SENDER_BY_STATUS: Partial<
  Record<OrderStatus, (to: string, name: string | null, order: OrderEmailData) => Promise<void>>
> = {
  PAID: sendOrderConfirmationEmail,
  SHIPPED: sendOrderShippedEmail,
  DELIVERED: sendOrderDeliveredEmail,
  CANCELLED: sendOrderCancelledEmail,
};

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      customerName: true,
      customerEmail: true,
      items: {
        select: { quantity: true, priceCents: true, product: { select: { name: true } } },
      },
    },
  });

  if (!order) redirect("/admin/commandes");

  if (order.status !== status) {
    await prisma.order.update({ where: { id }, data: { status } });

    const sender = EMAIL_SENDER_BY_STATUS[status];
    if (sender) {
      const emailData: OrderEmailData = {
        id: order.id,
        totalCents: order.totalCents,
        currency: order.currency,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      };
      await sender(order.customerEmail, order.customerName, emailData);
    }
  }

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${id}`);
  redirect(`/admin/commandes/${id}`);
}
