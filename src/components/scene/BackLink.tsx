import Link from "next/link";
import { ChevronLeftIcon } from "../icons";
import { vmin } from "@/lib/fluid";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: vmin(10),
        padding: `${vmin(10)} ${vmin(20)}`,
        borderRadius: "var(--radius-pill)",
        background: "var(--glass-pill-bg)",
        border: "1px solid var(--glass-pill-border)",
      }}
    >
      <ChevronLeftIcon />
      <span
        style={{
          fontSize: vmin(15),
          fontWeight: 500,
          whiteSpace: "nowrap",
          color: "#fff",
        }}
      >
        {label}
      </span>
    </Link>
  );
}
