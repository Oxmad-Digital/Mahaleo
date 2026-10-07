import { notFound } from "next/navigation";
import { requireUser } from "@/lib/account/require-user";
import { getAccountOrderById } from "@/lib/account/orders";
import { InvoiceSheet } from "@/components/invoice/InvoiceSheet";

export default async function AccountOrderCreditNotePage(props: PageProps<"/compte/commandes/[id]/avoir">) {
  const session = await requireUser();
  const { id } = await props.params;

  const order = await getAccountOrderById(session.user.id, id);
  if (!order?.invoice || !order.creditNote) notFound();

  return (
    <InvoiceSheet
      order={{ ...order, invoice: order.invoice }}
      backHref={`/compte/commandes/${order.id}`}
      backLabel="Retour à la commande"
      variant="credit-note"
    />
  );
}
