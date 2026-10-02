import { redirect } from "next/navigation";
import { getSession } from "@/auth";

export async function requireAdmin() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/connexion");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}
