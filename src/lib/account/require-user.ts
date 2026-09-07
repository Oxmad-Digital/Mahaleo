import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Garde de l'espace client : toute page sous `/compte` a besoin d'une session.
 * Les admins y ont accès comme n'importe quel client, pour leurs propres
 * commandes.
 */
export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }

  return session;
}
