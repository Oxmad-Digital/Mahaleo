import Link from "next/link";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { capped, vmin } from "@/lib/fluid";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ReinitialiserMotDePassePage(props: PageProps<"/reinitialiser-mot-de-passe">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <BackLink href="/connexion" label="Retour à la connexion" />
          </>
        }
        right={<Breadcrumb items={["Boutique", "Connexion", "Réinitialisation"]} />}
      />

      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div
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
            gap: vmin(16),
            alignItems: "center",
            textAlign: "center",
            color: "var(--ink)",
          }}
        >
          <div style={{ fontSize: vmin(20), fontWeight: 700 }}>Lien invalide</div>
          <p style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--ink-tertiary)", margin: 0 }}>
            Ce lien de réinitialisation est manquant ou incomplet. Demandez-en un nouveau depuis la page de connexion.
          </p>
          <Link href="/mot-de-passe-oublie" className="link-brand" style={{ fontWeight: 700, fontSize: vmin(14) }}>
            Demander un nouveau lien
          </Link>
        </div>
      )}

      <IconRail active="profile" />
      <Footer />
    </Scene>
  );
}
