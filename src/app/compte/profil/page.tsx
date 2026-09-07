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
    select: { name: true, email: true, createdAt: true, _count: { select: { orders: true, favorites: true } } },
  });
  if (!user) notFound();

  return (
    <AccountShell
      breadcrumb={[{ label: "Mon espace", href: "/compte" }, { label: "Profil" }]}
      active="profil"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div className="admin-page-header-row" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Mon profil
        </div>
        <div style={{ fontSize: 15, color: "rgba(55,53,47,0.6)" }}>Vos informations de connexion et votre mot de passe.</div>
      </div>

      <div
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
        <InfoField label="Favoris" value={String(user._count.favorites)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Informations</div>
        <ProfileForm initial={{ name: user.name ?? "", email: user.email }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Mot de passe</div>
        <PasswordForm />
      </div>

      <div style={{ padding: "20px 24px", borderRadius: 8, border: BORDER, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Supprimer mon compte</div>
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
