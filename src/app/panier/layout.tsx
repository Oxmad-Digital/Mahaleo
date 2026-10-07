import type { Metadata } from "next";

// La page est un composant client : son titre est déclaré ici.
export const metadata: Metadata = { title: "Panier" };

export default function Layout({ children }: LayoutProps<"/panier">) {
  return children;
}
