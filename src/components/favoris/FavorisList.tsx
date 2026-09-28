"use client";

import Link from "next/link";
import { useState } from "react";
import { removeFavorite } from "@/app/actions/favorites";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";

export type FavoriteProduct = { productId: string; slug: string; name: string; image: string; priceCents: number; currency: string };

export function FavorisList({ initialItems }: { initialItems: FavoriteProduct[] }) {
  const [favorites, setFavorites] = useState(initialItems);
  const { addItem } = useCart();
  const { decrement } = useFavorites();

  function removeItem(productId: string) {
    setFavorites((current) => current.filter((favorite) => favorite.productId !== productId));
    decrement();
    removeFavorite(productId);
  }

  if (!favorites.length) {
    return <section className="retro-cart-empty"><span>VOTRE CARNET EST VIDE</span><h2>AUCUN FAVORI.</h2><p>Parcourez la collection et gardez vos pièces préférées.</p><Link href="/" className="retro-primary"><span>VOIR LA COLLECTION</span><span>↗</span></Link></section>;
  }

  return (
    <section className="retro-favorites-list" aria-label="Produits favoris">
      <div className="retro-favorites-columns"><span>PIÈCE</span><span>PRIX</span><span>ACTIONS</span></div>
      {favorites.map((item, index) => (
        <article className="retro-favorite-item" key={item.productId}>
          <span className="retro-cart-index">{String(index + 1).padStart(2, "0")}</span>
          <Link className="retro-favorite-image" href={`/produit/${item.slug}`}><img src={item.image || "/images/product-photo-sample.webp"} alt={item.name} /></Link>
          <div className="retro-favorite-name"><Link href={`/produit/${item.slug}`}>{item.name}</Link><p>Collection officielle</p></div>
          <strong>{formatCents(item.priceCents, item.currency)}</strong>
          <div className="retro-favorite-actions">
            <button type="button" className="retro-primary" onClick={() => addItem({ productId: item.productId, slug: item.slug, name: item.name, image: item.image, priceCents: item.priceCents, currency: item.currency })}><span>AJOUTER</span><span>+</span></button>
            <button type="button" className="retro-remove" onClick={() => removeItem(item.productId)}>RETIRER</button>
          </div>
        </article>
      ))}
    </section>
  );
}
