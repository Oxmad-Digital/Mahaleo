import type { ReactNode } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Tableau de bord", href: "/admin", active: true, icon: "grid" as const },
  { label: "Commandes", href: null, icon: "cart" as const },
  { label: "Produits", href: null, icon: "package" as const },
  { label: "Clients", href: null, icon: "users" as const },
  { label: "Statistiques", href: null, icon: "chart" as const },
];

function NavIcon({ kind }: { kind: "grid" | "cart" | "package" | "users" | "chart" | "settings" }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "grid":
      return (
        <svg {...common} stroke="#37352f">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common} stroke="rgba(55,53,47,0.55)">
          <path d="M3 4h2l2.6 10h10.2l2.2-7H6" />
          <circle cx="9.5" cy="18.5" r="1.4" />
          <circle cx="17" cy="18.5" r="1.4" />
        </svg>
      );
    case "package":
      return (
        <svg {...common} stroke="rgba(55,53,47,0.55)">
          <path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2z" />
          <path d="M4 7.2l8 4.2 8-4.2M12 11.4V21" />
        </svg>
      );
    case "users":
      return (
        <svg {...common} stroke="rgba(55,53,47,0.55)">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} stroke="rgba(55,53,47,0.55)">
          <path d="M4 20V11M10 20V5M16 20v-6M22 20H2" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} stroke="rgba(55,53,47,0.55)">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" />
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

export function AdminShell({
  breadcrumb,
  userName,
  userEmail,
  children,
}: {
  breadcrumb: string;
  userName: string | null | undefined;
  userEmail: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "#ffffff",
        fontFamily: "var(--font-family)",
        color: "#37352f",
      }}
    >
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "flex-start" }}>
        <div
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
            justifyContent: "space-between",
            background: "#f7f7f5",
            borderRight: "1px solid rgba(55,53,47,0.09)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
            <div
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
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {NAV_ITEMS.map((item) => {
                const content = (
                  <div
                    title={item.label}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: item.active ? "rgba(55,53,47,0.08)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: item.href ? "pointer" : "default",
                    }}
                  >
                    <NavIcon kind={item.icon} />
                  </div>
                );
                return item.href ? (
                  <Link key={item.label} href={item.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>
          </div>
          <div
            title="Réglages"
            style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <NavIcon kind="settings" />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div
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
              <span>Mahaleo</span>
              <span style={{ opacity: 0.5 }}>/</span>
              <span style={{ color: "#37352f", fontWeight: 600 }}>Espace admin</span>
              <span style={{ opacity: 0.5 }}>/</span>
              <span style={{ color: "#37352f", fontWeight: 600 }}>{breadcrumb}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
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
                <span style={{ fontSize: 14, fontWeight: 500, color: "#37352f", whiteSpace: "nowrap" }}>
                  {userName ?? userEmail}
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: "40px 40px 64px", display: "flex", flexDirection: "column", gap: 32 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
