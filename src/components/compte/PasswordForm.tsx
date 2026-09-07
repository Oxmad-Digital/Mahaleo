"use client";

import { useActionState, useRef } from "react";
import { changePassword } from "@/app/actions/account";
import { fieldErrorStyle, inputStyle, labelStyle, primaryButtonStyle, noticeStyle } from "./form-styles";

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (previous: Awaited<ReturnType<typeof changePassword>>, formData: FormData) => {
      const result = await changePassword(previous, formData);
      // Un mot de passe accepté ne doit pas rester dans les champs.
      if (result?.success) formRef.current?.reset();
      return result;
    },
    undefined
  );

  return (
    <form
      ref={formRef}
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
        <label htmlFor="currentPassword" style={labelStyle}>
          Mot de passe actuel
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          style={inputStyle}
        />
        {state?.errors?.currentPassword && <p style={fieldErrorStyle}>{state.errors.currentPassword[0]}</p>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="password" style={labelStyle}>
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          style={inputStyle}
        />
        {state?.errors?.password && <p style={fieldErrorStyle}>{state.errors.password[0]}</p>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="confirmPassword" style={labelStyle}>
          Confirmer le nouveau mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          style={inputStyle}
        />
        {state?.errors?.confirmPassword && <p style={fieldErrorStyle}>{state.errors.confirmPassword[0]}</p>}
      </div>

      {state?.message && <p style={noticeStyle(state.success)}>{state.message}</p>}

      <div style={{ paddingTop: 4 }}>
        <button type="submit" disabled={pending} style={primaryButtonStyle(pending)}>
          {pending ? "Mise à jour..." : "Changer le mot de passe"}
        </button>
      </div>
    </form>
  );
}
