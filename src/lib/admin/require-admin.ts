import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}
