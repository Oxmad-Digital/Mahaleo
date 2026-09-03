"use client";

import { useState } from "react";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { ArrowRightIcon, ShippingIcon, TrashIcon } from "@/components/icons";
import { capped, vmin } from "@/lib/fluid";

const PRODUCT_IMAGE = "/images/product-photo-sample.webp";

type CartItem = {
  id: number;
  name: string;
  size: string;
  color: string;
  price: number;
  qty: number;
};

const INITIAL_CART: CartItem[] = [
  { id: 1, name: "Pull crème brodé", size: "M", color: "Crème", price: 35, qty: 1 },
  { id: 2, name: "T-shirt à impression basique", size: "L", color: "Blanc", price: 35, qty: 2 },
];

export default function PanierPage() {
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);

  const updateQty = (id: number, delta: number) => {
    setCart((s) => s.map((c) => (c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c)));
  };

  const removeItem = (id: number) => {
    setCart((s) => s.filter((c) => c.id !== id));
  };

  const itemCount = cart.reduce((n, c) => n + c.qty, 0);
  const subtotal = cart.reduce((n, c) => n + c.price * c.qty, 0);
  const shippingFree = subtotal >= 150;
  const shipping = shippingFree ? 0 : cart.length ? 8 : 0;
  const total = subtotal + shipping;
  const isEmpty = cart.length === 0;

  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <BackLink href="/" label="Continuer mes achats" />
          </>
        }
        right={<Breadcrumb items={["Boutique", "Panier"]} />}
      />

      <div
        className="cart-scroll"
        style={{
          position: "absolute",
          top: vmin(130),
          left: "50%",
          transform: "translateX(-50%)",
          bottom: vmin(94),
          width: "fit-content",
          maxWidth: `calc(100% - ${vmin(220)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: vmin(28),
          overflowY: "auto",
          paddingBottom: vmin(20),
          paddingRight: vmin(60),
        }}
      >
        <div style={{ width: capped(720), flex: "none", display: "flex", flexDirection: "column", gap: vmin(16) }}>
          {cart.map((item) => (
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
                  width: vmin(108),
                  height: vmin(108),
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

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: vmin(6),
                }}
              >
                <div
                  style={{
                    fontSize: vmin(19),
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: vmin(14),
                    fontWeight: 500,
                    color: "var(--text-on-scene-tertiary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Taille : {item.size} · Couleur : {item.color}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: vmin(10),
                  padding: vmin(6),
                  borderRadius: "var(--radius-pill)",
                  background: "var(--glass-fill-strong-top)",
                  border: "1px solid var(--glass-border)",
                  flex: "none",
                }}
              >
                <button
                  onClick={() => updateQty(item.id, -1)}
                  style={qtyButtonStyle}
                  aria-label={`Diminuer la quantité de ${item.name}`}
                >
                  −
                </button>
                <span style={{ minWidth: vmin(22), textAlign: "center", fontSize: vmin(16), fontWeight: 600 }}>
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.id, 1)}
                  style={qtyButtonStyle}
                  aria-label={`Augmenter la quantité de ${item.name}`}
                >
                  +
                </button>
              </div>

              <div style={{ width: vmin(90), flex: "none", textAlign: "right", fontSize: vmin(20), fontWeight: 700 }}>
                {item.price * item.qty} €
              </div>

              <button
                onClick={() => removeItem(item.id)}
                aria-label={`Retirer ${item.name} du panier`}
                style={{
                  width: vmin(40),
                  height: vmin(40),
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
                <TrashIcon />
              </button>
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
                padding: `${vmin(40)} 0`,
              }}
            >
              <div style={{ fontSize: vmin(18), fontWeight: 600 }}>Votre panier est vide</div>
              <div style={{ fontSize: vmin(14) }}>Ajoutez des articles pour les voir apparaître ici.</div>
            </div>
          )}
        </div>

        <div
          style={{
            width: capped(720),
            flex: "none",
            display: "flex",
            flexDirection: "column",
            gap: vmin(20),
            padding: vmin(26),
            boxSizing: "border-box",
            borderRadius: "var(--radius-xl)",
            background:
              "linear-gradient(180deg, var(--glass-fill-strong-top), var(--glass-fill-bottom))",
            border: "1px solid var(--glass-border-strong)",
            backdropFilter: "blur(var(--blur-strong))",
            WebkitBackdropFilter: "blur(var(--blur-strong))",
          }}
        >
          <div style={{ fontSize: vmin(21), fontWeight: 700 }}>Récapitulatif</div>

          <div style={{ display: "flex", flexDirection: "column", gap: vmin(14) }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: vmin(15),
                color: "var(--text-on-scene-secondary)",
              }}
            >
              <span>Sous-total ({itemCount} articles)</span>
              <span>{subtotal} €</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: vmin(15),
                color: "var(--text-on-scene-secondary)",
              }}
            >
              <span>Livraison</span>
              <span>{shippingFree ? "Offerte" : `${shipping} €`}</span>
            </div>
            <div style={{ height: 1, background: "var(--glass-border-strong)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: vmin(17), fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: vmin(28), fontWeight: 700 }}>{total} €</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: vmin(10) }}>
            <input
              type="text"
              placeholder="Code promo"
              style={{
                flex: 1,
                minWidth: 0,
                padding: `${vmin(14)} ${vmin(18)}`,
                borderRadius: "var(--radius-sm)",
                background: "var(--glass-fill-strong-top)",
                border: "1px solid var(--glass-border)",
                color: "#fff",
                fontSize: vmin(14),
                fontWeight: 500,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <div
              style={{
                flex: "none",
                padding: `${vmin(14)} ${vmin(22)}`,
                borderRadius: "var(--radius-sm)",
                background: "var(--glass-border-strong)",
                border: "1px solid var(--glass-border-strong)",
                fontSize: vmin(14),
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              Appliquer
            </div>
          </div>

          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: vmin(10),
              padding: `${vmin(19)} 0`,
              borderRadius: "var(--radius-base)",
              background: "var(--surface-light)",
              border: "1px solid var(--surface-light-border)",
              color: "var(--ink)",
              boxShadow: "var(--shadow-cta)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: vmin(17), fontWeight: 700 }}>Passer la commande</span>
            <ArrowRightIcon stroke="#10222c" />
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: vmin(10),
              padding: `${vmin(14)} ${vmin(18)}`,
              borderRadius: "var(--radius-sm)",
              background: "var(--glass-pill-bg-soft)",
              border: "1px solid var(--glass-pill-border-soft)",
              fontSize: vmin(13),
              fontWeight: 500,
              color: "var(--text-on-scene-secondary)",
            }}
          >
            <ShippingIcon size={vmin(16)} />
            <span>Livraison offerte dès 150 € · retours 30 jours</span>
          </div>
        </div>
      </div>

      <IconRail active="cart" />
      <Footer />
    </Scene>
  );
}

const qtyButtonStyle: React.CSSProperties = {
  width: vmin(30),
  height: vmin(30),
  borderRadius: "var(--radius-pill)",
  background: "var(--glass-border-strong)",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: vmin(18),
  fontWeight: 600,
  lineHeight: 1,
  color: "#fff",
  fontFamily: "inherit",
};
