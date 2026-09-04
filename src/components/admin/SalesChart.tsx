"use client";

import { useMemo, useState } from "react";

function buildLinePath(heights: number[]) {
  if (heights.length === 0) return { line: "", area: "" };
  const points = heights.map((h, i) => ({
    x: heights.length > 1 ? (i / (heights.length - 1)) * 1000 : 0,
    y: 196 - (h / 100) * 188,
  }));
  let line = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const mx = (a.x + b.x) / 2;
    line += ` C${mx.toFixed(1)} ${a.y.toFixed(1)} ${mx.toFixed(1)} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return { line, area: `${line} L1000 200 L0 200 Z` };
}

export function SalesChart({ series }: { series: { label: string; revenueCents: number }[] }) {
  const [mode, setMode] = useState<"line" | "bars">("line");

  const heights = useMemo(() => {
    const max = Math.max(1, ...series.map((s) => s.revenueCents));
    return series.map((s) => (s.revenueCents / max) * 100);
  }, [series]);

  const { line, area } = useMemo(() => buildLinePath(heights), [heights]);

  const axisLabels = series.length > 0
    ? [series[0], series[Math.floor((series.length - 1) / 4)], series[Math.floor(((series.length - 1) * 2) / 4)], series[Math.floor(((series.length - 1) * 3) / 4)], series[series.length - 1]].map((s) => s.label)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: 2,
            borderRadius: 6,
            background: "#f7f7f5",
            border: "1px solid rgba(55,53,47,0.09)",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("line")}
            title="Courbe"
            style={{
              width: 28,
              height: 24,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: mode === "line" ? "#ffffff" : "transparent",
              border: "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={mode === "line" ? "#37352f" : "rgba(55,53,47,0.45)"}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 16.5c3-1 4.5-8 7.5-8s3 6 6 6 3.5-4.5 4.5-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setMode("bars")}
            title="Barres"
            style={{
              width: 28,
              height: 24,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: mode === "bars" ? "#ffffff" : "transparent",
              border: "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={mode === "bars" ? "#37352f" : "rgba(55,53,47,0.45)"}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 20V12M12 20V4M19 20v-5" />
            </svg>
          </button>
        </div>
      </div>

      {mode === "line" ? (
        <div style={{ flex: 1, minHeight: 180, paddingBottom: 2, borderBottom: "1px solid rgba(55,53,47,0.09)" }}>
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ width: "100%", height: 180, display: "block", overflow: "visible" }}>
            <path d={area} fill="rgba(28,107,58,0.1)" stroke="none" />
            <path d={line} fill="none" stroke="#1c6b3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            gap: 5,
            minHeight: 180,
            paddingBottom: 2,
            borderBottom: "1px solid rgba(55,53,47,0.09)",
          }}
        >
          {heights.map((h, i) => (
            <div key={i} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 180 }}>
              <div style={{ borderRadius: "3px 3px 0 0", background: "#1c6b3a", height: `${h}%` }} />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, fontWeight: 500, color: "rgba(55,53,47,0.45)" }}>
        {axisLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
    </div>
  );
}
