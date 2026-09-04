"use client";

import { useMemo, useRef, useState } from "react";

type DailyPoint = { day: string; views: number; visitors: number };

const WIDTH = 1000;
const HEIGHT = 220;
const MARGIN = { top: 10, right: 8, bottom: 24, left: 8 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

const VIEWS_COLOR = "#1c6b3a";
const VISITORS_COLOR = "#a3844f";

function formatDate(day: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC", ...opts });
}

export function TrafficChart({ daily }: { daily: DailyPoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number; wrapWidth: number } | null>(null);

  const n = daily.length;

  const { xAt, yAt, viewsPath, visitorsPath, labelIndices } = useMemo(() => {
    const max = Math.max(1, ...daily.map((d) => Math.max(d.views, d.visitors)));
    const xAt = (i: number) => (n <= 1 ? MARGIN.left + PLOT_WIDTH / 2 : MARGIN.left + (i / (n - 1)) * PLOT_WIDTH);
    const yAt = (v: number) => MARGIN.top + PLOT_HEIGHT - (v / max) * PLOT_HEIGHT;
    const toPath = (key: "views" | "visitors") =>
      daily.map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(d[key]).toFixed(1)}`).join(" ");
    const step = Math.max(1, Math.ceil(n / 6));
    const labelIndices = daily.map((_, i) => i).filter((i) => i % step === 0 || i === n - 1);
    return { xAt, yAt, viewsPath: toPath("views"), visitorsPath: toPath("visitors"), labelIndices };
  }, [daily, n]);

  if (n === 0) {
    return <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "40px 0", textAlign: "center" }}>Aucune donnée pour le moment.</div>;
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (relX - MARGIN.left) / PLOT_WIDTH;
    const index = Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1))));
    setHoverIndex(index);
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top, wrapWidth: rect.width });
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
    setPointer(null);
  };

  const hovered = hoverIndex !== null ? daily[hoverIndex] : null;
  const tooltipLeft = pointer ? (pointer.x / pointer.wrapWidth) * 100 : 0;
  const flipTooltip = tooltipLeft > 65;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div ref={wrapRef} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" style={{ width: "100%", height: 200, display: "block", overflow: "visible" }}>
          {labelIndices.map((i) => (
            <text
              key={daily[i].day}
              x={xAt(i)}
              y={HEIGHT - MARGIN.bottom + 18}
              fontSize={11}
              fontWeight={500}
              fill="rgba(55,53,47,0.45)"
              textAnchor="middle"
            >
              {formatDate(daily[i].day, { day: "2-digit", month: "2-digit" })}
            </text>
          ))}

          {hoverIndex !== null && (
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={MARGIN.top}
              y2={PLOT_HEIGHT + MARGIN.top}
              stroke="rgba(55,53,47,0.15)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}

          <path d={visitorsPath} fill="none" stroke={VISITORS_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={viewsPath} fill="none" stroke={VIEWS_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

          {hoverIndex !== null && (
            <>
              <circle cx={xAt(hoverIndex)} cy={yAt(daily[hoverIndex].views)} r={4} fill={VIEWS_COLOR} stroke="#fff" strokeWidth={2} />
              <circle cx={xAt(hoverIndex)} cy={yAt(daily[hoverIndex].visitors)} r={4} fill={VISITORS_COLOR} stroke="#fff" strokeWidth={2} />
            </>
          )}
        </svg>

        {hovered && pointer && (
          <div
            style={{
              position: "absolute",
              left: flipTooltip ? undefined : pointer.x + 12,
              right: flipTooltip ? pointer.wrapWidth - pointer.x + 12 : undefined,
              top: Math.max(0, pointer.y - 54),
              padding: "8px 10px",
              borderRadius: 6,
              background: "#37352f",
              color: "#fff",
              fontSize: 12,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4, textTransform: "capitalize" }}>
              {formatDate(hovered.day, { weekday: "short", day: "2-digit", month: "long" })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: VIEWS_COLOR }} />
              {hovered.views.toLocaleString("fr-FR")} vues
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: VISITORS_COLOR }} />
              {hovered.visitors.toLocaleString("fr-FR")} visiteurs
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 12, fontWeight: 500, color: "rgba(55,53,47,0.55)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: VIEWS_COLOR }} />
          Vues
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: VISITORS_COLOR }} />
          Visiteurs uniques
        </span>
      </div>
    </div>
  );
}
