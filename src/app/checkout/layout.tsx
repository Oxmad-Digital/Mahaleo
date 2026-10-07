import type { Metadata } from "next";

// La page est un composant client : son titre est déclaré ici.
export const metadata: Metadata = { title: "Commande" };

export default function Layout({ children }: LayoutProps<"/checkout">) {
  return children;
}
