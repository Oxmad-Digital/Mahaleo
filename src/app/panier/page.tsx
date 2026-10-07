"use client";

import Image from "next/image";
import Link from "next/link";
import { StoreShell } from "@/components/store/StoreChrome";
import { formatCents } from "@/lib/format";
import { lineMaxQty, useCart } from "@/lib/cart";
import { isOptimizableImage } from "@/lib/images";
import { FREE_SHIPPING_THRESHOLD_CENTS, shippingCostCents } from "@/lib/shipping";
import { useCartRefresh } from "@/lib/use-cart-refresh";

export default function PanierPage() {
  const { items, itemCount, subtotalCents, hydrated, updateQty, removeItem } = useCart();
  const { notices } = useCartRefresh();
  const currency = items[0]?.currency ?? "EUR";
  const shippingCents = items.length ? shippingCostCents(subtotalCents) : 0;
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
          <>
          {notices.length > 0 && (
            <ul className="retro-cart-notices" role="status">
              {notices.map((notice) => <li key={notice}>{notice}</li>)}
            </ul>
          )}
          <div className="retro-cart-layout">
            <section className="retro-cart-list" aria-label="Articles du panier">
              <div className="retro-cart-columns"><span>PRODUIT</span><span>QUANTITÉ</span><span>PRIX</span><span /></div>
              {items.map((item, index) => (
                <article className="retro-cart-item" key={`${item.productId}-${item.size ?? ""}`}>
                  <span className="retro-cart-index">{String(index + 1).padStart(2, "0")}</span>
                  <Link href={`/produit/${item.slug}`} className="retro-cart-image"><Image src={item.image} alt={item.name} width={112} height={112} sizes="112px" unoptimized={!isOptimizableImage(item.image)} /></Link>
                  <div className="retro-cart-product">
                    <Link href={`/produit/${item.slug}`}>{item.name}</Link>
                    <p>{item.size ? `Taille ${item.size}` : "Taille unique"}</p>
                  </div>
                  <div className="retro-quantity">
                    <button type="button" onClick={() => updateQty(item.productId, item.size, -1)} aria-label={`Diminuer la quantité de ${item.name}`}>−</button>
                    <span>{String(item.qty).padStart(2, "0")}</span>
                    <button type="button" onClick={() => updateQty(item.productId, item.size, 1)} disabled={item.qty >= lineMaxQty(item)} aria-label={`Augmenter la quantité de ${item.name}`}>+</button>
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
              <p>
                {shippingCents
                  ? `Livraison offerte dès ${formatCents(FREE_SHIPPING_THRESHOLD_CENTS, currency)} d'achat.`
                  : "Prix et disponibilité seront vérifiés avant le paiement."}
              </p>
            </aside>
          </div>
          </>
        )}
      </main>
    </StoreShell>
  );
}
