"use client";

import Link from "next/link";
import { StoreShell } from "@/components/store/StoreChrome";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";

const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
const SHIPPING_COST_CENTS = 800;

export default function PanierPage() {
  const { items, itemCount, subtotalCents, hydrated, updateQty, removeItem } = useCart();
  const currency = items[0]?.currency ?? "EUR";
  const shippingCents = items.length && subtotalCents < FREE_SHIPPING_THRESHOLD_CENTS ? SHIPPING_COST_CENTS : 0;
  const totalCents = subtotalCents + shippingCents;

  return (
    <StoreShell className="retro-cart-page">
      <main className="retro-cart-main">
        <div className="retro-cart-title">
          <div><span>VOTRE SÉLECTION</span><h1>LE PANIER <sup>{String(itemCount).padStart(2, "0")}</sup></h1></div>
          <Link href="/">← Continuer mes achats</Link>
        </div>

        {!hydrated ? (
          <p className="retro-cart-empty" role="status">Chargement de votre panier…</p>
        ) : items.length === 0 ? (
          <section className="retro-cart-empty">
            <span>LA COLLECTION VOUS ATTEND</span>
            <h2>VOTRE PANIER EST VIDE.</h2>
            <p>Choisissez une pièce du vestiaire Mahaleo pour commencer.</p>
            <Link href="/" className="retro-primary"><span>VOIR LA COLLECTION</span><span>↗</span></Link>
          </section>
        ) : (
          <div className="retro-cart-layout">
            <section className="retro-cart-list" aria-label="Articles du panier">
              <div className="retro-cart-columns"><span>PRODUIT</span><span>QUANTITÉ</span><span>PRIX</span><span /></div>
              {items.map((item, index) => (
                <article className="retro-cart-item" key={`${item.productId}-${item.size ?? ""}`}>
                  <span className="retro-cart-index">{String(index + 1).padStart(2, "0")}</span>
                  <Link href={`/produit/${item.slug}`} className="retro-cart-image"><img src={item.image} alt={item.name} /></Link>
                  <div className="retro-cart-product">
                    <Link href={`/produit/${item.slug}`}>{item.name}</Link>
                    <p>{item.size ? `Taille ${item.size}` : "Taille unique"}</p>
                  </div>
                  <div className="retro-quantity">
                    <button type="button" onClick={() => updateQty(item.productId, item.size, -1)} aria-label={`Diminuer la quantité de ${item.name}`}>−</button>
                    <span>{String(item.qty).padStart(2, "0")}</span>
                    <button type="button" onClick={() => updateQty(item.productId, item.size, 1)} aria-label={`Augmenter la quantité de ${item.name}`}>+</button>
                  </div>
                  <strong className="retro-cart-price">{formatCents(item.priceCents * item.qty, item.currency)}</strong>
                  <button type="button" className="retro-remove" onClick={() => removeItem(item.productId, item.size)} aria-label={`Retirer ${item.name} du panier`}>RETIRER</button>
                </article>
              ))}
            </section>

            <aside className="retro-cart-summary">
              <span className="retro-eyebrow">RÉCAPITULATIF</span>
              <h2>VOTRE COMMANDE</h2>
              <dl>
                <div><dt>Sous-total ({itemCount})</dt><dd>{formatCents(subtotalCents, currency)}</dd></div>
                <div><dt>Livraison</dt><dd>{shippingCents ? formatCents(shippingCents, currency) : "Offerte"}</dd></div>
                <div className="retro-cart-total"><dt>TOTAL</dt><dd>{formatCents(totalCents, currency)}</dd></div>
              </dl>
              <Link href="/checkout" className="retro-primary"><span>PASSER LA COMMANDE</span><span>↗</span></Link>
              <p>Prix et disponibilité seront vérifiés avant le paiement.</p>
            </aside>
          </div>
        )}
      </main>
    </StoreShell>
  );
}
