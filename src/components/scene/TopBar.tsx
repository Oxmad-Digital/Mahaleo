import type { ReactNode } from "react";
import { vmin } from "@/lib/fluid";

export function TopBar({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        top: vmin(18),
        left: vmin(22),
        right: vmin(22),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 3,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: vmin(10) }}>{left}</div>
      <div style={{ display: "flex", alignItems: "center", gap: vmin(12) }}>{right}</div>
    </div>
  );
}
