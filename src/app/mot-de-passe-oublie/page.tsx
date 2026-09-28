"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/password-reset";
import { AuthPanel, StorePage } from "@/components/store/StorePage";

export default function MotDePasseOubliePage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <StorePage eyebrow="ESPACE CLIENT" title="MOT DE PASSE OUBLIÉ" backHref="/connexion" backLabel="Retour à la connexion">
      <AuthPanel>
        <form action={formAction} className="retro-auth-card">
          <div className="retro-auth-head">
            <h2>RETROUVEZ VOTRE COMPTE.</h2>
            <p>Nous vous enverrons un lien de réinitialisation par e-mail.</p>
          </div>
          {state?.success ? (
            <p className="retro-auth-notice">Si un compte existe avec cette adresse, le lien vient de partir.</p>
          ) : (
            <>
              <div className="retro-field">
                <label htmlFor="email">Adresse e-mail</label>
                <input id="email" name="email" type="email" placeholder="vous@exemple.com" />
                {state?.errors?.email && <p className="retro-form-error">{state.errors.email[0]}</p>}
              </div>
              <button type="submit" disabled={pending} className="retro-primary retro-submit">
                <span>{pending ? "ENVOI…" : "ENVOYER LE LIEN"}</span><span>↗</span>
              </button>
            </>
          )}
          <div className="retro-auth-switch"><Link href="/connexion" className="retro-text-link">Retour à la connexion</Link></div>
        </form>
      </AuthPanel>
    </StorePage>
  );
}
