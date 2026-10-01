import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthPanel, StorePage } from "@/components/store/StorePage";

export default async function ConnexionPage(props: PageProps<"/connexion">) {
  // Déjà connecté : on renvoie directement vers sa console au lieu de réafficher le formulaire.
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/compte");
  }

  const searchParams = await props.searchParams;
  const notice =
    searchParams["compte-active"] === "1"
      ? "Votre compte est activé. Connectez-vous pour commencer."
      : searchParams.reset === "1"
        ? "Votre mot de passe a été mis à jour. Connectez-vous avec le nouveau."
        : undefined;

  return (
    <StorePage eyebrow="ESPACE CLIENT" title="CONNEXION">
      <AuthPanel groupPhoto>
        <LoginForm notice={notice} />
      </AuthPanel>
    </StorePage>
  );
}
