import Link from "next/link";
import { DASHBOARD_RANGES, type DashboardRange } from "@/lib/admin/dashboard";

export function RangeSwitcher({ active, basePath = "/admin" }: { active: DashboardRange; basePath?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: 3,
        borderRadius: 8,
        background: "#f7f7f5",
        border: "1px solid rgba(55,53,47,0.09)",
      }}
    >
      {DASHBOARD_RANGES.map((range) => {
        const isActive = range === active;
        return (
          <Link
            key={range}
            href={`${basePath}?range=${range}`}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              background: isActive ? "#ffffff" : "transparent",
              border: isActive ? "1px solid rgba(55,53,47,0.09)" : "1px solid transparent",
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#37352f" : "rgba(55,53,47,0.6)",
            }}
          >
            {range} j
          </Link>
        );
      })}
    </div>
  );
}
