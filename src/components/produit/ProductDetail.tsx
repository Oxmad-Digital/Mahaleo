"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreShell } from "@/components/store/StoreChrome";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";
import { addFavorite, removeFavorite } from "@/app/actions/favorites";
import type { ShopProductDetail } from "@/lib/shop";

const PLACEHOLDER_IMAGE = "/images/product-photo-sample.webp";

export function ProductDetail({
  product,
  isNewArrival,
  isAuthenticated,
  initialFavorite,
}: {
  product: NonNullable<ShopProductDetail>;
  isNewArrival: boolean;
  isAuthenticated: boolean;
  initialFavorite: boolean;
}) {
  const images = product.images.length ? product.images : [PLACEHOLDER_IMAGE];
  const [activeImage, setActiveImage] = useState(0);
  const availableSizes = product.sizes.filter((entry) => entry.stock > 0);
  const requiresSize = product.sizes.length > 0;
  const [size, setSize] = useState<string>();
  const [message, setMessage] = useState("");
  const [favorite, setFavorite] = useState(initialFavorite);
  const { addItem } = useCart();
  const { increment, decrement } = useFavorites();
  const router = useRouter();
  const soldOut = requiresSize && availableSizes.length === 0;

  function addToCart() {
    if (requiresSize && !size) {
      setMessage("Sélectionnez une taille pour continuer.");
      return;
    }
    if (soldOut) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0],
      priceCents: product.priceCents,
      currency: product.currency,
      size,
    });
    setMessage(`${product.name}${size ? ` · ${size}` : ""} ajouté au panier.`);
  }

  function toggleFavorite() {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    const next = !favorite;
    setFavorite(next);
    if (next) increment();
    else decrement();
    (next ? addFavorite(product.id) : removeFavorite(product.id)).then((result) => {
      if (result?.error) {
        setFavorite(!next);
        if (next) decrement();
        else increment();
        setMessage("Impossible de mettre à jour les favoris.");
      }
    });
  }

  return (
    <StoreShell className="retro-detail-page">
      <main className="retro-detail-main">
        <div className="retro-detail-topline">
          <Link href="/">← Retour à la collection</Link>
          <span>LE VESTIAIRE DU GROUPE · PIÈCE {String(product.id).slice(-2).toUpperCase()}</span>
        </div>

        <div className="retro-detail-layout">
          <section className="retro-gallery" aria-label={`Photos de ${product.name}`}>
            {images.length > 1 && (
              <div className="retro-thumbs">
                {images.map((image, index) => (
                  <button key={`${image}-${index}`} type="button" className={activeImage === index ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={`Afficher la vue ${index + 1}`} aria-pressed={activeImage === index}>
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
            <div className="retro-detail-photo">
              <img src={images[activeImage]} alt={product.name} />
              {isNewArrival && <span>NOUVELLE ARRIVÉE</span>}
            </div>
          </section>

          <section className="retro-product-panel">
            <span className="retro-eyebrow">MAHALEO · COLLECTION OFFICIELLE</span>
            <h1>{product.name}</h1>
            <p className="retro-detail-price">{formatCents(product.priceCents, product.currency)}</p>
            {product.description && <p className="retro-detail-description">{product.description}</p>}

            {product.color && (
              <div className="retro-detail-color">
                <span>COULEUR</span><i style={{ background: product.color }} aria-hidden="true" /><strong>{product.color}</strong>
              </div>
            )}

            {requiresSize && (
              <fieldset className="retro-size-fieldset">
                <legend>CHOISISSEZ VOTRE TAILLE</legend>
                <div>
                  {product.sizes.map((entry) => (
                    <button key={entry.id} type="button" disabled={entry.stock === 0} className={size === entry.size ? "active" : ""} aria-pressed={size === entry.size} onClick={() => { setSize(entry.size); setMessage(`Taille ${entry.size} sélectionnée.`); }}>
                      {entry.size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <p className="retro-product-status" aria-live="polite">{message}</p>
            <div className="retro-detail-actions">
              <button type="button" className="retro-primary" disabled={soldOut} onClick={addToCart}>
                <span>{soldOut ? "RUPTURE DE STOCK" : "AJOUTER AU PANIER"}</span><span>↗</span>
              </button>
              <button type="button" className={favorite ? "retro-favorite active" : "retro-favorite"} onClick={toggleFavorite} aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={favorite}>
                {favorite ? "♥" : "♡"}
              </button>
            </div>
            <div className="retro-product-notes">
              <p><strong>LIVRAISON</strong><span>Calculée selon votre destination lors de la commande.</span></p>
              <p><strong>RETOURS</strong><span>Consultez les conditions de vente avant votre achat.</span></p>
            </div>
          </section>
        </div>
      </main>
    </StoreShell>
  );
}
