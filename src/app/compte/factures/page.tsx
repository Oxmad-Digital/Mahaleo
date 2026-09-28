import { requireUser } from "@/lib/account/require-user";
import { getAccountInvoicesData } from "@/lib/account/orders";
import { AccountShell } from "@/components/compte/AccountShell";
import { AccountInvoicesTable } from "@/components/compte/AccountInvoicesTable";

export default async function AccountInvoicesPage(props: PageProps<"/compte/factures">) {
  const session = await requireUser();
  const searchParams = await props.searchParams;

  const pageParam = Number(searchParams.page);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const data = await getAccountInvoicesData({ userId: session.user.id, page });

  return (
    <AccountShell
      breadcrumb={[{ label: "Mon espace", href: "/compte" }, { label: "Factures" }]}
      active="factures"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div className="admin-page-header-row retro-account-page-heading" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="retro-admin-kicker">Documents · paiements</span>
        <div className="admin-page-title">
          Mes factures
        </div>
        <div style={{ fontSize: 15, color: "rgba(55,53,47,0.6)" }}>
          Chaque commande payée génère une facture, consultable et imprimable en PDF.
        </div>
      </div>

      <AccountInvoicesTable data={data} />
    </AccountShell>
  );
}
