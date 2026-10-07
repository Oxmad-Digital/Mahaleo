import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StoreShell } from "@/components/store/StoreChrome";
import { formatCentsExact } from "@/lib/format";
import { orderReference } from "@/lib/order-status";
import { isStripeConfigured } from "@/lib/stripe";
import { openExtraPaymentCheckout } from "@/lib/extra-payment-checkout";
import { MINUTE, clientIp, rateLimit } from "@/lib/rate-limit";
import { SUPPORT_EMAIL } from "@/lib/emails/constants";

export const metadata: Metadata = { title: "Régler un complément", robots: { index: false } };

/**
 * Lien envoyé au client pour régler un complément : il ouvre une session Stripe
 * valable au moment du clic, quel que soit le délai depuis l'envoi de l'e-mail.
 */
export default async function ExtraPaymentPage(props: PageProps<"/paiement/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const payment = await prisma.extraPayment.findUnique({
    where: { id },
    include: { order: { select: { id: true, customerEmail: true } } },
  });
  if (!payment) notFound();

  const reference = orderReference(payment.order.id);
  const amount = formatCentsExact(payment.amountCents, payment.currency);

  if (payment.status !== "PENDING") {
    return (
      <Receipt
        eyebrow={`COMMANDE ${reference}`}
        title={payment.status === "PAID" ? "DÉJÀ RÉGLÉ" : "LIEN ANNULÉ"}
        text={
          payment.status === "PAID"
            ? `Le complément de ${amount} (${payment.label}) a bien été réglé. Merci !`
            : `Ce complément n'est plus à régler. Pour toute question, écrivez-nous à ${SUPPORT_EMAIL}.`
        }
      />
    );
  }

  if (searchParams.annule === "1") {
    return (
      <Receipt
        eyebrow={`COMMANDE ${reference}`}
        title="PAIEMENT INTERROMPU"
        text={`Le complément de ${amount} (${payment.label}) reste à régler.`}
        action={{ href: `/paiement/${payment.id}`, label: "Reprendre le paiement" }}
      />
    );
  }

  let checkoutUrl: string | null = null;
  let failure = false;
  if (isStripeConfigured() && (await rateLimit(`extra-payment:ip:${await clientIp()}`, 20, 10 * MINUTE))) {
    try {
      checkoutUrl = await openExtraPaymentCheckout(payment);
    } catch (error) {
      console.error("[extra-payment] Ouverture du paiement impossible:", error);
      failure = true;
    }
    if (checkoutUrl) redirect(checkoutUrl);
    if (!failure) {
      return (
        <Receipt
          eyebrow={`COMMANDE ${reference}`}
          title="PAIEMENT EN COURS"
          text="Votre paiement vient d'être transmis et est en cours de confirmation. Vous recevrez un e-mail dès qu'il sera validé."
        />
      );
    }
  }

  return (
    <Receipt
      eyebrow={`COMMANDE ${reference}`}
      title="INDISPONIBLE"
      text={`Le paiement ne peut pas être ouvert pour le moment. Réessayez dans quelques minutes ou écrivez-nous à ${SUPPORT_EMAIL}.`}
      action={{ href: `/paiement/${payment.id}`, label: "Réessayer" }}
    />
  );
}

function Receipt({ eyebrow, title, text, action }: {
  eyebrow: string;
  title: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <StoreShell className="retro-receipt-page">
      <main className="retro-receipt">
        <span className="retro-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        {action ? (
          <Link href={action.href} className="retro-primary"><span>{action.label.toUpperCase()}</span><span>↗</span></Link>
        ) : (
          <Link href="/" className="retro-primary"><span>RETOUR À LA BOUTIQUE</span><span>↗</span></Link>
        )}
      </main>
    </StoreShell>
  );
}
