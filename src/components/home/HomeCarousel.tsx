"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/format";
import { capped, vmin } from "@/lib/fluid";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import type { ShopProduct } from "@/lib/shop";

const PLACEHOLDER_IMAGE = "/images/product-photo-sample.webp";
const AUTOPLAY_INTERVAL_MS = 5000;
const TRANSITION = "transform 1.2s cubic-bezier(.4,0,.2,1), width 1.2s cubic-bezier(.4,0,.2,1), height 1.2s cubic-bezier(.4,0,.2,1), opacity 0.9s ease";
const SLOT_SPACING = 340;

function productImage(product: ShopProduct) {
  return product.images[0] ?? PLACEHOLDER_IMAGE;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function dotStyle(active: boolean): React.CSSProperties {
  return active
    ? {
        width: vmin(30),
        height: vmin(9),
        borderRadius: "var(--radius-pill)",
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }
    : {
        width: vmin(9),
        height: vmin(9),
        borderRadius: "var(--radius-pill)",
        background: "var(--text-on-scene-quaternary)",
        border: "none",
        padding: 0,
        cursor: "pointer",
      };
}

function CarouselSlot({ product, offset }: { product: ShopProduct; offset: number }) {
  const isCenter = offset === 0;
  const visible = Math.abs(offset) <= 1;
  const imgWidth = isCenter ? 420 : 250;
  const imgHeight = isCenter ? 580 : 250;

  return (
    <Link
      href={`/produit/${product.slug}`}
      className={isCenter ? "home-slot" : "home-slot home-side-item"}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${vmin(SLOT_SPACING * offset)}), -50%) rotateY(${offset * -20}deg)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: vmin(20),
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        zIndex: isCenter ? 2 : 1,
        transition: TRANSITION,
      }}
    >
      <img
        src={productImage(product)}
        alt={product.name}
        style={{
          width: vmin(imgWidth),
          height: vmin(imgHeight),
          objectFit: "contain",
          filter: isCenter
            ? "drop-shadow(0 30px 50px rgba(0,0,0,0.32))"
            : "drop-shadow(0 18px 30px rgba(0,0,0,0.28))",
          transition: TRANSITION,
        }}
      />
      <div
        className="home-slot-caption"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: vmin(6),
          opacity: isCenter ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      >
        <div style={{ fontSize: vmin(19), fontWeight: 600, whiteSpace: "nowrap" }}>{product.name}</div>
        <div style={{ fontSize: vmin(28), fontWeight: 700, lineHeight: 1 }}>
          {formatCents(product.priceCents, product.currency)}
        </div>
      </div>
    </Link>
  );
}

const navButtonStyle: React.CSSProperties = {
  flex: "none",
  width: vmin(48),
  height: vmin(48),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "var(--glass-pill-bg)",
  border: "1px solid var(--glass-pill-border)",
  cursor: "pointer",
};

export function HomeCarousel({ products }: { products: ShopProduct[] }) {
  const [step, setStep] = useState(0);

  const goTo = (offset: number) => setStep((s) => s + offset);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = setInterval(() => goTo(1), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [step, products.length]);

  if (products.length === 0) {
    return (
      <div
        className="home-empty"
        style={{
          position: "absolute",
          top: vmin(44),
          left: 0,
          right: 0,
          height: vmin(676),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: vmin(20),
          fontWeight: 500,
          color: "var(--text-on-scene-secondary)",
        }}
      >
        Aucun produit disponible pour le moment.
      </div>
    );
  }

  const activeIndex = mod(step, products.length);
  const featured = products[activeIndex];
  const showSides = products.length > 1;
  const windowOffsets = [-2, -1, 0, 1, 2].filter((offset) => Math.abs(offset) < products.length);

  return (
    <>
      <div
        className="home-hero-row"
        style={{
          position: "absolute",
          top: vmin(44),
          left: 0,
          right: 0,
          height: vmin(676),
          boxSizing: "border-box",
          perspective: "1600px",
        }}
      >
        {windowOffsets.map((offset) => {
          const absoluteIndex = step + offset;
          return (
            <CarouselSlot
              key={absoluteIndex}
              product={products[mod(absoluteIndex, products.length)]}
              offset={offset}
            />
          );
        })}
      </div>

      {products.length > 1 && (
        <div
          className="home-dots"
          style={{
            position: "absolute",
            bottom: vmin(232),
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: vmin(10),
          }}
        >
          {products.map((product, i) => (
            <button
              key={product.id}
              aria-label={`Voir ${product.name}`}
              onClick={() => setStep((s) => s + (i - mod(s, products.length)))}
              className={i === activeIndex ? "home-dot home-dot-active" : "home-dot"}
              style={dotStyle(i === activeIndex)}
            />
          ))}
        </div>
      )}

      <div
        className="home-nav"
        style={{
          position: "absolute",
          bottom: vmin(110),
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: vmin(16),
        }}
      >
        {showSides && (
          <button
            type="button"
            aria-label="Produit précédent"
            onClick={() => goTo(-1)}
            className="home-nav-button"
            style={navButtonStyle}
          >
            <ChevronLeftIcon />
          </button>
        )}

        <Link
          href={`/produit/${featured.slug}`}
          className="home-featured"
          style={{
            width: capped(500),
            boxSizing: "border-box",
            padding: vmin(20),
            borderRadius: "var(--radius-lg)",
            background:
              "linear-gradient(180deg, var(--glass-fill-strong-top), var(--glass-fill-strong-bottom))",
            border: "1px solid var(--glass-border-strong)",
            backdropFilter: "blur(var(--blur-heavy))",
            WebkitBackdropFilter: "blur(var(--blur-heavy))",
            boxShadow: "var(--shadow-cta-strong)",
            display: "flex",
            flexDirection: "column",
            gap: vmin(18),
          }}
        >
          <div
            className="home-featured-row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: vmin(16),
              padding: `0 ${vmin(4)}`,
            }}
          >
            <span className="home-featured-name" style={{ fontSize: vmin(21), fontWeight: 600, whiteSpace: "nowrap" }}>
              {featured.name}
            </span>
            <span
              className="home-featured-price"
              style={{ fontSize: vmin(28), fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}
            >
              {formatCents(featured.priceCents, featured.currency)}
            </span>
          </div>
        </Link>

        {showSides && (
          <button
            type="button"
            aria-label="Produit suivant"
            onClick={() => goTo(1)}
            className="home-nav-button"
            style={navButtonStyle}
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>
    </>
  );
}
