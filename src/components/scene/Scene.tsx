import type { CSSProperties, ReactNode } from "react";
import { vmin } from "@/lib/fluid";

/**
 * Full-viewport, no-scroll shell for the storefront pages: fills 100% width
 * and 100dvh height (fluid, no fixed canvas / JS scaling), with three
 * internal scroll regions (.cart-scroll, .fav-scroll, .legal-scroll) handling
 * variable-length content. A future admin dashboard should use a different
 * wrapper that allows normal page scroll instead of this one.
 */
export function Scene({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "var(--font-family)",
        background:
          "#0d0805 url('/images/hero-background.jpg') center / cover no-repeat",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, var(--overlay-scene-top) 0%, var(--overlay-scene-mid) 45%, var(--overlay-scene-bottom) 100%)",
        }}
      />

      <div style={glassFrame}>{children}</div>
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
  backdropFilter: "blur(var(--blur-standard))",
  WebkitBackdropFilter: "blur(var(--blur-standard))",
  boxShadow: "var(--shadow-outer-frame)",
  overflow: "hidden",
};
