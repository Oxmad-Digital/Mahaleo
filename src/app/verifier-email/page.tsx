import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { AuthPanel, StorePage } from "@/components/store/StorePage";

export default async function VerifierEmailPage(props: PageProps<"/verifier-email">) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  // Lecture seule : l'activation attend le clic sur le bouton.
  const pending = token
    ? await prisma.pendingSignup.findUnique({
        where: { tokenHash: hashToken(token) },
        select: { name: true, expiresAt: true },
      })
    : null;
  const isValid = pending !== null && pending.expiresAt > new Date();

  return (
    <StorePage eyebrow="ESPACE CLIENT" title="ACTIVATION" backHref="/connexion" backLabel="Retour à la connexion">
      <AuthPanel>
        {isValid ? <VerifyEmailForm token={token} name={pending.name} /> : (
          <div className="retro-auth-card retro-auth-invalid">
            <div className="retro-auth-head"><h2>LIEN INVALIDE.</h2><p>Ce lien d’activation est invalide, a expiré ou a déjà servi. Si votre compte est déjà activé, connectez-vous ; sinon, inscrivez-vous à nouveau.</p></div>
            <Link href="/connexion" className="retro-primary retro-submit"><span>SE CONNECTER</span><span>↗</span></Link>
            <div className="retro-auth-switch"><Link href="/inscription" className="retro-text-link">Créer un compte</Link></div>
          </div>
        )}
      </AuthPanel>
    </StorePage>
  );
}
