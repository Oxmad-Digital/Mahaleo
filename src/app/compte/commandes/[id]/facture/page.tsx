import { notFound } from "next/navigation";
import { requireUser } from "@/lib/account/require-user";
import { getAccountOrderById } from "@/lib/account/orders";
import { InvoiceSheet } from "@/components/invoice/InvoiceSheet";

export default async function AccountOrderInvoicePage(props: PageProps<"/compte/commandes/[id]/facture">) {
  const session = await requireUser();
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const order = await getAccountOrderById(session.user.id, id);
  if (!order) notFound();
  if (!order.invoice) notFound();

  const fromFactures = searchParams.from === "factures";

  return (
    <InvoiceSheet
      order={{ ...order, invoice: order.invoice }}
      backHref={fromFactures ? "/compte/factures" : `/compte/commandes/${order.id}`}
      backLabel={fromFactures ? "Retour aux factures" : "Retour à la commande"}
    />
  );
}
