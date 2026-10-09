"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { StoreShell } from "@/components/store/StoreChrome";
import { formatCents } from "@/lib/format";
import { lineMaxQty, useCart } from "@/lib/cart";
import { isOptimizableImage } from "@/lib/images";
import { ORDERS_OPEN } from "@/lib/orders-open";
import { effectivePriceCents } from "@/lib/pricing";
import type { ShopProductDetail } from "@/lib/shop";

const PLACEHOLDER_IMAGE = "/images/product-photo-sample.webp";

export function ProductDetail({
  product,
  isNewArrival,
}: {
  product: NonNullable<ShopProductDetail>;
  isNewArrival: boolean;
}) {
  const images = product.images.length ? product.images : [PLACEHOLDER_IMAGE];
  const [activeImage, setActiveImage] = useState(0);
  const availableSizes = product.sizes.filter((entry) => entry.stock > 0);
  const requiresSize = product.sizes.length > 0;
  const [size, setSize] = useState<string>();
  const [message, setMessage] = useState("");
  const [sizeMissing, setSizeMissing] = useState(false);
  const sizeFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(addedTimer.current), []);
  const { items, addItem } = useCart();
  const soldOut = requiresSize && availableSizes.length === 0;
  const priceCents = effectivePriceCents(product);
  const discounted = priceCents !== product.priceCents;

  function showPreviousImage() {
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % images.length);
  }

  function addToCart() {
    if (requiresSize && !size) {
      setMessage("");
      setSizeMissing(true);
      sizeFieldsetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      sizeFieldsetRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    if (soldOut || !ORDERS_OPEN) return;
    const maxQty = product.sizes.find((entry) => entry.size === size)?.stock;
    const inCart = items.find((item) => item.productId === product.id && item.size === size)?.qty ?? 0;
    if (inCart >= lineMaxQty({ maxQty })) {
      setMessage(`Vous avez déjà le maximum disponible de cette taille dans votre panier (${inCart}).`);
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0],
      priceCents,
      currency: product.currency,
      size,
      maxQty,
    });
    setMessage("");
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <StoreShell className="retro-detail-page">
      <main className="retro-detail-main">
        <div className="retro-detail-topline">
          <Link href="/">← Retour à la collection</Link>
          <span>LE VESTIAIRE DU GROUPE · PIÈCE {String(product.id).slice(-2).toUpperCase()}</span>
        </div>

        <div className="retro-detail-layout">
          <section className={`retro-gallery${images.length > 1 ? " has-thumbnails" : ""}`} aria-label={`Photos de ${product.name}`}>
            {images.length > 1 && (
              <div className="retro-thumbs" aria-label="Choisir une photo" style={{ "--thumb-count": images.length } as CSSProperties}>
                {images.map((image, index) => (
                  <button key={`${image}-${index}`} type="button" className={activeImage === index ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={`Afficher la vue ${index + 1}`} aria-pressed={activeImage === index}>
                    <Image src={image} alt="" width={96} height={96} sizes="96px" unoptimized={!isOptimizableImage(image)} />
                  </button>
                ))}
              </div>
            )}
            <div className="retro-detail-photo">
              <Image
                src={images[activeImage]}
                alt={`${product.name} — vue ${activeImage + 1}`}
                fill
                preload
                sizes="(max-width: 900px) 100vw, 700px"
                unoptimized={!isOptimizableImage(images[activeImage])}
              />
              {isNewArrival && <span>NOUVELLE ARRIVÉE</span>}
              {images.length > 1 && (
                <>
                  <button type="button" className="retro-gallery-arrow is-previous" onClick={showPreviousImage} aria-label="Afficher la photo précédente">←</button>
                  <button type="button" className="retro-gallery-arrow is-next" onClick={showNextImage} aria-label="Afficher la photo suivante">→</button>
                  <span className="retro-gallery-count" aria-live="polite">{activeImage + 1} / {images.length}</span>
                </>
              )}
            </div>
          </section>

          <section className="retro-product-panel">
            <span className="retro-eyebrow">MAHALEO · {product.productType?.toUpperCase() ?? "COLLECTION OFFICIELLE"}</span>
            <h1>{product.name}</h1>
            <p className="retro-detail-price">
              {discounted && <s>{formatCents(product.priceCents, product.currency)}</s>}
              {formatCents(priceCents, product.currency)}
            </p>
            {product.description && <p className="retro-detail-description">{product.description}</p>}

            {(product.color || product.colorName || product.material || product.fit) && (
              <dl className="retro-detail-specs">
                {(product.color || product.colorName) && (
                  <div>
                    <dt>COULEUR</dt>
                    <dd>{product.color && <i style={{ background: product.color }} aria-hidden="true" />}{product.colorName ?? product.color}</dd>
                  </div>
                )}
                {product.material && <div><dt>MATIÈRE</dt><dd>{product.material}</dd></div>}
                {product.fit && <div><dt>COUPE</dt><dd>{product.fit}</dd></div>}
              </dl>
            )}

            {requiresSize && (
              <fieldset ref={sizeFieldsetRef} className={`retro-size-fieldset${sizeMissing ? " has-error" : ""}`} aria-describedby={sizeMissing ? "size-error" : undefined}>
                <legend>CHOISISSEZ VOTRE TAILLE</legend>
                <div>
                  {product.sizes.map((entry) => (
                    <button key={entry.id} type="button" disabled={entry.stock === 0} className={size === entry.size ? "active" : ""} aria-pressed={size === entry.size} onClick={() => { setSize(entry.size); setSizeMissing(false); setMessage(`Taille ${entry.size} sélectionnée.`); }}>
                      {entry.size}
                    </button>
                  ))}
                </div>
                {sizeMissing && <p id="size-error" className="retro-size-error" role="alert">Veuillez choisir une taille avant d&apos;ajouter au panier.</p>}
              </fieldset>
            )}

            <p className="retro-product-status" aria-live="polite">{message}</p>
            <div className="retro-detail-actions">
              <button type="button" className={`retro-primary${added ? " is-added" : ""}`} disabled={soldOut || !ORDERS_OPEN} onClick={addToCart} aria-live="polite">
                <span>{!ORDERS_OPEN ? "BIENTÔT DISPONIBLE" : soldOut ? "RUPTURE DE STOCK" : added ? "AJOUTÉ AU PANIER" : "AJOUTER AU PANIER"}</span><span aria-hidden="true">{added ? "✓" : "↗"}</span>
              </button>
            </div>
            <div className="retro-product-notes">
              {product.care && <p><strong>ENTRETIEN</strong><span>{product.care}</span></p>}
              <p><strong>LIVRAISON</strong><span>À domicile ou en point relais, France et Europe. Frais calculés selon le pays et le mode choisi.</span></p>
              <p><strong>RETOURS</strong><span>30 jours pour changer d&apos;avis. <Link href="/conditions-de-vente">Voir les conditions de vente</Link>.</span></p>
            </div>
          </section>
        </div>
      </main>
    </StoreShell>
  );
}
