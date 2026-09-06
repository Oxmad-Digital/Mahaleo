import type { ReactNode } from "react";
import { vmin } from "@/lib/fluid";

export function TopBar({
  left,
  right,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
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
