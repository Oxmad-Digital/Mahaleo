"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { HeaderIconButton } from "@/components/scene/HeaderIconButton";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import {
  CartIcon,
  ChevronLeftIcon,
  HeartFilledIcon,
  HeartIcon,
  ShippingIcon,
} from "@/components/icons";
import { capped, vmin } from "@/lib/fluid";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";
import { addFavorite, removeFavorite } from "@/app/actions/favorites";
import type { ShopProductDetail } from "@/lib/shop";

const PLACEHOLDER_IMAGE = "/images/product-photo-sample.webp";
const THUMBNAIL_SLOTS = 4;

/**
 * Fiche produit : galerie à gauche, panneau d'achat à droite. Elle passe
 * `scene-mobile` à `Scene`, donc sous 768px (ou sur un téléphone couché) la
 * scène repasse en flux normal et c'est la page qui défile — les deux colonnes
 * s'empilent, les vignettes passent sous la photo en une rangée. Voir les
 * règles `.scene-mobile .product-*` dans globals.css, qui s'appuient sur les
 * classes posées ici pour repasser les tailles en pixels.
 */
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
  const images = product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
  const [thumb, setThumb] = useState(0);

  const thumbColumnRef = useRef<HTMLDivElement>(null);
  const [thumbSize, setThumbSize] = useState<number | null>(null);

  useEffect(() => {
    const el = thumbColumnRef.current;
    if (!el) return;
    const measure = () => {
      const firstThumb = el.firstElementChild as HTMLElement | null;
      if (firstThumb) setThumbSize(firstThumb.getBoundingClientRect().height);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const availableSizes = useMemo(() => product.sizes.filter((s) => s.stock > 0), [product.sizes]);
  const requiresSize = product.sizes.length > 0;
  const [size, setSize] = useState<string | undefined>(availableSizes[0]?.size);
  const { addItem } = useCart();
  const { increment: incrementFavorites, decrement: decrementFavorites } = useFavorites();
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);

  const canAddToCart = requiresSize ? !!size : true;

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0],
      priceCents: product.priceCents,
      currency: product.currency,
      size,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    const next = !favorite;
    setFavorite(next);
    if (next) incrementFavorites();
    else decrementFavorites();
    (next ? addFavorite(product.id) : removeFavorite(product.id)).then((result) => {
      if (result?.error) {
        setFavorite(!next);
        if (next) decrementFavorites();
        else incrementFavorites();
      }
    });
  };

  return (
    <Scene className="scene-mobile">
      <TopBar
        className="scene-topbar"
        left={<LogoPill />}
        right={
          <>
            <Breadcrumb
              className="product-crumb"
              items={[{ label: "Boutique", href: "/" }, product.name]}
            />
            <HeaderIconButton className="product-back" href="/" label="Retour à la boutique">
              <ChevronLeftIcon />
            </HeaderIconButton>
          </>
        }
      />

      <div
        className="product-layout"
        style={{
          position: "absolute",
          top: vmin(104),
          left: vmin(110),
          right: vmin(60),
          bottom: vmin(94),
          display: "flex",
          alignItems: "stretch",
          gap: vmin(60),
        }}
      >
        <div
          className="product-gallery"
          style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "row", gap: vmin(14) }}
        >
          <div
            ref={thumbColumnRef}
            className="product-thumbs"
            style={{
              flex: "none",
              display: "flex",
              flexDirection: "column",
              gap: vmin(12),
            }}
          >
            {Array.from({ length: THUMBNAIL_SLOTS }).map((_, i) => {
              const image = images[i % images.length];
              const active = i === thumb;
              return (
                <button
                  key={i}
                  className="product-thumb"
                  onClick={() => setThumb(i)}
                  style={{
                    width: thumbSize ?? vmin(84),
                    flex: 1,
                    minHeight: 0,
                    borderRadius: "var(--radius-md)",
                    background: "var(--glass-fill-strong-top)",
                    border: `1px solid ${
                      active ? "rgba(255,255,255,0.75)" : "var(--glass-border-strong)"
                    }`,
                    boxShadow: active
                      ? "0 14px 30px rgba(0,0,0,0.28)"
                      : "0 8px 20px rgba(0,0,0,0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={image}
                    alt="Vue produit"
                    style={{ width: "84%", height: "84%", objectFit: "contain" }}
                  />
                </button>
              );
            })}
          </div>

          <div
            className="product-stage"
            style={{
              position: "relative",
              flex: 1,
              minWidth: 0,
              borderRadius: "var(--radius-2xl)",
              background:
                "linear-gradient(180deg, var(--glass-fill-strong-top), var(--glass-fill-bottom))",
              border: "1px solid var(--glass-border-strong)",
              backdropFilter: "blur(var(--blur-strong))",
              WebkitBackdropFilter: "blur(var(--blur-strong))",
              boxShadow: "0 24px 60px rgba(0,0,0,0.26)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={images[thumb % images.length]}
              alt={product.name}
              style={{
                width: "88%",
                height: "88%",
                objectFit: "contain",
                filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.32))",
              }}
            />
            {isNewArrival && (
              <div
                className="product-badge"
                style={{
                  position: "absolute",
                  top: vmin(20),
                  left: vmin(20),
                  padding: `${vmin(9)} ${vmin(18)}`,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--glass-fill-strong-top)",
                  border: "1px solid var(--glass-border-strong)",
                  fontSize: vmin(13),
                  fontWeight: 600,
                  letterSpacing: "var(--label-letter-spacing-tight)",
                  textTransform: "uppercase",
                }}
              >
                Nouvelle arrivée
              </div>
            )}
          </div>
        </div>

        <div
          className="product-aside"
          style={{ width: capped(520), flex: "none", display: "flex", flexDirection: "column" }}
        >
          <div
            className="product-card"
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: vmin(22),
              padding: vmin(32),
              boxSizing: "border-box",
              borderRadius: "var(--radius-2xl)",
              background:
                "linear-gradient(180deg, var(--glass-fill-strong-top), var(--glass-fill-bottom))",
              border: "1px solid var(--glass-border-strong)",
              backdropFilter: "blur(var(--blur-strong))",
              WebkitBackdropFilter: "blur(var(--blur-strong))",
              boxShadow: "0 24px 60px rgba(0,0,0,0.26)",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: vmin(12) }}>
              <div className="product-title" style={{ fontSize: vmin(44), fontWeight: 700, lineHeight: 1.06 }}>
                {product.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: vmin(14) }}>
                <span className="product-price" style={{ fontSize: vmin(38), fontWeight: 700, lineHeight: 1 }}>
                  {formatCents(product.priceCents, product.currency)}
                </span>
              </div>
            </div>

            {product.description && (
              <div
                className="product-description"
                style={{ fontSize: vmin(16), lineHeight: 1.6, color: "var(--text-on-scene-secondary)" }}
              >
                {product.description}
              </div>
            )}

            {product.color && (
              <div
                className="product-color"
                style={{ display: "flex", alignItems: "center", gap: vmin(10), fontSize: vmin(14) }}
              >
                <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.78)" }}>Couleur</span>
                <span
                  role="img"
                  aria-label={`Couleur du produit : ${product.color}`}
                  title={product.color}
                  style={{
                    width: vmin(22),
                    height: vmin(22),
                    borderRadius: "50%",
                    background: product.color,
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    flex: "none",
                  }}
                />
              </div>
            )}

            {product.sizes.length > 0 && (
              <div
                className="product-sizes-block"
                style={{ display: "flex", flexDirection: "column", gap: vmin(12) }}
              >
                <div
                  className="product-sizes-label"
                  style={{ fontSize: vmin(14), fontWeight: 600, color: "rgba(255,255,255,0.78)" }}
                >
                  Taille
                </div>
                <div
                  className="product-sizes"
                  style={{ display: "flex", alignItems: "center", gap: vmin(10), flexWrap: "wrap" }}
                >
                  {product.sizes.map(({ size: label, stock }) => {
                    const on = label === size;
                    const disabled = stock === 0;
                    return (
                      <button
                        key={label}
                        className="product-size"
                        disabled={disabled}
                        onClick={() => setSize(label)}
                        style={{
                          minWidth: vmin(60),
                          padding: `${vmin(14)} 0`,
                          textAlign: "center",
                          borderRadius: "var(--radius-sm)",
                          background: on ? "rgba(255,255,255,0.9)" : "var(--glass-fill-strong-top)",
                          border: `1px solid ${on ? "rgba(255,255,255,0.7)" : "var(--glass-border-strong)"}`,
                          color: disabled ? "var(--text-on-scene-quaternary)" : on ? "var(--ink)" : "#fff",
                          fontSize: vmin(16),
                          fontWeight: 600,
                          cursor: disabled ? "not-allowed" : "pointer",
                          opacity: disabled ? 0.5 : 1,
                          textDecoration: disabled ? "line-through" : "none",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="product-spacer" style={{ height: vmin(14) }} />

            <div
              className="product-actions"
              style={{ display: "flex", alignItems: "center", gap: vmin(12) }}
            >
              <button
                className="product-add"
                disabled={!canAddToCart}
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: vmin(12),
                  padding: `${vmin(19)} 0`,
                  borderRadius: "var(--radius-base)",
                  background: "var(--surface-light)",
                  border: "1px solid var(--surface-light-border)",
                  color: "var(--ink)",
                  boxShadow: "var(--shadow-cta)",
                  cursor: canAddToCart ? "pointer" : "not-allowed",
                  opacity: canAddToCart ? 1 : 0.6,
                }}
              >
                <CartIcon size={vmin(21)} stroke="#10222c" />
                <span
                  className="product-add-label"
                  style={{ fontSize: vmin(17), fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  {!canAddToCart
                    ? "Rupture de stock"
                    : added
                      ? "Ajouté au panier ✓"
                      : `Ajouter au panier — ${formatCents(product.priceCents, product.currency)}`}
                </span>
              </button>
              <button
                className="product-fav"
                aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                onClick={handleToggleFavorite}
                style={{
                  width: vmin(60),
                  height: vmin(60),
                  flex: "none",
                  borderRadius: "var(--radius-base)",
                  background: "var(--glass-pill-bg)",
                  border: "1px solid var(--glass-border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {favorite ? <HeartFilledIcon /> : <HeartIcon />}
              </button>
            </div>

            <div
              className="product-shipping"
              style={{
                display: "flex",
                alignItems: "center",
                gap: vmin(10),
                padding: `${vmin(16)} ${vmin(20)}`,
                borderRadius: "var(--radius-base)",
                background: "var(--glass-pill-bg-soft)",
                border: "1px solid var(--glass-pill-border-soft)",
                fontSize: vmin(14),
                fontWeight: 500,
                color: "var(--text-on-scene-secondary)",
              }}
            >
              <ShippingIcon />
              <span>Livraison offerte dès 150 € · retours 30 jours</span>
            </div>

            <div className="product-filler" style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      <IconRail active="shop" />
      <Footer />
    </Scene>
  );
}
