import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export type Crumb = { label: string; href?: string };

export type ConsoleIconKind =
  | "grid"
  | "cart"
  | "package"
  | "users"
  | "receipt"
  | "chart"
  | "settings"
  | "heart"
  | "logout";

export type ConsoleNavItem = { key: string; label: string; href: string; icon: ConsoleIconKind };

export function ConsoleIcon({ kind, muted = true }: { kind: ConsoleIconKind; muted?: boolean }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: muted ? "rgba(55,53,47,0.55)" : "#37352f",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <path d="M3 4h2l2.6 10h10.2l2.2-7H6" />
          <circle cx="9.5" cy="18.5" r="1.4" />
          <circle cx="17" cy="18.5" r="1.4" />
        </svg>
      );
    case "package":
      return (
        <svg {...common}>
          <path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2z" />
          <path d="M4 7.2l8 4.2 8-4.2M12 11.4V21" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
        </svg>
      );
    case "receipt":
      return (
        <svg {...common}>
          <path d="M6 3h12v18l-3-2-2 2-2-2-2 2-3-2z" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V11M10 20V5M16 20v-6M22 20H2" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20.2l-7.1-7a4.3 4.3 0 0 1 6.1-6.1l1 1 1-1a4.3 4.3 0 0 1 6.1 6.1z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M15 3.5H6.5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1H15" />
          <path d="M20.5 12H10M20.5 12l-3.5-3.5M20.5 12L17 15.5" />
        </svg>
      );
  }
}

function initialsFor(name: string | null | undefined, email: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase() || name[0]!.toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

/**
 * Coque commune aux deux consoles du site : l'espace admin (`/admin`) et
 * l'espace client (`/compte`). Seuls la navigation et le fil d'Ariane changent.
 *
 * Les classes `admin-*` posées ici sont partagées par les deux espaces : elles
 * pilotent la mise en page mobile définie dans `globals.css`.
 */
export function ConsoleShell({
  nav,
  active,
  breadcrumb,
  userName,
  userEmail,
  children,
}: {
  nav: ConsoleNavItem[];
  active: string;
  breadcrumb: Crumb[];
  userName: string | null | undefined;
  userEmail: string;
  children: ReactNode;
}) {
  return (
    <div
      className="admin-shell"
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "#ffffff",
        fontFamily: "var(--font-family)",
        color: "#37352f",
      }}
    >
      <div className="admin-shell-row" style={{ minHeight: "100dvh", display: "flex", alignItems: "flex-start" }}>
        <div
          className="admin-sidebar"
          style={{
            position: "sticky",
            top: 0,
            height: "100dvh",
            flex: "none",
            width: 72,
            padding: "20px 0",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#f7f7f5",
            borderRight: "1px solid rgba(55,53,47,0.09)",
          }}
        >
          <div className="admin-sidebar-inner" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
            <div
              className="admin-logo"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "var(--brand-green, #1c6b3a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>M</span>
            </div>
            <div className="admin-nav-list" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {nav.map((item) => {
                const isActive = item.key === active;
                return (
                  <Link key={item.key} href={item.href}>
                    <div
                      title={item.label}
                      className="admin-nav-item"
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: isActive ? "rgba(55,53,47,0.08)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <ConsoleIcon kind={item.icon} muted={!isActive} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="admin-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div
            className="admin-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              padding: "12px 40px",
              borderBottom: "1px solid rgba(55,53,47,0.09)",
            }}
          >
            <div
              className="admin-breadcrumb"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(55,53,47,0.5)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <Link href="/" style={{ color: "inherit" }}>
                Mahaleo
              </Link>
              <span style={{ opacity: 0.5 }}>/</span>
              {breadcrumb.map((crumb, i) => {
                const isLast = i === breadcrumb.length - 1;
                const crumbStyle = { color: isLast ? "#37352f" : "inherit", fontWeight: isLast ? 600 : 500 };
                return (
                  <Fragment key={crumb.label}>
                    {crumb.href ? <Link href={crumb.href} style={crumbStyle}>{crumb.label}</Link> : <span style={crumbStyle}>{crumb.label}</span>}
                    {!isLast && <span style={{ opacity: 0.5 }}>/</span>}
                  </Fragment>
                );
              })}
            </div>
            <div className="admin-header-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="admin-user-chip"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "5px 12px 5px 5px",
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: "#37352f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {initialsFor(userName, userEmail)}
                </div>
                <span className="admin-user-name" style={{ fontSize: 14, fontWeight: 500, color: "#37352f", whiteSpace: "nowrap" }}>
                  {userName ?? userEmail}
                </span>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  title="Déconnexion"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: "1px solid rgba(55,53,47,0.09)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ConsoleIcon kind="logout" />
                </button>
              </form>
            </div>
          </div>

          <div className="admin-content" style={{ padding: "40px 40px 64px", display: "flex", flexDirection: "column", gap: 32 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
