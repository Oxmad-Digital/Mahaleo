"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { CartIcon, HangerIcon, HeartIcon, ProfileIcon } from "../icons";
import { vmin } from "@/lib/fluid";

export type RailKey = "shop" | "cart" | "heart" | "profile";

export function IconRail({ active }: { active: RailKey }) {
  const { data: session } = useSession();

  const items: { key: RailKey; href: string; icon: React.ReactNode; label: string; connected?: boolean }[] = [
    { key: "shop", href: "/", icon: <HangerIcon />, label: "Boutique" },
    { key: "cart", href: "/panier", icon: <CartIcon />, label: "Panier" },
    { key: "heart", href: "/favoris", icon: <HeartIcon />, label: "Favoris" },
    session?.user
      ? {
          key: "profile",
          href: session.user.role === "ADMIN" ? "/admin" : "/",
          icon: <ProfileIcon />,
          label: `Connecté — ${session.user.name ?? session.user.email}`,
          connected: true,
        }
      : { key: "profile", href: "/connexion", icon: <ProfileIcon />, label: "Connexion" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: vmin(26),
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: vmin(6),
        padding: vmin(8),
        borderRadius: "var(--radius-pill)",
        background: "var(--glass-pill-bg-soft)",
        border: "1px solid var(--glass-pill-border-soft)",
        backdropFilter: "blur(var(--blur-strong))",
        WebkitBackdropFilter: "blur(var(--blur-strong))",
        boxShadow: "var(--shadow-icon-rail)",
      }}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className="rail-link"
            style={{
              position: "relative",
              width: vmin(46),
              height: vmin(46),
              borderRadius: "var(--radius-pill)",
              background: isActive ? "var(--glass-pill-bg-active)" : undefined,
              border: isActive ? "1px solid var(--glass-pill-border-active)" : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {item.icon}
            {item.connected && (
              <span
                style={{
                  position: "absolute",
                  top: vmin(6),
                  right: vmin(6),
                  width: vmin(9),
                  height: vmin(9),
                  borderRadius: "50%",
                  background: "var(--brand-green, #2e7d32)",
                  border: "1.5px solid rgba(0,0,0,0.4)",
                }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
