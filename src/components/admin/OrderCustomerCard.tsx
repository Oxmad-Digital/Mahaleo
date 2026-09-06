"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { countryLabel } from "@/lib/country-label";
import type { OrderCustomerState } from "@/lib/definitions";

const BORDER = "1px solid rgba(55,53,47,0.09)";

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "9px 12px",
  borderRadius: 6,
  border: "1px solid rgba(55,53,47,0.15)",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#37352f",
  outline: "none",
};

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "rgba(55,53,47,0.7)" };

export type OrderCustomer = {
  customerName: string;
  customerEmail: string;
  phone: string | null;
  shippingAddress: string;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCountry: string;
};

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (email[0] ?? "?").toUpperCase();
}

export function OrderCustomerCard({
  action,
  customer,
  accountId,
}: {
  action: (state: OrderCustomerState, formData: FormData) => Promise<OrderCustomerState>;
  customer: OrderCustomer;
  accountId: string | null;
}) {
  const [editing, setEditing] = useState(false);

  // La fiche repasse en lecture dès que la mise à jour est acceptée.
  const [state, formAction, pending] = useActionState<OrderCustomerState, FormData>(async (previous, formData) => {
    const result = await action(previous, formData);
    if (result?.success) setEditing(false);
    return result;
  }, undefined);

  return (
    <div style={{ padding: "22px 24px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(55,53,47,0.45)", letterSpacing: "0.04em" }}>CLIENT</div>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: BORDER,
            background: "transparent",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            color: "#37352f",
            cursor: "pointer",
          }}
        >
          {editing ? "Fermer" : "Corriger"}
        </button>
      </div>

      {editing ? (
        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="admin-order-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Nom" name="customerName" defaultValue={customer.customerName} errors={state?.errors?.customerName} />
            <Field
              label="E-mail"
              name="customerEmail"
              type="email"
              defaultValue={customer.customerEmail}
              errors={state?.errors?.customerEmail}
            />
            <Field label="Téléphone" name="phone" defaultValue={customer.phone ?? ""} errors={state?.errors?.phone} />
            <Field
              label="Pays (code ISO)"
              name="shippingCountry"
              defaultValue={customer.shippingCountry}
              errors={state?.errors?.shippingCountry}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <Field
                label="Adresse"
                name="shippingAddress"
                defaultValue={customer.shippingAddress}
                errors={state?.errors?.shippingAddress}
              />
            </div>
            <Field
              label="Code postal"
              name="shippingPostalCode"
              defaultValue={customer.shippingPostalCode}
              errors={state?.errors?.shippingPostalCode}
            />
            <Field label="Ville" name="shippingCity" defaultValue={customer.shippingCity} errors={state?.errors?.shippingCity} />
          </div>

          {state?.message && <p style={{ fontSize: 13, color: "#a82c2c", margin: 0 }}>{state.message}</p>}

          <p style={{ fontSize: 13, color: "rgba(55,53,47,0.5)", margin: 0 }}>
            Corrigez l&apos;adresse avant de générer l&apos;étiquette : une étiquette déjà émise n&apos;est pas mise à jour.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                padding: "9px 16px",
                borderRadius: 6,
                border: "none",
                background: "var(--brand-green, #1c6b3a)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: pending ? "default" : "pointer",
                opacity: pending ? 0.7 : 1,
              }}
            >
              {pending ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={pending}
              style={{
                padding: "9px 16px",
                borderRadius: 6,
                border: BORDER,
                background: "transparent",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "inherit",
                color: "#37352f",
                cursor: pending ? "default" : "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="admin-order-customer-row" style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 180 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "#37352f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                flex: "none",
              }}
            >
              {initials(customer.customerName, customer.customerEmail)}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{customer.customerName}</span>
              {accountId ? (
                <Link href={`/admin/clients/${accountId}`} style={{ fontSize: 12, fontWeight: 500, color: "var(--brand-green, #1c6b3a)" }}>
                  Voir la fiche client
                </Link>
              ) : (
                <span style={{ fontSize: 12, color: "rgba(55,53,47,0.45)" }}>Commande sans compte</span>
              )}
            </div>
          </div>

          <ReadField label="E-mail" value={customer.customerEmail} />
          <ReadField label="Téléphone" value={customer.phone ?? "—"} />
          <ReadField
            label="Adresse de livraison"
            value={`${customer.shippingAddress} · ${customer.shippingPostalCode} ${customer.shippingCity} · ${countryLabel(customer.shippingCountry)}`}
          />
        </div>
      )}
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 140 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(55,53,47,0.45)", letterSpacing: "0.04em" }}>
        {label.toUpperCase()}
      </span>
      <span style={{ fontSize: 14 }}>{value}</span>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  errors,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  errors?: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label htmlFor={name} style={labelStyle}>
        {label}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} style={inputStyle} />
      {errors && <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{errors[0]}</p>}
    </div>
  );
}
