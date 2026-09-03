"use client";

import { useState } from "react";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { HeartFilledIcon } from "@/components/icons";
import { capped, vmin } from "@/lib/fluid";

const PRODUCT_IMAGE = "/images/product-photo-sample.webp";

type Favorite = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  discount: string | null;
};

const INITIAL_FAVORITES: Favorite[] = [
  { id: 1, name: "Pull crème brodé", category: "Meilleure collection", price: 35, oldPrice: 52, discount: "−33%" },
  { id: 2, name: "T-shirt basique", category: "Essentiels", price: 29, oldPrice: null, discount: null },
  { id: 3, name: "Chemise lin", category: "Été", price: 45, oldPrice: 65, discount: "−31%" },
];

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<Favorite[]>(INITIAL_FAVORITES);

  const removeItem = (id: number) => {
    setFavorites((s) => s.filter((f) => f.id !== id));
  };

  const isEmpty = favorites.length === 0;

  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <BackLink href="/" label="Continuer mes achats" />
          </>
        }
        right={<Breadcrumb items={["Boutique", "Favoris"]} />}
      />

      <div
        className="fav-scroll"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "fit-content",
          maxWidth: `calc(100% - ${vmin(220)})`,
          maxHeight: `calc(100% - ${vmin(240)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: vmin(20),
          overflowY: "auto",
          paddingBottom: vmin(20),
          paddingRight: vmin(60),
        }}
      >
        <div style={{ width: capped(760), flex: "none", display: "flex", flexDirection: "column", gap: vmin(16) }}>
          {favorites.map((item) => (
            <div
              key={item.id}
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: vmin(22),
                padding: vmin(20),
                borderRadius: "var(--radius-lg)",
                background:
                  "linear-gradient(180deg, var(--glass-pill-bg), var(--glass-fill-bottom))",
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
                  src={PRODUCT_IMAGE}
                  alt={item.name}
                  style={{ width: "82%", height: "82%", objectFit: "contain" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: vmin(6) }}>
                <div style={{ fontSize: vmin(19), fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--text-on-scene-tertiary)" }}>
                  {item.category}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: vmin(10) }}>
                  <span style={{ fontSize: vmin(20), fontWeight: 700 }}>{item.price} €</span>
                  {item.oldPrice && (
                    <>
                      <span
                        style={{
                          fontSize: vmin(16),
                          fontWeight: 500,
                          color: "var(--text-on-scene-quaternary)",
                          textDecoration: "line-through",
                        }}
                      >
                        {item.oldPrice} €
                      </span>
                      <span
                        style={{
                          padding: `${vmin(4)} ${vmin(10)}`,
                          borderRadius: "var(--radius-pill)",
                          background: "var(--glass-fill-strong-top)",
                          border: "1px solid var(--glass-border-strong)",
                          fontSize: vmin(12),
                          fontWeight: 600,
                        }}
                      >
                        {item.discount}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: vmin(8), flex: "none" }}>
                <button
                  onClick={() => alert(`${item.name} ajouté au panier`)}
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
                  onClick={() => removeItem(item.id)}
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
      </div>

      <IconRail active="heart" />
      <Footer />
    </Scene>
  );
}
