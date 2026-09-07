"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/account";
import { fieldErrorStyle, inputStyle, labelStyle, primaryButtonStyle, noticeStyle } from "./form-styles";

export function ProfileForm({ initial }: { initial: { name: string; email: string } }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);

  return (
    <form
      action={formAction}
      className="admin-order-form-grid"
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
        <input id="name" name="name" type="text" defaultValue={initial.name} placeholder="Votre nom" style={inputStyle} />
        {state?.errors?.name && <p style={fieldErrorStyle}>{state.errors.name[0]}</p>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="email" style={labelStyle}>
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={initial.email}
          placeholder="vous@exemple.com"
          style={inputStyle}
        />
        {state?.errors?.email && <p style={fieldErrorStyle}>{state.errors.email[0]}</p>}
        <p style={{ fontSize: 12, color: "rgba(55,53,47,0.45)", margin: 0 }}>
          {"C'est l'adresse utilisée pour vous connecter et recevoir le suivi de vos commandes. Après un changement, reconnectez-vous pour la voir partout."}
        </p>
      </div>

      {state?.message && <p style={noticeStyle(state.success)}>{state.message}</p>}

      <div style={{ paddingTop: 4 }}>
        <button type="submit" disabled={pending} style={primaryButtonStyle(pending)}>
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
