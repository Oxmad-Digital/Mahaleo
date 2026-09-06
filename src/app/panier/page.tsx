"use client";

import { useRouter } from "next/navigation";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { ArrowRightIcon, ShippingIcon, TrashIcon } from "@/components/icons";
import { capped, vmin } from "@/lib/fluid";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";

const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
const SHIPPING_COST_CENTS = 800;

export default function PanierPage() {
  const { items, itemCount, subtotalCents, updateQty, removeItem } = useCart();
  const router = useRouter();

  const shippingFree = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingCents = shippingFree ? 0 : items.length ? SHIPPING_COST_CENTS : 0;
  const totalCents = subtotalCents + shippingCents;
  const isEmpty = items.length === 0;
  const currency = items[0]?.currency ?? "EUR";

  return (
    <Scene className="scene-mobile">
      <TopBar
        className="scene-topbar"
        left={
          <>
            <LogoPill />
            <BackLink href="/" label="Continuer mes achats" />
          </>
        }
        right={<Breadcrumb className="cart-crumb" items={["Boutique", "Panier"]} />}
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
        <div
          className="cart-list"
          style={{ width: capped(720), flex: "none", display: "flex", flexDirection: "column", gap: vmin(16) }}
        >
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size ?? ""}`}
              className="cart-item"
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
                className="cart-item-image"
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
                  src={item.image}
                  alt={item.name}
                  style={{ width: "82%", height: "82%", objectFit: "contain" }}
                />
              </div>

              <div
                className="cart-item-info"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: vmin(6),
                }}
              >
                <div
                  className="cart-item-name"
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
                {item.size && (
                  <div
                    className="cart-item-size"
                    style={{
                      fontSize: vmin(14),
                      fontWeight: 500,
                      color: "var(--text-on-scene-tertiary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Taille : {item.size}
                  </div>
                )}
              </div>

              <div className="cart-item-meta" style={{ display: "flex", alignItems: "center", gap: vmin(22) }}>
                <div
                  className="cart-item-qty"
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
                    onClick={() => updateQty(item.productId, item.size, -1)}
                    className="cart-qty-btn"
                    style={qtyButtonStyle}
                    aria-label={`Diminuer la quantité de ${item.name}`}
                  >
                    −
                  </button>
                  <span style={{ minWidth: vmin(22), textAlign: "center", fontSize: vmin(16), fontWeight: 600 }}>
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.productId, item.size, 1)}
                    className="cart-qty-btn"
                    style={qtyButtonStyle}
                    aria-label={`Augmenter la quantité de ${item.name}`}
                  >
                    +
                  </button>
                </div>

                <div
                  className="cart-item-price"
                  style={{ width: vmin(90), flex: "none", textAlign: "right", fontSize: vmin(20), fontWeight: 700 }}
                >
                  {formatCents(item.priceCents * item.qty, item.currency)}
                </div>
              </div>

              <button
                onClick={() => removeItem(item.productId, item.size)}
                aria-label={`Retirer ${item.name} du panier`}
                className="cart-item-remove"
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
              className="cart-empty"
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
          className="cart-summary"
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
          <div className="cart-summary-title" style={{ fontSize: vmin(21), fontWeight: 700 }}>
            Récapitulatif
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: vmin(14) }}>
            <div
              className="cart-summary-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: vmin(15),
                color: "var(--text-on-scene-secondary)",
              }}
            >
              <span>Sous-total ({itemCount} articles)</span>
              <span>{formatCents(subtotalCents, currency)}</span>
            </div>
            <div
              className="cart-summary-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: vmin(15),
                color: "var(--text-on-scene-secondary)",
              }}
            >
              <span>Livraison</span>
              <span>{shippingFree ? "Offerte" : formatCents(shippingCents, currency)}</span>
            </div>
            <div className="cart-divider" style={{ height: 1, background: "var(--glass-border-strong)" }} />
            <div className="cart-total" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="cart-total-label" style={{ fontSize: vmin(17), fontWeight: 600 }}>
                Total
              </span>
              <span className="cart-total-value" style={{ fontSize: vmin(28), fontWeight: 700 }}>
                {formatCents(totalCents, currency)}
              </span>
            </div>
          </div>

          <button
            disabled={isEmpty}
            onClick={() => router.push("/checkout")}
            className="cart-checkout"
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
              cursor: isEmpty ? "not-allowed" : "pointer",
              opacity: isEmpty ? 0.6 : 1,
            }}
          >
            <span className="cart-checkout-label" style={{ fontSize: vmin(17), fontWeight: 700 }}>
              Passer la commande
            </span>
            <ArrowRightIcon stroke="#10222c" />
          </button>

          <div
            className="cart-shipping-note"
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
