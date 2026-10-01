"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { AuthPanel, StorePage } from "@/components/store/StorePage";

export default function InscriptionPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <StorePage eyebrow="ESPACE CLIENT" title="CRÉER UN COMPTE">
      <AuthPanel groupPhoto>
        <form action={formAction} className="retro-auth-card">
          <div className="retro-auth-head">
            <h2>REJOIGNEZ L’HISTOIRE.</h2>
            <p>Suivez vos commandes et retrouvez vos factures.</p>
          </div>
          <div className="retro-auth-fields">
            <div className="retro-field">
              <label htmlFor="name">Nom</label>
              <input id="name" name="name" type="text" placeholder="Votre nom" />
              {state?.errors?.name && <p className="retro-form-error">{state.errors.name[0]}</p>}
            </div>
            <div className="retro-field">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" name="email" type="email" placeholder="vous@exemple.com" />
              {state?.errors?.email && <p className="retro-form-error">{state.errors.email[0]}</p>}
            </div>
            <div className="retro-field">
              <label htmlFor="password">Mot de passe</label>
              <input id="password" name="password" type="password" placeholder="••••••••" />
              {state?.errors?.password && (
                <div className="retro-form-error"><p>Le mot de passe doit :</p><ul>{state.errors.password.map((error) => <li key={error}>{error}</li>)}</ul></div>
              )}
            </div>
            {state?.message && <p className={state.success ? "retro-form-success" : "retro-form-error retro-form-message"}>{state.message}</p>}
          </div>
          <button type="submit" disabled={pending || state?.success} className="retro-primary retro-submit">
            <span>{state?.success ? "E-MAIL ENVOYÉ ✓" : pending ? "CRÉATION…" : "CRÉER MON COMPTE"}</span><span>↗</span>
          </button>
          <div className="retro-auth-switch">
            Déjà un compte ? <Link href="/connexion" className="retro-text-link">Se connecter</Link>
          </div>
        </form>
      </AuthPanel>
    </StorePage>
  );
}
