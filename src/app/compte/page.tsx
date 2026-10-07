import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/account/require-user";
import { getAccountOverview } from "@/lib/account/orders";
import { AccountShell } from "@/components/compte/AccountShell";
import { AccountLatestOrders } from "@/components/compte/AccountLatestOrders";
import { StatCard } from "@/components/admin/StatCard";
import { formatCents, formatNumber } from "@/lib/format";
import { countryLabel } from "@/lib/country-label";
import { SUPPORT_EMAIL } from "@/lib/emails/constants";

export const metadata: Metadata = { title: "Mon compte" };

const BORDER = "1px solid rgba(55,53,47,0.09)";
const MUTED = "rgba(55,53,47,0.45)";

export default async function AccountDashboardPage() {
  const session = await requireUser();
  const overview = await getAccountOverview(session.user.id);

  const firstName = session.user.name?.trim().split(/\s+/)[0];
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const address = overview.lastAddress;

  return (
    <AccountShell
      breadcrumb={[{ label: "Mon espace" }]}
      active="dashboard"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div className="retro-admin-page-heading">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="retro-admin-kicker">Votre espace · boutique officielle</span>
          <div className="admin-page-title">
            Bonjour {firstName ?? "et bienvenue"}
          </div>
          <div className="retro-admin-date">{today}</div>
        </div>
        <Link
          className="retro-account-shop-link"
          href="/"
          style={{ padding: "9px 16px", borderRadius: 6, border: BORDER, fontSize: 14, fontWeight: 500, color: "#37352f" }}
        >
          Continuer mes achats
        </Link>
      </div>

      <div className="retro-admin-stats retro-account-stats">
        <StatCard
          label="Commandes"
          value={formatNumber(overview.orderCount)}
          hint={`${formatNumber(overview.activeCount)} en cours`}
        />
        <StatCard label="Total dépensé" value={formatCents(overview.totalSpentCents)} hint="hors commandes annulées" />
        <StatCard label="Factures" value={formatNumber(overview.invoiceCount)} hint="disponibles au téléchargement" tint />
      </div>

      <div
        className="admin-dashboard-split retro-admin-dashboard-split"
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", gap: 12, alignItems: "stretch" }}
      >
        <AccountLatestOrders orders={overview.latestOrders} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="retro-account-card" style={{ padding: "22px 24px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>DERNIÈRE ADRESSE DE LIVRAISON</div>
            {address ? (
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600 }}>{address.customerName}</div>
                <div style={{ color: "rgba(55,53,47,0.7)" }}>
                  {address.shippingAddress}
                  <br />
                  {address.shippingPostalCode} {address.shippingCity}, {countryLabel(address.shippingCountry)}
                  {address.phone ? (
                    <>
                      <br />
                      {address.phone}
                    </>
                  ) : null}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "rgba(55,53,47,0.55)", margin: 0, lineHeight: 1.6 }}>
                Aucune adresse enregistrée : elle sera reprise de votre première commande.
              </p>
            )}
            <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6 }}>
              {"L'adresse de livraison est saisie à chaque commande, vous pouvez la modifier lors du paiement."}
            </p>
          </div>

          <div className="retro-account-card" style={{ padding: "22px 24px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>RACCOURCIS</div>
            <QuickLink href="/compte/commandes" label="Suivre mes commandes" />
            <QuickLink href="/compte/factures" label="Télécharger mes factures" />
            <QuickLink href="/compte/profil" label="Modifier mon profil" />
            <p style={{ fontSize: 12, color: MUTED, margin: "4px 0 0", lineHeight: 1.6 }}>
              Une question sur une commande ? Écrivez-nous à {SUPPORT_EMAIL}.
            </p>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="retro-account-quick-link"
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 6,
        background: "#f7f7f5",
        fontSize: 14,
        fontWeight: 500,
        color: "#37352f",
      }}
    >
      {label}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(55,53,47,0.45)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
