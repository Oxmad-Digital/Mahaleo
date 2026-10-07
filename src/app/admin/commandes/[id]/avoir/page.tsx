import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getOrderById } from "@/lib/admin/orders";
import { InvoiceSheet } from "@/components/invoice/InvoiceSheet";

export default async function AdminOrderCreditNotePage(props: PageProps<"/admin/commandes/[id]/avoir">) {
  await requireAdmin();
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order?.invoice || !order.creditNote) notFound();

  return (
    <InvoiceSheet
      order={{ ...order, invoice: order.invoice }}
      backHref={`/admin/commandes/${order.id}`}
      backLabel="Retour à la commande"
      variant="credit-note"
    />
  );
}
