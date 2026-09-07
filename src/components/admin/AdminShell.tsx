import type { ReactNode } from "react";
import { ConsoleShell, type ConsoleNavItem, type Crumb } from "@/components/console/ConsoleShell";

type AdminNavKey = "dashboard" | "commandes" | "produits" | "clients" | "factures" | "statistiques" | "parametres";

const NAV_ITEMS: (ConsoleNavItem & { key: AdminNavKey })[] = [
  { key: "dashboard", label: "Tableau de bord", href: "/admin", icon: "grid" },
  { key: "commandes", label: "Commandes", href: "/admin/commandes", icon: "cart" },
  { key: "produits", label: "Produits", href: "/admin/produits", icon: "package" },
  { key: "clients", label: "Clients", href: "/admin/clients", icon: "users" },
  { key: "factures", label: "Factures", href: "/admin/factures", icon: "receipt" },
  { key: "statistiques", label: "Statistiques", href: "/admin/statistiques", icon: "chart" },
  { key: "parametres", label: "Réglages", href: "/admin/parametres", icon: "settings" },
];

export function AdminShell({
  breadcrumb,
  active,
  userName,
  userEmail,
  children,
}: {
  breadcrumb: Crumb[];
  active: AdminNavKey;
  userName: string | null | undefined;
  userEmail: string;
  children: ReactNode;
}) {
  return (
    <ConsoleShell nav={NAV_ITEMS} active={active} breadcrumb={breadcrumb} userName={userName} userEmail={userEmail}>
      {children}
    </ConsoleShell>
  );
}
