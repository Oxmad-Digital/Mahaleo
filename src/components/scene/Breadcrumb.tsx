import Link from "next/link";
import { vmin } from "@/lib/fluid";

export type BreadcrumbItem = string | { label: string; href: string };

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: vmin(8),
        padding: `${vmin(10)} ${vmin(20)}`,
        borderRadius: "var(--radius-pill)",
        background: "var(--glass-pill-bg-soft)",
        border: "1px solid var(--glass-pill-border-soft)",
        fontSize: vmin(14),
        fontWeight: 500,
        color: "var(--text-on-scene-secondary)",
        whiteSpace: "nowrap",
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const label = typeof item === "string" ? item : item.label;
        const href = typeof item === "string" ? undefined : item.href;
        return (
          <span key={label} style={{ display: "contents" }}>
            {href ? (
              <Link href={href} style={{ color: "inherit" }}>
                {label}
              </Link>
            ) : (
              <span style={isLast ? { color: "#fff" } : undefined}>{label}</span>
            )}
            {!isLast && <span style={{ opacity: 0.5 }}>/</span>}
          </span>
        );
      })}
    </div>
  );
}
