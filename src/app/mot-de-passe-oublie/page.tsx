"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { capped, vmin } from "@/lib/fluid";
import { requestPasswordReset } from "@/app/actions/password-reset";

export default function MotDePasseOubliePage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <BackLink href="/connexion" label="Retour à la connexion" />
          </>
        }
        right={<Breadcrumb items={["Boutique", "Connexion", "Mot de passe oublié"]} />}
      />

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
          <div style={{ fontSize: vmin(26), fontWeight: 700 }}>Mot de passe oublié</div>
          <div style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--ink-tertiary)" }}>
            Indiquez votre adresse e-mail, nous vous enverrons un lien de réinitialisation
          </div>
        </div>

        {state?.success ? (
          <p style={{ fontSize: vmin(14), fontWeight: 500, textAlign: "center", color: "var(--ink)", margin: 0 }}>
            Si un compte existe avec cette adresse, vous allez recevoir un e-mail contenant un lien pour réinitialiser
            votre mot de passe.
          </p>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
              <label htmlFor="email" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                className="login-input"
                style={inputStyle}
              />
              {state?.errors?.email && (
                <p style={{ fontSize: vmin(12), color: "var(--brand-red, #c0392b)", margin: 0 }}>
                  {state.errors.email[0]}
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
              {pending ? "Envoi..." : "Envoyer le lien"}
            </button>
          </>
        )}

        <div style={{ fontSize: vmin(14), fontWeight: 500, textAlign: "center", color: "var(--ink-tertiary)" }}>
          <Link href="/connexion" className="link-brand" style={{ fontWeight: 700 }}>
            Retour à la connexion
          </Link>
        </div>
      </form>

      <IconRail active="profile" />
      <Footer />
    </Scene>
  );
}

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
