"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { capped, vmin } from "@/lib/fluid";
import { login } from "@/app/actions/auth";

export default function ConnexionPage() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [remember, setRemember] = useState(true);

  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <BackLink href="/" label="Continuer mes achats" />
          </>
        }
        right={<Breadcrumb items={["Boutique", "Connexion"]} />}
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
          <div style={{ fontSize: vmin(26), fontWeight: 700 }}>Connexion</div>
          <div style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--ink-tertiary)" }}>
            Accédez à votre compte pour suivre vos commandes
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: vmin(16) }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
            <label htmlFor="password" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="login-input"
              style={inputStyle}
            />
            {state?.errors?.password && (
              <p style={{ fontSize: vmin(12), color: "var(--brand-red, #c0392b)", margin: 0 }}>
                {state.errors.password[0]}
              </p>
            )}
          </div>
          {state?.message && (
            <p style={{ fontSize: vmin(13), color: "var(--brand-red, #c0392b)", margin: 0, textAlign: "center" }}>
              {state.message}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: vmin(8),
                fontSize: vmin(13),
                fontWeight: 500,
                color: "var(--ink-tertiary)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: vmin(16), height: vmin(16), accentColor: "var(--brand-green)" }}
              />
              Se souvenir de moi
            </label>
            <Link
              href="/mot-de-passe-oublie"
              className="link-brand"
              style={{ fontSize: vmin(13), fontWeight: 600 }}
            >
              Mot de passe oublié ?
            </Link>
          </div>
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
          {pending ? "Connexion..." : "Se connecter"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: vmin(12) }}>
          <div style={{ flex: 1, height: 1, background: "var(--ink-border)" }} />
          <span style={{ fontSize: vmin(12), fontWeight: 600, color: "var(--ink-quaternary)", whiteSpace: "nowrap" }}>
            ou
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--ink-border)" }} />
        </div>

        <div style={{ fontSize: vmin(14), fontWeight: 500, textAlign: "center", color: "var(--ink-tertiary)" }}>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="link-brand" style={{ fontWeight: 700 }}>
            Créer un compte
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
