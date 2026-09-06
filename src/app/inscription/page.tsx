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
import { signup } from "@/app/actions/auth";

export default function InscriptionPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <Scene className="scene-mobile">
      <TopBar
        className="scene-topbar"
        left={
          <>
            <LogoPill />
            <BackLink href="/" label="Continuer mes achats" />
          </>
        }
        right={<Breadcrumb className="auth-crumb" items={["Boutique", "Inscription"]} />}
      />

      <form
        action={formAction}
        className="auth-card"
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
        <div className="auth-head" style={{ display: "flex", flexDirection: "column", gap: vmin(6), alignItems: "center", textAlign: "center" }}>
          <div className="auth-title" style={{ fontSize: vmin(26), fontWeight: 700 }}>Créer un compte</div>
          <div className="auth-subtitle" style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--ink-tertiary)" }}>
            Rejoignez-nous pour suivre vos commandes et vos favoris
          </div>
        </div>

        <div className="auth-fields" style={{ display: "flex", flexDirection: "column", gap: vmin(16) }}>
          <div className="auth-field" style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
            <label htmlFor="name" className="auth-label" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
              Nom
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Votre nom"
              className="login-input auth-input"
              style={inputStyle}
            />
            {state?.errors?.name && (
              <p className="auth-error" style={{ fontSize: vmin(12), color: "var(--brand-red, #c0392b)", margin: 0 }}>
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div className="auth-field" style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
            <label htmlFor="email" className="auth-label" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              className="login-input auth-input"
              style={inputStyle}
            />
            {state?.errors?.email && (
              <p className="auth-error" style={{ fontSize: vmin(12), color: "var(--brand-red, #c0392b)", margin: 0 }}>
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div className="auth-field" style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
            <label htmlFor="password" className="auth-label" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="login-input auth-input"
              style={inputStyle}
            />
            {state?.errors?.password && (
              <div className="auth-error" style={{ fontSize: vmin(12), color: "var(--brand-red, #c0392b)" }}>
                <p style={{ margin: 0 }}>Le mot de passe doit :</p>
                <ul style={{ margin: "4px 0 0", paddingLeft: vmin(18) }}>
                  {state.errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {state?.message && (
            <p className="auth-error" style={{ fontSize: vmin(13), color: "var(--brand-red, #c0392b)", margin: 0, textAlign: "center" }}>
              {state.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="dark-cta auth-submit"
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
          {pending ? "Création..." : "Créer mon compte"}
        </button>

        <div className="auth-switch" style={{ fontSize: vmin(14), fontWeight: 500, textAlign: "center", color: "var(--ink-tertiary)" }}>
          Déjà un compte ?{" "}
          <Link href="/connexion" className="link-brand" style={{ fontWeight: 700 }}>
            Se connecter
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
