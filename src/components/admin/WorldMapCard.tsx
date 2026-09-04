"use client";

import { useEffect, useRef } from "react";
import { countryLabel } from "@/lib/country-label";

type CountryPoint = { country: string; views: number };

export function WorldMapCard({ countries }: { countries: CountryPoint[] }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || countries.length === 0) return;

    let cancelled = false;

    (async () => {
      let svgText: string;
      try {
        const res = await fetch("/world-map.min.svg");
        svgText = await res.text();
      } catch {
        return;
      }
      if (cancelled) return;

      host.innerHTML = svgText;
      const svg = host.querySelector("svg");
      if (!svg) return;

      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.style.display = "block";

      const byCountry = new Map(countries.filter((c) => c.country).map((c) => [c.country.toLowerCase(), c.views]));
      const max = Math.max(1, ...countries.map((c) => c.views));

      const tooltip = document.createElement("div");
      Object.assign(tooltip.style, {
        position: "absolute",
        transform: "translate(-50%, -100%)",
        padding: "6px 10px",
        borderRadius: "6px",
        background: "#37352f",
        color: "#fff",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: "0",
        transition: "opacity 0.1s",
        zIndex: "5",
      } satisfies Partial<CSSStyleDeclaration>);
      host.style.position = "relative";
      host.appendChild(tooltip);

      svg.querySelectorAll<SVGElement>("path[id], g[id]").forEach((el) => {
        const views = byCountry.get(el.id);
        const paths =
          el.tagName.toLowerCase() === "g"
            ? Array.from(el.querySelectorAll<SVGPathElement>("path"))
            : [el as unknown as SVGPathElement];

        paths.forEach((p) => {
          p.style.stroke = "rgba(55,53,47,0.18)";
          p.style.strokeWidth = "0.35";
        });

        if (!views) {
          paths.forEach((p) => {
            p.style.fill = "#f1f1ef";
          });
          return;
        }

        const intensity = 0.28 + 0.72 * Math.sqrt(views / max);
        const fill = `rgba(28, 107, 58, ${intensity.toFixed(2)})`;
        paths.forEach((p) => {
          p.style.fill = fill;
          p.style.cursor = "pointer";
        });

        const show = (e: PointerEvent) => {
          const hostRect = host.getBoundingClientRect();
          tooltip.innerHTML =
            `<span style="width:7px;height:7px;border-radius:999px;background:#1c6b3a"></span>` +
            `<span>${countryLabel(el.id.toUpperCase())} — ${views.toLocaleString("fr-FR")}</span>`;
          tooltip.style.left = `${e.clientX - hostRect.left}px`;
          tooltip.style.top = `${e.clientY - hostRect.top - 10}px`;
          tooltip.style.opacity = "1";
          paths.forEach((p) => {
            p.style.filter = "brightness(0.92)";
          });
        };
        const hide = () => {
          tooltip.style.opacity = "0";
          paths.forEach((p) => {
            p.style.filter = "";
          });
        };
        el.addEventListener("pointerenter", show);
        el.addEventListener("pointermove", show);
        el.addEventListener("pointerleave", hide);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [countries]);

  if (countries.length === 0) {
    return <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "40px 0", textAlign: "center" }}>Aucune donnée pour le moment.</div>;
  }

  return <div ref={hostRef} style={{ width: "100%" }} />;
}
