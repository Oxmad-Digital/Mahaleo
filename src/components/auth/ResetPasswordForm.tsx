"use client";

import { useActionState } from "react";
import Link from "next/link";
import { capped, vmin } from "@/lib/fluid";
import { resetPassword } from "@/app/actions/password-reset";

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box",
  padding: `${vmin(13)} ${vmin(16)}`,
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--ink-border)",
  background: "#ffffff",
  fontSize: vmin(15),
  fontFamily: "inherit",
  color: "var(--ink)",
  outline: "none",
};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword.bind(null, token), undefined);

  return (
    <form
      action={formAction}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: capped(460),
        boxSizing: "border-box",
        padding: vmin(40),
        borderRadius: "var(--radius-2xl)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.88))",
        border: "1px solid var(--surface-light-border)",
        boxShadow: "0 30px 70px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        gap: vmin(26),
        color: "var(--ink)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: vmin(6), alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: vmin(26), fontWeight: 700 }}>Nouveau mot de passe</div>
        <div style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--ink-tertiary)" }}>
          Choisissez un nouveau mot de passe pour votre compte
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: vmin(16) }}>
        <div style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
          <label htmlFor="password" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
            Nouveau mot de passe
          </label>
          <input id="password" name="password" type="password" placeholder="••••••••" className="login-input" style={inputStyle} />
          {state?.errors?.password && (
            <div style={{ fontSize: vmin(12), color: "var(--brand-red, #c0392b)" }}>
              <p style={{ margin: 0 }}>Le mot de passe doit :</p>
              <ul style={{ margin: "4px 0 0", paddingLeft: vmin(18) }}>
                {state.errors.password.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
          <label htmlFor="confirmPassword" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="login-input"
            style={inputStyle}
          />
          {state?.errors?.confirmPassword && (
            <p style={{ fontSize: vmin(12), color: "var(--brand-red, #c0392b)", margin: 0 }}>
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>

        {state?.message && (
          <p style={{ fontSize: vmin(13), color: "var(--brand-red, #c0392b)", margin: 0, textAlign: "center" }}>
            {state.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="dark-cta"
        style={{
          padding: vmin(14),
          borderRadius: "var(--radius-xs)",
          background: "var(--surface-dark-solid)",
          color: "#fff",
          fontSize: vmin(15),
          fontWeight: 600,
          textAlign: "center",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.7 : 1,
          border: "none",
          boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
          fontFamily: "inherit",
        }}
      >
        {pending ? "Enregistrement..." : "Réinitialiser le mot de passe"}
      </button>

      <div style={{ fontSize: vmin(14), fontWeight: 500, textAlign: "center", color: "var(--ink-tertiary)" }}>
        <Link href="/connexion" className="link-brand" style={{ fontWeight: 700 }}>
          Retour à la connexion
        </Link>
      </div>
    </form>
  );
}
