import { requireAdmin } from "@/lib/admin/require-admin";
import { getSiteSettings, getAdmins } from "@/lib/admin/settings";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminInviteForm } from "@/components/admin/AdminInviteForm";
import { RevokeAdminButton } from "@/components/admin/RevokeAdminButton";
import { MaintenanceToggle } from "@/components/admin/MaintenanceToggle";
import { formatDate } from "@/lib/format";

export default async function AdminSettingsPage(props: PageProps<"/admin/parametres">) {
  const session = await requireAdmin();
  const searchParams = await props.searchParams;
  const errorParam = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const [settings, admins] = await Promise.all([getSiteSettings(), getAdmins()]);

  return (
    <AdminShell
      breadcrumb={[{ label: "Tableau de bord", href: "/admin" }, { label: "Paramètres" }]}
      active="parametres"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>Paramètres</div>

      {errorParam && (
        <div style={{ padding: "12px 16px", borderRadius: 6, background: "#fbe4e4", color: "#a82c2c", fontSize: 14, fontWeight: 500 }}>
          {errorParam}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Mode maintenance</div>
        <div
          style={{
            padding: "20px 24px",
            borderRadius: 8,
            border: settings.maintenanceMode ? "1px solid rgba(168,44,44,0.2)" : "1px solid rgba(55,53,47,0.09)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 480, minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {settings.maintenanceMode ? "Le site est actuellement en maintenance" : "Le site est actuellement accessible"}
            </span>
            <span style={{ fontSize: 13, color: "rgba(55,53,47,0.6)" }}>
              Lorsqu&apos;il est activé, les visiteurs voient un écran de maintenance sur toutes les pages publiques. Les administrateurs
              connectés continuent d&apos;accéder au site et à l&apos;espace admin normalement.
            </span>
          </div>
          <MaintenanceToggle enabled={settings.maintenanceMode} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Administrateurs</div>
        <div style={{ borderRadius: 8, border: "1px solid rgba(55,53,47,0.09)", overflow: "hidden" }}>
          {admins.map((admin, index) => (
            <div
              key={admin.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "16px 24px",
                borderTop: index === 0 ? "none" : "1px solid rgba(55,53,47,0.09)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, overflowWrap: "break-word" }}>
                  {admin.name ?? admin.email}
                  {admin.id === session.user.id && (
                    <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: "rgba(55,53,47,0.45)" }}>(vous)</span>
                  )}
                </span>
                <span style={{ fontSize: 13, color: "rgba(55,53,47,0.6)", overflowWrap: "break-word" }}>
                  {admin.email} · Administrateur depuis le {formatDate(admin.createdAt)}
                </span>
              </div>
              {admin.id !== session.user.id && admins.length > 1 && (
                <RevokeAdminButton id={admin.id} name={admin.name ?? admin.email} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Ajouter un administrateur</div>
        <p style={{ fontSize: 13, color: "rgba(55,53,47,0.6)", margin: 0 }}>
          Un compte administrateur est créé immédiatement et un e-mail est envoyé à la personne pour qu&apos;elle choisisse son mot de passe.
        </p>
        <AdminInviteForm />
      </div>
    </AdminShell>
  );
}
