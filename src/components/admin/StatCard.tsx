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
      className={`retro-admin-stat${tint ? " retro-admin-stat--tint" : ""}`}
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
      <div className="retro-admin-stat-label">{label}</div>
      <div className="retro-admin-stat-value-row">
        <span className="retro-admin-stat-value">{value}</span>
        {delta && (
          <span
            className={delta.positive ? "retro-admin-delta is-positive" : "retro-admin-delta"}
          >
            {delta.text}
          </span>
        )}
      </div>
      {hint && <div className="retro-admin-stat-hint">{hint}</div>}
    </div>
  );
}
