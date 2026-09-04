"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ClientFormState } from "@/lib/definitions";

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

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(55,53,47,0.7)",
};

export function ClientForm({
  action,
  initial,
}: {
  action: (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  initial: { name: string; email: string };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      style={{
        padding: "24px 24px 22px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 480,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="name" style={labelStyle}>
          Nom
        </label>
        <input id="name" name="name" type="text" defaultValue={initial.name} placeholder="Nom du client" style={inputStyle} />
        {state?.errors?.name && <FieldError messages={state.errors.name} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="email" style={labelStyle}>
          E-mail
        </label>
        <input id="email" name="email" type="email" defaultValue={initial.email} placeholder="client@exemple.com" style={inputStyle} />
        {state?.errors?.email && <FieldError messages={state.errors.email} />}
      </div>

      {state?.message && <p style={{ fontSize: 13, color: "#a82c2c", margin: 0 }}>{state.message}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "none",
            background: "var(--brand-green, #1c6b3a)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
        <Link
          href="/admin/clients"
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "1px solid rgba(55,53,47,0.09)",
            fontSize: 14,
            fontWeight: 500,
            color: "#37352f",
          }}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}

function FieldError({ messages }: { messages: string[] }) {
  return <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{messages[0]}</p>;
}
