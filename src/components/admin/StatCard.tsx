import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  delta,
  hint,
  tint = false,
}: {
  label: string;
  value: ReactNode;
  delta?: { text: string; positive: boolean } | null;
  hint?: string;
  tint?: boolean;
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRadius: 8,
        border: tint ? "none" : "1px solid rgba(55,53,47,0.09)",
        background: tint ? "#f7f7f5" : "transparent",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(55,53,47,0.55)" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>{value}</span>
        {delta && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: delta.positive ? "#1c6b3a" : "rgba(55,53,47,0.5)",
            }}
          >
            {delta.text}
          </span>
        )}
      </div>
      {hint && <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>{hint}</div>}
    </div>
  );
}
