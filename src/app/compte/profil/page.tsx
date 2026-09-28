import { notFound } from "next/navigation";
import { requireUser } from "@/lib/account/require-user";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/compte/AccountShell";
import { ProfileForm } from "@/components/compte/ProfileForm";
import { PasswordForm } from "@/components/compte/PasswordForm";
import { formatDate } from "@/lib/format";
import { SUPPORT_EMAIL } from "@/lib/emails/constants";

const BORDER = "1px solid rgba(55,53,47,0.09)";

export default async function AccountProfilePage() {
  const session = await requireUser();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, createdAt: true, _count: { select: { orders: true } } },
  });
  if (!user) notFound();

  return (
    <AccountShell
      breadcrumb={[{ label: "Mon espace", href: "/compte" }, { label: "Profil" }]}
      active="profil"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div className="admin-page-header-row retro-account-page-heading" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="retro-admin-kicker">Identité · sécurité</span>
        <div className="admin-page-title">
          Mon profil
        </div>
        <div style={{ fontSize: 15, color: "rgba(55,53,47,0.6)" }}>Vos informations de connexion et votre mot de passe.</div>
      </div>

      <div
        className="retro-account-profile-meta"
        style={{
          padding: "20px 24px",
          borderRadius: 8,
          border: BORDER,
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        <InfoField label="Client depuis" value={formatDate(user.createdAt)} />
        <InfoField label="Commandes" value={String(user._count.orders)} />
      </div>

      <div className="retro-account-section" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="retro-admin-card-title">Informations</div>
        <ProfileForm initial={{ name: user.name ?? "", email: user.email }} />
      </div>

      <div className="retro-account-section" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="retro-admin-card-title">Mot de passe</div>
        <PasswordForm />
      </div>

      <div className="retro-account-card retro-account-danger" style={{ padding: "20px 24px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="retro-admin-card-title">Supprimer mon compte</div>
        <p style={{ fontSize: 13, color: "rgba(55,53,47,0.6)", margin: 0, lineHeight: 1.6 }}>
          Vos commandes sont conservées pour des raisons comptables. Pour demander la suppression de votre compte,
          écrivez-nous à {SUPPORT_EMAIL} {"depuis l'adresse associée à ce compte."}
        </p>
      </div>
    </AccountShell>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(55,53,47,0.45)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
