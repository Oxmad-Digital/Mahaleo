import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StoreShell } from "@/components/store/StoreChrome";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";
import { RefreshWhilePending } from "@/components/checkout/RefreshWhilePending";
import { countryLabel } from "@/lib/country-label";
import { formatCents, formatCentsExact } from "@/lib/format";
import { orderReference } from "@/lib/order-status";
import { itemsSubtotalCents } from "@/lib/admin/orders";

export const metadata: Metadata = { title: "Confirmation de commande", robots: { index: false } };

export default async function CommandeConfirmationPage(props: PageProps<"/commande/confirmation">) {
  const searchParams = await props.searchParams;
  const orderId = typeof searchParams.order === "string" ? searchParams.order : "";
  const stripeSessionId = typeof searchParams.session_id === "string" ? searchParams.session_id : "";

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { select: { name: true } } } },
          extraPayments: { select: { label: true, amountCents: true, currency: true, status: true, stripeSessionId: true } },
        },
      })
    : null;

  if (!order) notFound();

  // La page affiche l'adresse de livraison : l'identifiant de commande seul ne
  // suffit pas. Stripe renvoie l'identifiant de la session payée (commande ou
  // complément) ; à défaut, le client connecté propriétaire de la commande.
  const extraPayment =
    stripeSessionId !== "" ? order.extraPayments.find((payment) => payment.stripeSessionId === stripeSessionId) : undefined;
  const paidThisOrder = stripeSessionId !== "" && (order.stripeSessionId === stripeSessionId || extraPayment !== undefined);
  if (!paidThisOrder) {
    const session = await getSession();
    if (!order.userId || session?.user?.id !== order.userId) notFound();
  }

  const reference = orderReference(order.id);

  // Retour du paiement d'un complément : seul ce paiement est concerné.
  if (extraPayment) {
    const confirmed = extraPayment.status === "PAID";
    return (
      <StoreShell className="retro-receipt-page">
        {!confirmed && <RefreshWhilePending />}
        <main className="retro-receipt">
          <span className="retro-eyebrow">COMMANDE {reference}</span>
          <h1>MERCI !</h1>
          <p>
            {confirmed
              ? `Votre complément de ${formatCentsExact(extraPayment.amountCents, extraPayment.currency)} (${extraPayment.label}) a bien été réglé.`
              : "Votre paiement est en cours de confirmation. Cette page se met à jour automatiquement."}
          </p>
          <Link href="/" className="retro-primary"><span>RETOUR À LA BOUTIQUE</span><span>↗</span></Link>
        </main>
      </StoreShell>
    );
  }

  const isPaid = order.status !== "PENDING";
  const subtotalCents = itemsSubtotalCents(order.items);
  const shippingCents = order.totalCents - subtotalCents;

  return (
    <StoreShell className="retro-receipt-page">
      <ClearCartOnMount />
      {!isPaid && <RefreshWhilePending />}
      <main className="retro-receipt">
        <span className="retro-eyebrow">COMMANDE {reference} · {isPaid ? "PAIEMENT CONFIRMÉ" : "CONFIRMATION EN COURS"}</span>
        <h1>MERCI POUR VOTRE COMMANDE !</h1>
        <p>
          {isPaid
            ? `Un e-mail de confirmation vient de vous être envoyé à ${order.customerEmail}.`
            : "Votre paiement est en cours de confirmation. Cette page se met à jour automatiquement."}
        </p>

        <div className="retro-receipt-lines">
          {order.items.map((item) => (
            <div key={item.id}>
              <span>{item.product.name}{item.size ? ` · ${item.size}` : ""} × {item.quantity}</span>
              <strong>{formatCents(item.priceCents * item.quantity, order.currency)}</strong>
            </div>
          ))}
          <div>
            <span>Livraison</span>
            <strong>{shippingCents > 0 ? formatCents(shippingCents, order.currency) : "Offerte"}</strong>
          </div>
          <div className="retro-cart-total">
            <span>TOTAL</span>
            <strong>{formatCents(order.totalCents, order.currency)}</strong>
          </div>
        </div>

        <p className="retro-receipt-address">
          Livraison à {order.customerName}, {order.shippingAddress}, {order.shippingPostalCode} {order.shippingCity},{" "}
          {countryLabel(order.shippingCountry)}
        </p>

        <Link href="/" className="retro-primary"><span>CONTINUER MES ACHATS</span><span>↗</span></Link>
      </main>
    </StoreShell>
  );
}
