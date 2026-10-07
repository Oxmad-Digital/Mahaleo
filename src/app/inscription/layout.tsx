import type { Metadata } from "next";

// La page est un composant client : son titre est déclaré ici.
export const metadata: Metadata = { title: "Inscription" };

export default function Layout({ children }: LayoutProps<"/inscription">) {
  return children;
}
