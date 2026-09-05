"use client";

import { useActionState } from "react";
import { inviteAdmin } from "@/app/actions/settings";
import type { InviteAdminState } from "@/lib/definitions";

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

export function AdminInviteForm() {
  const [state, formAction, pending] = useActionState<InviteAdminState, FormData>(inviteAdmin, undefined);

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
        <label htmlFor="admin-name" style={labelStyle}>
          Nom
        </label>
        <input id="admin-name" name="name" type="text" placeholder="Nom complet" style={inputStyle} />
        {state?.errors?.name && <FieldError messages={state.errors.name} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="admin-email" style={labelStyle}>
          E-mail
        </label>
        <input id="admin-email" name="email" type="email" placeholder="prenom@mahaleo.fr" style={inputStyle} />
        {state?.errors?.email && <FieldError messages={state.errors.email} />}
      </div>

      {state?.message && <p style={{ fontSize: 13, color: "#a82c2c", margin: 0 }}>{state.message}</p>}
      {state?.success && (
        <p style={{ fontSize: 13, color: "var(--brand-green, #1c6b3a)", margin: 0 }}>
          Compte administrateur créé. Un e-mail a été envoyé pour définir le mot de passe.
        </p>
      )}

      <div>
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
          {pending ? "Envoi..." : "Ajouter un administrateur"}
        </button>
      </div>
    </form>
  );
}

function FieldError({ messages }: { messages: string[] }) {
  return <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{messages[0]}</p>;
}
