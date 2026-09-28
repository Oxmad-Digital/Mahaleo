import Image from "next/image";
import Link from "next/link";
import { PrintButton } from "@/components/admin/PrintButton";
import { formatCents, formatCentsExact, formatDate } from "@/lib/format";
import { countryLabel } from "@/lib/country-label";
import { orderReference } from "@/lib/order-status";
import { itemsSubtotalCents } from "@/lib/admin/orders";
import { SITE_NAME, SUPPORT_EMAIL, APP_URL } from "@/lib/emails/constants";
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
  items: { id: string; quantity: number; priceCents: number; product: { name: string } }[];
  extraPayments: { id: string; label: string; amountCents: number; currency: string; status: string; paidAt: Date | null }[];
  invoice: { number: string; issuedAt: Date };
};

/**
 * Facture imprimable, partagée par l'espace admin et l'espace client : c'est le
 * même document, seul le lien de retour change.
 */
export function InvoiceSheet({
  order,
  backHref,
  backLabel,
}: {
  order: InvoiceSheetOrder;
  backHref: string;
  backLabel: string;
}) {
  const subtotalCents = itemsSubtotalCents(order.items);
  const shippingCents = order.totalCents - subtotalCents;
  const paidExtras = order.extraPayments.filter((payment) => payment.status === "PAID");

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
        <span className={styles.toolbarTitle}>Facture {order.invoice.number}</span>
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
              <span>Facture</span>
              <h1>{order.invoice.number}</h1>
              <p>Émise le {formatDate(order.invoice.issuedAt)}</p>
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
              <span className={styles.paidStamp}>Payée</span>
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
            <p>Montants exprimés en euros, toutes taxes comprises. Facture payée par carte bancaire via Stripe.</p>
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
