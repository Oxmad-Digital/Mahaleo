"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { Footer } from "@/components/scene/Footer";
import { ArrowRightIcon, ShippingIcon } from "@/components/icons";
import { capped, vmin } from "@/lib/fluid";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { createCheckoutSession, type CheckoutCartItem } from "@/app/actions/checkout";

const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
const SHIPPING_COST_CENTS = 800;

const fieldLabelStyle: React.CSSProperties = {
  fontSize: vmin(13),
  fontWeight: 600,
  color: "var(--text-on-scene-secondary)",
};

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: `${vmin(13)} ${vmin(16)}`,
  borderRadius: "var(--radius-sm)",
  background: "var(--glass-fill-strong-top)",
  border: "1px solid var(--glass-border)",
  color: "#fff",
  fontSize: vmin(15),
  fontWeight: 500,
  outline: "none",
  fontFamily: "inherit",
};

const errorTextStyle: React.CSSProperties = {
  fontSize: vmin(12),
  fontWeight: 600,
  color: "var(--danger-on-scene)",
};

export default function CheckoutPage() {
  const { items, itemCount, subtotalCents, hydrated } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const cartItems: CheckoutCartItem[] = items.map((item) => ({
    productId: item.productId,
    size: item.size,
    qty: item.qty,
  }));

  const [state, formAction, pending] = useActionState(createCheckoutSession.bind(null, cartItems), undefined);

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/panier");
  }, [hydrated, items.length, router]);

  const shippingFree = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingCents = shippingFree ? 0 : items.length ? SHIPPING_COST_CENTS : 0;
  const totalCents = subtotalCents + shippingCents;
  const currency = items[0]?.currency ?? "EUR";

  if (!hydrated || items.length === 0) return null;

  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <BackLink href="/panier" label="Retour au panier" />
          </>
        }
        right={<Breadcrumb items={["Boutique", "Panier", "Paiement"]} />}
      />

      <form
        action={formAction}
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
          alignItems: "flex-start",
          gap: vmin(24),
          overflowY: "auto",
          // `overflow-y: auto` fait passer l'axe horizontal de `visible` à
          // `auto` : dès que la barre verticale apparaît, elle mange quelques
          // pixels de la largeur de contenu et une barre horizontale surgit
          // pour ces quelques pixels. Les deux colonnes ci-dessous peuvent
          // maintenant se rétracter (`flex: 0 1 auto`), donc il n'y a plus rien
          // à faire défiler latéralement.
          overflowX: "hidden",
          paddingBottom: vmin(20),
          paddingRight: vmin(10),
        }}
      >
        <div
          style={{
            width: capped(560),
            flex: "0 1 auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: vmin(20),
            padding: vmin(28),
            boxSizing: "border-box",
            borderRadius: "var(--radius-xl)",
            background: "linear-gradient(180deg, var(--glass-pill-bg), var(--glass-fill-bottom))",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(var(--blur-standard))",
            WebkitBackdropFilter: "blur(var(--blur-standard))",
          }}
        >
          <div style={{ fontSize: vmin(21), fontWeight: 700 }}>Coordonnées et livraison</div>

          <Field label="Nom complet" name="name" defaultValue={session?.user?.name ?? ""} errors={state?.errors?.name} />
          <Field
            label="E-mail"
            name="email"
            type="email"
            defaultValue={session?.user?.email ?? ""}
            errors={state?.errors?.email}
          />
          <Field label="Téléphone (facultatif)" name="phone" type="tel" errors={state?.errors?.phone} />
          <Field label="Adresse" name="address" errors={state?.errors?.address} />

          <div style={{ display: "flex", gap: vmin(14) }}>
            <div style={{ flex: 2, minWidth: 0 }}>
              <Field label="Ville" name="city" errors={state?.errors?.city} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Field label="Code postal" name="postalCode" errors={state?.errors?.postalCode} />
            </div>
          </div>

          <Field label="Pays" name="country" defaultValue="France" errors={state?.errors?.country} />
        </div>

        <div
          style={{
            width: capped(420),
            flex: "0 1 auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: vmin(18),
            padding: vmin(26),
            boxSizing: "border-box",
            borderRadius: "var(--radius-xl)",
            background: "linear-gradient(180deg, var(--glass-fill-strong-top), var(--glass-fill-bottom))",
            border: "1px solid var(--glass-border-strong)",
            backdropFilter: "blur(var(--blur-strong))",
            WebkitBackdropFilter: "blur(var(--blur-strong))",
          }}
        >
          <div style={{ fontSize: vmin(21), fontWeight: 700 }}>Récapitulatif</div>

          <div style={{ display: "flex", flexDirection: "column", gap: vmin(10), maxHeight: vmin(220), overflowY: "auto" }}>
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size ?? ""}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: vmin(10), fontSize: vmin(14) }}
              >
                <span style={{ color: "var(--text-on-scene-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.name} {item.size ? `(${item.size})` : ""} <span style={{ color: "var(--text-on-scene-tertiary)" }}>× {item.qty}</span>
                </span>
                <span style={{ fontWeight: 600, flex: "none" }}>{formatCents(item.priceCents * item.qty, item.currency)}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "var(--glass-border-strong)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: vmin(14) }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: vmin(15), color: "var(--text-on-scene-secondary)" }}>
              <span>Sous-total ({itemCount} articles)</span>
              <span>{formatCents(subtotalCents, currency)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: vmin(15), color: "var(--text-on-scene-secondary)" }}>
              <span>Livraison</span>
              <span>{shippingFree ? "Offerte" : formatCents(shippingCents, currency)}</span>
            </div>
            <div style={{ height: 1, background: "var(--glass-border-strong)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: vmin(17), fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: vmin(28), fontWeight: 700 }}>{formatCents(totalCents, currency)}</span>
            </div>
          </div>

          {state?.message && (
            <div
              style={{
                padding: `${vmin(12)} ${vmin(16)}`,
                borderRadius: "var(--radius-sm)",
                background: "var(--danger-surface)",
                border: "1px solid var(--danger-border)",
                fontSize: vmin(13),
                fontWeight: 500,
                lineHeight: 1.45,
                color: "var(--danger-on-surface)",
              }}
            >
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
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
              cursor: pending ? "wait" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: vmin(17), fontWeight: 700 }}>
              {pending ? "Redirection vers le paiement…" : "Payer"}
            </span>
            {!pending && <ArrowRightIcon stroke="#10222c" />}
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
            <span>Paiement sécurisé par Stripe</span>
          </div>
        </div>
      </form>

      <Footer />
    </Scene>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  errors?: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
      <label htmlFor={name} style={fieldLabelStyle}>
        {label}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} required={!label.includes("facultatif")} style={inputStyle} />
      {errors?.map((error) => (
        <span key={error} style={errorTextStyle}>
          {error}
        </span>
      ))}
    </div>
  );
}
