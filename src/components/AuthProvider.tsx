"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Chaque lecture de session relit l'utilisateur en base : inutile de la
  // refaire à chaque retour sur l'onglet, le chargement de la page suffit.
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
