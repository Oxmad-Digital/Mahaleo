"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendContactMessage } from "@/app/actions/contact";
import { AuthPanel, StorePage } from "@/components/store/StorePage";

export default function ContactPage() {
  const [state, formAction, pending] = useActionState(sendContactMessage, undefined);
  return (
    <StorePage eyebrow="SERVICE CLIENT" title="NOUS CONTACTER">
      <AuthPanel
        notes={
          <aside className="retro-auth-notes" aria-label="Avant de nous écrire">
            <span className="retro-eyebrow">AVANT DE NOUS ÉCRIRE</span>
            <ol>
              <li><strong>01</strong><span>Une question sur une commande ? Indiquez son numéro dans votre message.</span></li>
              <li><strong>02</strong><span>Nous vous répondons par e-mail, à l’adresse que vous saisissez.</span></li>
              <li><strong>03</strong><span>Retours et échanges : consultez nos <Link href="/conditions-de-vente" className="retro-text-link">conditions de vente</Link>.</span></li>
            </ol>
            <p>Le nom d’un groupe. Le lien entre des générations.</p>
          </aside>
        }
      >
        <form action={formAction} className="retro-auth-card">
          <div className="retro-auth-head">
            <h2>UNE QUESTION ?</h2>
            <p>Écrivez-nous, nous revenons vers vous rapidement.</p>
          </div>
          {state?.success ? (
            <p className="retro-auth-notice">Merci, votre message est bien parti. Nous vous répondrons par e-mail.</p>
          ) : (
            <>
              <div className="retro-field">
                <label htmlFor="name">Nom</label>
                <input id="name" name="name" type="text" autoComplete="name" placeholder="Votre nom" defaultValue={state?.fields?.name} aria-invalid={!!state?.errors?.name} />
                {state?.errors?.name && <p className="retro-form-error">{state.errors.name[0]}</p>}
              </div>
              <div className="retro-field">
                <label htmlFor="email">Adresse e-mail</label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" defaultValue={state?.fields?.email} aria-invalid={!!state?.errors?.email} />
                {state?.errors?.email && <p className="retro-form-error">{state.errors.email[0]}</p>}
              </div>
              <div className="retro-field">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" placeholder="Votre message" defaultValue={state?.fields?.message} aria-invalid={!!state?.errors?.message} />
                {state?.errors?.message && <p className="retro-form-error">{state.errors.message[0]}</p>}
              </div>
              {state?.message && <p className="retro-form-error">{state.message}</p>}
              <button type="submit" disabled={pending} className="retro-primary retro-submit">
                <span>{pending ? "ENVOI…" : "ENVOYER LE MESSAGE"}</span><span>↗</span>
              </button>
            </>
          )}
        </form>
      </AuthPanel>
    </StorePage>
  );
}
