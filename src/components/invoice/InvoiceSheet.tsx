import Image from "next/image";
import Link from "next/link";
import { PrintButton } from "@/components/admin/PrintButton";
import { formatCents, formatCentsExact, formatDate } from "@/lib/format";
import { countryLabel } from "@/lib/country-label";
import { orderReference } from "@/lib/order-status";
import { itemsSubtotalCents } from "@/lib/admin/orders";
import { SITE_NAME, SUPPORT_EMAIL, APP_URL } from "@/lib/emails/constants";
import { SELLER } from "@/lib/seller";
import logo from "../../assets/mahaleo/logo-mahaleo.png";
import styles from "./InvoiceSheet.module.css";

export type InvoiceSheetOrder = {
  id: string;
  createdAt: Date;
  currency: string;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  phone: string | null;
  shippingAddress: string;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCountry: string;
  items: { id: string; size?: string | null; quantity: number; priceCents: number; product: { name: string } }[];
  extraPayments: { id: string; label: string; amountCents: number; currency: string; status: string; paidAt: Date | null }[];
  invoice: { number: string; issuedAt: Date };
  creditNote?: { number: string; issuedAt: Date; amountCents: number } | null;
};

/**
 * Facture imprimable, partagée par l'espace admin et l'espace client : c'est le
 * même document, seul le lien de retour change. En variante « avoir », il
 * reprend les lignes de la facture qu'il annule.
 */
export function InvoiceSheet({
  order,
  backHref,
  backLabel,
  variant = "invoice",
}: {
  order: InvoiceSheetOrder;
  backHref: string;
  backLabel: string;
  variant?: "invoice" | "credit-note";
}) {
  const subtotalCents = itemsSubtotalCents(order.items);
  const shippingCents = order.totalCents - subtotalCents;
  const paidExtras = order.extraPayments.filter((payment) => payment.status === "PAID");
  const creditNote = variant === "credit-note" ? order.creditNote : null;
  const documentLabel = creditNote ? "Avoir" : "Facture";
  const documentNumber = creditNote ? creditNote.number : order.invoice.number;
  const stamp = creditNote ? "Remboursée" : order.creditNote ? "Annulée" : "Payée";

  return (
    <div className={styles.page}>
      <div className={styles.edition} aria-hidden="true">
        <span>ANTSIRABE · MADAGASCAR</span>
        <span>DOCUMENT OFFICIEL</span>
        <span>DEPUIS 1972</span>
      </div>

      <div className={styles.toolbar}>
        <Link href={backHref} className={styles.backLink}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {backLabel}
        </Link>
        <span className={styles.toolbarTitle}>{documentLabel} {documentNumber}</span>
        <PrintButton className={styles.printButton} />
      </div>

      <main className={styles.viewport}>
        <article className={styles.sheet}>
          <header className={styles.documentHeader}>
            <div className={styles.brand}>
              <Image src={logo} alt={SITE_NAME} priority sizes="210px" />
              <p>La musique en héritage · Boutique officielle</p>
            </div>

            <div className={styles.invoiceIdentity}>
              <span>{documentLabel}</span>
              <h1>{documentNumber}</h1>
              <p>Émis{creditNote ? "" : "e"} le {formatDate(creditNote ? creditNote.issuedAt : order.invoice.issuedAt)}</p>
              {creditNote && <p>Annule la facture {order.invoice.number}</p>}
              {!creditNote && order.creditNote && <p>Annulée par l&apos;avoir {order.creditNote.number}</p>}
            </div>
          </header>

          <div className={styles.metaGrid}>
            <section className={styles.metaBlock}>
              <span className={styles.eyebrow}>Facturé à</span>
              <strong>{order.customerName}</strong>
              <address>
                {order.shippingAddress}
                <br />
                {order.shippingPostalCode} {order.shippingCity}
                <br />
                {countryLabel(order.shippingCountry)}
              </address>
              <p>
                {order.customerEmail}
                {order.phone ? <><br />{order.phone}</> : null}
              </p>
            </section>

            <section className={`${styles.metaBlock} ${styles.orderMeta}`}>
              <span className={styles.eyebrow}>Référence commande</span>
              <strong>{orderReference(order.id)}</strong>
              <p>Passée le {formatDate(order.createdAt)}</p>
              <span className={styles.paidStamp}>{stamp}</span>
            </section>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th>Prix unit.</th>
                  <th>Qté</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <span className={styles.itemIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{item.product.name}</strong>
                      {item.size ? <small className={styles.itemSize}>Taille {item.size}</small> : null}
                    </td>
                    <td>{formatCents(item.priceCents, order.currency)}</td>
                    <td>× {item.quantity}</td>
                    <td>{formatCents(item.priceCents * item.quantity, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.summaryArea}>
            <p className={styles.summaryNote}>Merci de faire vivre la musique et l’histoire de Mahaleo.</p>
            <div className={styles.summary}>
              <TotalRow label="Sous-total" value={formatCents(subtotalCents, order.currency)} />
              {shippingCents !== 0 && (
                <TotalRow
                  label="Livraison"
                  value={shippingCents > 0 ? formatCents(shippingCents, order.currency) : "Offerte"}
                />
              )}
              <div className={styles.grandTotal}>
                <span>Total TTC</span>
                <strong>{formatCents(order.totalCents, order.currency)}</strong>
              </div>
              {creditNote && (
                <div className={styles.grandTotal}>
                  <span>Montant remboursé</span>
                  <strong>− {formatCents(creditNote.amountCents, order.currency)}</strong>
                </div>
              )}
            </div>
          </div>

          {paidExtras.length > 0 && (
            <section className={styles.extras}>
              <span className={styles.eyebrow}>Compléments réglés</span>
              {paidExtras.map((payment) => (
                <div key={payment.id}>
                  <span>
                    {payment.label}
                    {payment.paidAt ? <small> · {formatDate(payment.paidAt)}</small> : null}
                  </span>
                  <strong>{formatCentsExact(payment.amountCents, payment.currency)}</strong>
                </div>
              ))}
            </section>
          )}

          <footer className={styles.documentFooter}>
            <div className={styles.seller}>
              <span className={styles.eyebrow}>Vendeur</span>
              <p>
                <strong>{SELLER.name}</strong>
                {SELLER.addressLines.map((line) => <span key={line}><br />{line}</span>)}
                <br />
                {SELLER.email}
                {SELLER.legalIds.map((id) => <span key={id}><br />{id}</span>)}
              </p>
              <p>
                {creditNote
                  ? "Montants exprimés en euros, toutes taxes comprises. Remboursement effectué sur le moyen de paiement utilisé via Stripe."
                  : "Montants exprimés en euros, toutes taxes comprises. Facture payée par carte bancaire via Stripe."}
              </p>
            </div>
            <div>
              <span>{APP_URL.replace(/^https?:\/\//, "")}</span>
              <span>{SUPPORT_EMAIL}</span>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.totalRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
