import { vmin } from "@/lib/fluid";

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div
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
        return (
          <span
            key={item}
            style={{ display: "contents" }}
          >
            <span style={isLast ? { color: "#fff" } : undefined}>{item}</span>
            {!isLast && <span style={{ opacity: 0.5 }}>/</span>}
          </span>
        );
      })}
    </div>
  );
}
