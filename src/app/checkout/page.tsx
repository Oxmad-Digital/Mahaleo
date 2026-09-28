"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { StoreShell } from "@/components/store/StoreChrome";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { createCheckoutSession, type CheckoutCartItem } from "@/app/actions/checkout";

const FREE_SHIPPING_THRESHOLD_CENTS = 15000;
const SHIPPING_COST_CENTS = 800;

export default function CheckoutPage() {
  const { items, itemCount, subtotalCents, hydrated } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const cartItems: CheckoutCartItem[] = items.map(({ productId, size, qty }) => ({ productId, size, qty }));
  const [state, formAction, pending] = useActionState(createCheckoutSession.bind(null, cartItems), undefined);

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/panier");
  }, [hydrated, items.length, router]);

  if (!hydrated || items.length === 0) return null;

  const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
  const totalCents = subtotalCents + shippingCents;
  const currency = items[0]?.currency ?? "EUR";

  return (
    <StoreShell className="retro-checkout-page">
      <main className="retro-checkout-main">
        <div className="retro-cart-title">
          <div><span>ÉTAPE FINALE</span><h1>LA COMMANDE</h1></div>
          <Link href="/panier">← Retour au panier</Link>
        </div>

        <form action={formAction} className="retro-checkout-layout">
          <section className="retro-checkout-form">
            <span className="retro-eyebrow">01 · COORDONNÉES &amp; LIVRAISON</span>
            <h2>OÙ ENVOYER VOTRE COMMANDE ?</h2>
            <Field label="Nom complet" name="name" defaultValue={session?.user?.name ?? ""} errors={state?.errors?.name} />
            <Field label="E-mail" name="email" type="email" defaultValue={session?.user?.email ?? ""} errors={state?.errors?.email} />
            <Field label="Téléphone (facultatif)" name="phone" type="tel" errors={state?.errors?.phone} optional />
            <Field label="Adresse" name="address" errors={state?.errors?.address} />
            <div className="retro-field-row">
              <Field label="Ville" name="city" errors={state?.errors?.city} />
              <Field label="Code postal" name="postalCode" errors={state?.errors?.postalCode} />
            </div>
            <Field label="Pays" name="country" defaultValue="France" errors={state?.errors?.country} />
          </section>

          <aside className="retro-checkout-summary">
            <span className="retro-eyebrow">02 · RÉCAPITULATIF</span>
            <h2>VOTRE SÉLECTION</h2>
            <div className="retro-checkout-items">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size ?? ""}`}>
                  <span>{item.name}{item.size ? ` · ${item.size}` : ""} × {item.qty}</span>
                  <strong>{formatCents(item.priceCents * item.qty, item.currency)}</strong>
                </div>
              ))}
            </div>
            <dl>
              <div><dt>Sous-total ({itemCount})</dt><dd>{formatCents(subtotalCents, currency)}</dd></div>
              <div><dt>Livraison</dt><dd>{shippingCents ? formatCents(shippingCents, currency) : "Offerte"}</dd></div>
              <div className="retro-cart-total"><dt>TOTAL</dt><dd>{formatCents(totalCents, currency)}</dd></div>
            </dl>
            {state?.message && <p className="retro-checkout-error" role="alert">{state.message}</p>}
            <button type="submit" disabled={pending} className="retro-primary">
              <span>{pending ? "REDIRECTION VERS LE PAIEMENT…" : "PAYER EN TOUTE SÉCURITÉ"}</span><span>{pending ? "…" : "↗"}</span>
            </button>
            <p className="retro-secure-note">Paiement sécurisé par Stripe. Prix et stock sont revérifiés avant le paiement.</p>
          </aside>
        </form>
      </main>
    </StoreShell>
  );
}

function Field({ label, name, type = "text", defaultValue, errors, optional = false }: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  errors?: string[];
  optional?: boolean;
}) {
  return (
    <div className="retro-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} required={!optional} aria-invalid={!!errors?.length} aria-describedby={errors?.length ? `${name}-error` : undefined} />
      {errors?.map((error) => <span id={`${name}-error`} key={error}>{error}</span>)}
    </div>
  );
}
