"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { login } from "@/app/actions/auth";
import type { LoginFormState } from "@/lib/definitions";

export function LoginForm() {
  const router = useRouter();
  const { update } = useSession();
  const [state, formAction, pending] = useActionState(
    async (prev: LoginFormState, formData: FormData) => {
      const result = await login(prev, formData);
      if (result?.redirectTo) {
        // Rafraîchit la session côté client, sinon le header de la boutique
        // continue d'afficher « Connexion » après être passé par l'espace admin/client.
        await update();
        router.replace(result.redirectTo);
      }
      return result;
    },
    undefined
  );
  const [remember, setRemember] = useState(true);

  return (
    <form action={formAction} className="retro-auth-card">
      <div className="retro-auth-head">
        <h2>HEUREUX DE VOUS REVOIR.</h2>
        <p>Accédez à votre compte pour suivre vos commandes.</p>
      </div>
      <div className="retro-auth-fields">
        <div className="retro-field">
          <label htmlFor="email">Adresse e-mail</label>
          <input id="email" name="email" type="email" placeholder="vous@exemple.com" />
          {state?.errors?.email && <p className="retro-form-error">{state.errors.email[0]}</p>}
        </div>
        <div className="retro-field">
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" placeholder="••••••••" />
          {state?.errors?.password && <p className="retro-form-error">{state.errors.password[0]}</p>}
        </div>
        {state?.message && <p className="retro-form-error retro-form-message">{state.message}</p>}
        <div className="retro-auth-row">
          <label className="retro-check">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            Se souvenir de moi
          </label>
          <Link href="/mot-de-passe-oublie" className="retro-text-link">Mot de passe oublié ?</Link>
        </div>
      </div>
      <button type="submit" disabled={pending} className="retro-primary retro-submit">
        <span>{pending ? "CONNEXION…" : "SE CONNECTER"}</span><span>↗</span>
      </button>
      <div className="retro-auth-switch">
        Pas encore de compte ? <Link href="/inscription" className="retro-text-link">Créer un compte</Link>
      </div>
    </form>
  );
}
