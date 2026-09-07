import type { ReactNode } from "react";
import { ConsoleShell, type ConsoleNavItem, type Crumb } from "@/components/console/ConsoleShell";

export type AccountNavKey = "dashboard" | "commandes" | "factures" | "profil";

const NAV_ITEMS: (ConsoleNavItem & { key: AccountNavKey })[] = [
  { key: "dashboard", label: "Mon espace", href: "/compte", icon: "grid" },
  { key: "commandes", label: "Mes commandes", href: "/compte/commandes", icon: "cart" },
  { key: "factures", label: "Mes factures", href: "/compte/factures", icon: "receipt" },
  { key: "profil", label: "Mon profil", href: "/compte/profil", icon: "users" },
];

export function AccountShell({
  breadcrumb,
  active,
  userName,
  userEmail,
  children,
}: {
  breadcrumb: Crumb[];
  active: AccountNavKey;
  userName: string | null | undefined;
  userEmail: string;
  children: ReactNode;
}) {
  return (
    <ConsoleShell
      nav={NAV_ITEMS}
      active={active}
      breadcrumb={breadcrumb}
      userName={userName}
      userEmail={userEmail}
      variant="account"
    >
      {children}
    </ConsoleShell>
  );
}
