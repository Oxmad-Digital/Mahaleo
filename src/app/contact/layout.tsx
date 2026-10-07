import type { Metadata } from "next";

// La page est un composant client : son titre est déclaré ici.
export const metadata: Metadata = { title: "Contact" };

export default function Layout({ children }: LayoutProps<"/contact">) {
  return children;
}
