import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthPanel, StorePage } from "@/components/store/StorePage";

export default async function ConnexionPage() {
  // Déjà connecté : on renvoie directement vers sa console au lieu de réafficher le formulaire.
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/compte");
  }

  return (
    <StorePage eyebrow="ESPACE CLIENT" title="CONNEXION">
      <AuthPanel groupPhoto>
        <LoginForm />
      </AuthPanel>
    </StorePage>
  );
}
