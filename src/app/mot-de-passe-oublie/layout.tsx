import type { Metadata } from "next";

// La page est un composant client : son titre est déclaré ici.
export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function Layout({ children }: LayoutProps<"/mot-de-passe-oublie">) {
  return children;
}
