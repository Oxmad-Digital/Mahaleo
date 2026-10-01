"use client";

import { useActionState } from "react";
import Link from "next/link";
import { confirmSignup } from "@/app/actions/auth";

export function VerifyEmailForm({ token, name }: { token: string; name: string }) {
  const [state, formAction, pending] = useActionState(() => confirmSignup(token), undefined);
  return (
    <form action={formAction} className="retro-auth-card">
      <div className="retro-auth-head">
        <h2>BIENVENUE, {name.toUpperCase()}.</h2>
        <p>Confirmez votre adresse e-mail pour activer votre compte.</p>
      </div>
      {state?.message && (
        <div className="retro-auth-fields">
          <p className="retro-form-error retro-form-message">{state.message}</p>
        </div>
      )}
      <button type="submit" disabled={pending} className="retro-primary retro-submit">
        <span>{pending ? "ACTIVATION…" : "ACTIVER MON COMPTE"}</span><span>↗</span>
      </button>
      <div className="retro-auth-switch"><Link href="/connexion" className="retro-text-link">Retour à la connexion</Link></div>
    </form>
  );
}
