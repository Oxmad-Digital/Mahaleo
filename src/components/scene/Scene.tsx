import type { CSSProperties, ReactNode } from "react";
import { vmin } from "@/lib/fluid";

/**
 * Full-viewport, no-scroll shell from the previous storefront design: fills
 * 100% width and 100dvh height, with vmin-scaled content. Only the order
 * confirmation page still uses it.
 */
export function Scene({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "var(--font-family)",
        background:
          "#0d0805 url('/images/mahaleo-mur-de-brique-background.webp') center / cover no-repeat",
      }}
    >
      <div
        className="scene-overlay"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, var(--overlay-scene-top) 0%, var(--overlay-scene-mid) 45%, var(--overlay-scene-bottom) 100%)",
        }}
      />

      <div className="scene-frame" style={glassFrame}>
        {children}
      </div>
    </div>
  );
}

const glassFrame: CSSProperties = {
  position: "absolute",
  inset: vmin(20),
  borderRadius: "var(--radius-outer-frame)",
  background:
    "linear-gradient(180deg, var(--glass-fill-top), var(--glass-fill-bottom))",
  border: "1px solid var(--glass-border)",
  backdropFilter: "blur(clamp(6px, 1.25vmin, 12px))",
  WebkitBackdropFilter: "blur(clamp(6px, 1.25vmin, 12px))",
  boxShadow: "var(--shadow-outer-frame)",
  overflow: "hidden",
};
