"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { StoreShell } from "@/components/store/StoreChrome";
import { formatCents } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { SHIPPING_COUNTRIES, shippingCostCents } from "@/lib/shipping";
import { useCartRefresh } from "@/lib/use-cart-refresh";
import { createCheckoutSession, type CheckoutCartItem } from "@/app/actions/checkout";

export default function CheckoutPage() {
  const { items, itemCount, subtotalCents, hydrated } = useCart();
  const { notices, refreshed } = useCartRefresh();
  const { data: session } = useSession();
  const router = useRouter();
  const cartItems: CheckoutCartItem[] = items.map(({ productId, size, qty }) => ({ productId, size, qty }));
  const [state, formAction, pending] = useActionState(createCheckoutSession.bind(null, cartItems), undefined);

  useEffect(() => {
    if (hydrated && refreshed && items.length === 0) router.replace("/panier");
  }, [hydrated, refreshed, items.length, router]);

  if (!hydrated || items.length === 0) return null;

  const shippingCents = shippingCostCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;
  const currency = items[0]?.currency ?? "EUR";
  // Après une erreur, React réinitialise le formulaire : les valeurs saisies
  // reviennent par l'état de l'action et servent de valeurs par défaut.
  const fields = state?.fields;

  return (
    <StoreShell className="retro-checkout-page">
      <main className="retro-checkout-main">
        <div className="retro-cart-title">
          <div><span>ÉTAPE FINALE</span><h1>LA COMMANDE</h1></div>
          <Link href="/panier">← Retour au panier</Link>
        </div>

        {notices.length > 0 && (
          <ul className="retro-cart-notices" role="status">
            {notices.map((notice) => <li key={notice}>{notice}</li>)}
          </ul>
        )}

        <form action={formAction} className="retro-checkout-layout">
          <section className="retro-checkout-form">
            <span className="retro-eyebrow">01 · COORDONNÉES &amp; LIVRAISON</span>
            <h2>OÙ ENVOYER VOTRE COMMANDE ?</h2>
            <Field label="Nom complet" name="name" autoComplete="name" defaultValue={fields?.name ?? session?.user?.name ?? ""} errors={state?.errors?.name} />
            <Field label="E-mail" name="email" type="email" autoComplete="email" defaultValue={fields?.email ?? session?.user?.email ?? ""} errors={state?.errors?.email} />
            <Field label="Téléphone (facultatif)" name="phone" type="tel" autoComplete="tel" defaultValue={fields?.phone} errors={state?.errors?.phone} optional />
            <Field label="Adresse" name="address" autoComplete="street-address" defaultValue={fields?.address} errors={state?.errors?.address} />
            <div className="retro-field-row">
              <Field label="Ville" name="city" autoComplete="address-level2" defaultValue={fields?.city} errors={state?.errors?.city} />
              <Field label="Code postal" name="postalCode" autoComplete="postal-code" defaultValue={fields?.postalCode} errors={state?.errors?.postalCode} />
            </div>
            <div className="retro-field">
              <label htmlFor="country">Pays</label>
              {/* La clé remonte la liste : un select déjà monté ignore un nouveau defaultValue. */}
              <select key={fields?.country ?? "initial"} id="country" name="country" autoComplete="country" required defaultValue={fields?.country ?? "FR"} aria-invalid={!!state?.errors?.country?.length} aria-describedby={state?.errors?.country?.length ? "country-error" : undefined}>
                {SHIPPING_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>{country.label}</option>
                ))}
              </select>
              {state?.errors?.country?.map((error) => <span id="country-error" key={error}>{error}</span>)}
            </div>
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
            <label className="retro-checkout-terms">
              <input type="checkbox" name="terms" required defaultChecked={fields?.terms} aria-invalid={!!state?.errors?.terms?.length} />
              <span>
                J&apos;ai lu et j&apos;accepte les{" "}
                <Link href="/conditions-de-vente" target="_blank">conditions générales de vente</Link>.
              </span>
              {state?.errors?.terms?.map((error) => <span key={error} className="retro-checkout-terms-error">{error}</span>)}
            </label>
            {state?.message && <p className="retro-checkout-error" role="alert">{state.message}</p>}
            <button type="submit" disabled={pending || !refreshed} className="retro-primary">
              <span>{pending ? "REDIRECTION VERS LE PAIEMENT…" : "PAYER EN TOUTE SÉCURITÉ"}</span><span>{pending ? "…" : "↗"}</span>
            </button>
            <p className="retro-secure-note">Paiement sécurisé par Stripe, débité à la validation de la commande. Prix et stock sont revérifiés avant le paiement.</p>
          </aside>
        </form>
      </main>
    </StoreShell>
  );
}

function Field({ label, name, type = "text", autoComplete, defaultValue, errors, optional = false }: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  errors?: string[];
  optional?: boolean;
}) {
  return (
    <div className="retro-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} defaultValue={defaultValue} required={!optional} aria-invalid={!!errors?.length} aria-describedby={errors?.length ? `${name}-error` : undefined} />
      {errors?.map((error) => <span id={`${name}-error`} key={error}>{error}</span>)}
    </div>
  );
}
