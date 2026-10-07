import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthPanel, StorePage } from "@/components/store/StorePage";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ReinitialiserMotDePassePage(props: PageProps<"/reinitialiser-mot-de-passe">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  return (
    <StorePage eyebrow="ESPACE CLIENT" title="RÉINITIALISATION" backHref="/connexion" backLabel="Retour à la connexion">
      <AuthPanel>
        {token ? <ResetPasswordForm token={token} /> : (
          <div className="retro-auth-card retro-auth-invalid">
            <div className="retro-auth-head"><h2>LIEN INVALIDE.</h2><p>Ce lien est manquant ou incomplet. Demandez-en un nouveau.</p></div>
            <Link href="/mot-de-passe-oublie" className="retro-primary retro-submit"><span>DEMANDER UN LIEN</span><span>↗</span></Link>
          </div>
        )}
      </AuthPanel>
    </StorePage>
  );
}
