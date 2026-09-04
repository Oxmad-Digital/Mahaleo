import type { ReactNode } from "react";
import Link from "next/link";
import { formatCents, formatDate } from "@/lib/format";
import type { ClientsData } from "@/lib/admin/clients";
import type { Role, UserStatus } from "@/generated/prisma/client";

const GRID_COLUMNS =
  "40px minmax(0, 1.5fr) minmax(70px, 0.5fr) minmax(80px, 0.6fr) minmax(100px, 0.8fr) minmax(80px, 0.5fr) minmax(90px, 0.7fr) 40px";

function buildHref(params: { q?: string; page: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return `/admin/clients${qs ? `?${qs}` : ""}`;
}

function initialsFor(name: string | null, email: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || name[0]!.toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

export function ClientsTable({ data, query }: { data: ClientsData; query?: string }) {
  const { clients, page, pageCount, total } = data;

  return (
    <div
      style={{
        padding: "22px 24px 18px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Résultats</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(55,53,47,0.5)" }}>
          {total} client{total > 1 ? "s" : ""}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID_COLUMNS,
          gap: 16,
          alignItems: "center",
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(55,53,47,0.45)",
          paddingBottom: 10,
          borderBottom: "1px solid rgba(55,53,47,0.09)",
        }}
      >
        <span />
        <span>Client</span>
        <span>Rôle</span>
        <span>Statut</span>
        <span>Inscription</span>
        <span>Commandes</span>
        <span style={{ textAlign: "right" }}>Total dépensé</span>
        <span />
      </div>

      {clients.length === 0 ? (
        <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "24px 0" }}>Aucun client ne correspond à ces critères.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {clients.map((client, i) => (
            <div
              key={client.id}
              style={{
                display: "grid",
                gridTemplateColumns: GRID_COLUMNS,
                gap: 16,
                alignItems: "center",
                padding: "10px 0",
                borderBottom: i === clients.length - 1 ? "none" : "1px solid rgba(55,53,47,0.06)",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: "#37352f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {initialsFor(client.name, client.email)}
              </div>
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {client.name ?? client.email}
                </span>
                <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>{client.email}</span>
              </div>
              <RoleBadge role={client.role} />
              <StatusBadge status={client.status} />
              <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.5)" }}>{formatDate(client.createdAt)}</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.55)" }}>{client._count.orders}</span>
              <span style={{ fontSize: 14, fontWeight: 600, textAlign: "right" }}>{formatCents(client.totalSpentCents)}</span>
              <Link
                href={`/admin/clients/${client.id}`}
                title="Gérer"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  border: "1px solid rgba(55,53,47,0.09)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#37352f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8L17 5.2a2 2 0 0 0-2.8 0L4 15.5z" />
                  <path d="M13 6.5l4 4" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTop: "1px solid rgba(55,53,47,0.09)",
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(55,53,47,0.5)" }}>
            Page {page} / {pageCount}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <PageLink disabled={page <= 1} href={buildHref({ q: query, page: page - 1 })}>
              Précédent
            </PageLink>
            <PageLink disabled={page >= pageCount} href={buildHref({ q: query, page: page + 1 })}>
              Suivant
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      style={{
        justifySelf: "start",
        padding: "3px 9px",
        borderRadius: 4,
        background: isAdmin ? "#e3f0e8" : "#f1f1ef",
        fontSize: 12,
        fontWeight: 500,
        color: isAdmin ? "var(--brand-green, #1c6b3a)" : "rgba(55,53,47,0.65)",
      }}
    >
      {isAdmin ? "Admin" : "Client"}
    </span>
  );
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const styles = {
    ACTIVE: { bg: "#e3f0e8", ink: "var(--brand-green, #1c6b3a)", label: "Actif" },
    SUSPENDED: { bg: "#fbf3db", ink: "#8a6416", label: "Suspendu" },
    BANNED: { bg: "#fbe4e4", ink: "#a82c2c", label: "Banni" },
  }[status];
  return (
    <span
      style={{
        justifySelf: "start",
        padding: "3px 9px",
        borderRadius: 4,
        background: styles.bg,
        fontSize: 12,
        fontWeight: 500,
        color: styles.ink,
      }}
    >
      {styles.label}
    </span>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: ReactNode }) {
  const style = {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid rgba(55,53,47,0.09)",
    fontSize: 13,
    fontWeight: 500,
    color: disabled ? "rgba(55,53,47,0.3)" : "#37352f",
  };
  if (disabled) return <span style={style}>{children}</span>;
  return (
    <Link href={href} style={style}>
      {children}
    </Link>
  );
}
