"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/app/actions/password-reset";
import { PasswordInput } from "@/components/auth/PasswordInput";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword.bind(null, token), undefined);
  return (
    <form action={formAction} className="retro-auth-card">
      <div className="retro-auth-head">
        <h2>NOUVEAU MOT DE PASSE.</h2>
        <p>Choisissez un nouveau mot de passe pour votre compte.</p>
      </div>
      <div className="retro-auth-fields">
        <div className="retro-field">
          <label htmlFor="password">Nouveau mot de passe</label>
          <PasswordInput id="password" name="password" placeholder="••••••••" autoComplete="new-password" />
          {state?.errors?.password && <div className="retro-form-error"><p>Le mot de passe doit :</p><ul>{state.errors.password.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        </div>
        <div className="retro-field">
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="••••••••" autoComplete="new-password" />
          {state?.errors?.confirmPassword && <p className="retro-form-error">{state.errors.confirmPassword[0]}</p>}
        </div>
        {state?.message && <p className="retro-form-error retro-form-message">{state.message}</p>}
      </div>
      <button type="submit" disabled={pending} className="retro-primary retro-submit"><span>{pending ? "ENREGISTREMENT…" : "RÉINITIALISER"}</span><span>↗</span></button>
      <div className="retro-auth-switch"><Link href="/connexion" className="retro-text-link">Retour à la connexion</Link></div>
    </form>
  );
}
