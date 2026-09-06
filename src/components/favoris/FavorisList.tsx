"use client";

import { useState } from "react";
import { HeartFilledIcon } from "@/components/icons";
import { capped, vmin } from "@/lib/fluid";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";
import { removeFavorite } from "@/app/actions/favorites";

const PRODUCT_IMAGE = "/images/product-photo-sample.webp";

export type FavoriteProduct = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  currency: string;
};

export function FavorisList({ initialItems }: { initialItems: FavoriteProduct[] }) {
  const [favorites, setFavorites] = useState(initialItems);
  const { addItem } = useCart();
  const { decrement: decrementFavorites } = useFavorites();

  const removeItem = (productId: string) => {
    setFavorites((s) => s.filter((f) => f.productId !== productId));
    decrementFavorites();
    removeFavorite(productId);
  };

  const isEmpty = favorites.length === 0;

  return (
    <div style={{ width: capped(760), flex: "none", display: "flex", flexDirection: "column", gap: vmin(16) }}>
      {favorites.map((item) => (
        <div
          key={item.productId}
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: vmin(22),
            padding: vmin(20),
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(180deg, var(--glass-pill-bg), var(--glass-fill-bottom))",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(var(--blur-standard))",
            WebkitBackdropFilter: "blur(var(--blur-standard))",
          }}
        >
          <div
            style={{
              width: vmin(120),
              height: vmin(120),
              flex: "none",
              borderRadius: "var(--radius-md)",
              background: "var(--glass-fill-strong-top)",
              border: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={item.image || PRODUCT_IMAGE}
              alt={item.name}
              style={{ width: "82%", height: "82%", objectFit: "contain" }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: vmin(6) }}>
            <div style={{ fontSize: vmin(19), fontWeight: 600 }}>{item.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: vmin(10) }}>
              <span style={{ fontSize: vmin(20), fontWeight: 700 }}>
                {formatCents(item.priceCents, item.currency)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: vmin(8), flex: "none" }}>
            <button
              onClick={() =>
                addItem({
                  productId: item.productId,
                  slug: item.slug,
                  name: item.name,
                  image: item.image,
                  priceCents: item.priceCents,
                  currency: item.currency,
                })
              }
              style={{
                flex: "none",
                padding: `${vmin(12)} ${vmin(22)}`,
                borderRadius: "var(--radius-xs)",
                background: "var(--surface-light)",
                border: "1px solid var(--surface-light-border)",
                color: "var(--ink)",
                fontSize: vmin(14),
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
              }}
            >
              Ajouter au panier
            </button>
            <button
              onClick={() => removeItem(item.productId)}
              aria-label={`Retirer ${item.name} des favoris`}
              style={{
                width: vmin(44),
                height: vmin(44),
                flex: "none",
                borderRadius: "var(--radius-pill)",
                background: "var(--glass-pill-bg-soft)",
                border: "1px solid var(--glass-pill-border-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <HeartFilledIcon />
            </button>
          </div>
        </div>
      ))}

      {isEmpty && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: vmin(12),
            color: "var(--text-on-scene-tertiary)",
            padding: `${vmin(60)} 0`,
          }}
        >
          <svg width={vmin(48)} height={vmin(48)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z" />
          </svg>
          <div style={{ fontSize: vmin(18), fontWeight: 600 }}>Aucun article en favoris</div>
          <div style={{ fontSize: vmin(14) }}>Explorez nos produits et ajoutez vos préférés.</div>
        </div>
      )}
    </div>
  );
}
