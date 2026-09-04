"use client";

import { useMemo, useState } from "react";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { CartIcon, HeartIcon, ShippingIcon } from "@/components/icons";
import { capped, vmin } from "@/lib/fluid";
import { formatCents } from "@/lib/format";
import type { ShopProductDetail } from "@/lib/shop";

const PLACEHOLDER_IMAGE = "/images/product-photo-sample.webp";

export function ProductDetail({
  product,
  isNewArrival,
}: {
  product: NonNullable<ShopProductDetail>;
  isNewArrival: boolean;
}) {
  const images = product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
  const [thumb, setThumb] = useState(0);

  const availableSizes = useMemo(() => product.sizes.filter((s) => s.stock > 0), [product.sizes]);
  const [size, setSize] = useState<string | undefined>(availableSizes[0]?.size);

  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <BackLink href="/" label="Retour à la boutique" />
          </>
        }
        right={<Breadcrumb items={["Boutique", product.name]} />}
      />

      <div
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
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: vmin(22) }}>
          <div
            style={{
              position: "relative",
              flex: 1,
              minHeight: 0,
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
              src={images[thumb]}
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

          {images.length > 1 && (
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: vmin(14) }}>
              {images.map((image, i) => {
                const active = i === thumb;
                return (
                  <button
                    key={image}
                    onClick={() => setThumb(i)}
                    style={{
                      width: vmin(104),
                      height: vmin(104),
                      flex: "none",
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
          )}
        </div>

        <div style={{ width: capped(440), flex: "none", display: "flex", flexDirection: "column", gap: vmin(22) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: vmin(12) }}>
            <div style={{ fontSize: vmin(44), fontWeight: 700, lineHeight: 1.06 }}>{product.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: vmin(14) }}>
              <span style={{ fontSize: vmin(38), fontWeight: 700, lineHeight: 1 }}>
                {formatCents(product.priceCents, product.currency)}
              </span>
            </div>
          </div>

          {product.description && (
            <div style={{ fontSize: vmin(16), lineHeight: 1.6, color: "var(--text-on-scene-secondary)" }}>
              {product.description}
            </div>
          )}

          {product.sizes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: vmin(12) }}>
              <div style={{ fontSize: vmin(14), fontWeight: 600, color: "rgba(255,255,255,0.78)" }}>
                Taille
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: vmin(10), flexWrap: "wrap" }}>
                {product.sizes.map(({ size: label, stock }) => {
                  const on = label === size;
                  const disabled = stock === 0;
                  return (
                    <button
                      key={label}
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

          <div style={{ height: vmin(14) }} />

          <div style={{ display: "flex", alignItems: "center", gap: vmin(12) }}>
            <button
              disabled={!size}
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
                cursor: size ? "pointer" : "not-allowed",
                opacity: size ? 1 : 0.6,
              }}
            >
              <CartIcon size={vmin(21)} stroke="#10222c" />
              <span style={{ fontSize: vmin(17), fontWeight: 700, whiteSpace: "nowrap" }}>
                {size ? `Ajouter au panier — ${formatCents(product.priceCents, product.currency)}` : "Rupture de stock"}
              </span>
            </button>
            <button
              aria-label="Ajouter aux favoris"
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
              <HeartIcon />
            </button>
          </div>

          <div
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

          <div style={{ flex: 1 }} />
        </div>
      </div>

      <IconRail active="shop" />
      <Footer />
    </Scene>
  );
}
