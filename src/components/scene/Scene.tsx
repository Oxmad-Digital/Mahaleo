import type { CSSProperties, ReactNode } from "react";
import { vmin } from "@/lib/fluid";

/**
 * Full-viewport, no-scroll shell for the storefront pages: fills 100% width
 * and 100dvh height (fluid, no fixed canvas / JS scaling), with three internal
 * scroll regions (.cart-scroll, .fav-scroll — whose styling the home photo
 * wall reuses when it overflows — and .legal-scroll) handling variable-length
 * content. A future admin dashboard should use a different wrapper that allows
 * normal page scroll instead of this one.
 *
 * `className` lands on the outer element and is how a page opts into a mobile
 * layout: the shop, product and legal pages pass `scene-mobile`, whose media
 * queries in globals.css turn this shell into a scrolling column below 768px.
 * `.scene-overlay` and `.scene-frame` are the hooks those rules need. Pages
 * that have not opted in keep the vmin-scaled desktop rendering everywhere.
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
          "#0d0805 url('/images/hero-background.jpg') center / cover no-repeat",
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
  backdropFilter: "blur(var(--blur-standard))",
  WebkitBackdropFilter: "blur(var(--blur-standard))",
  boxShadow: "var(--shadow-outer-frame)",
  overflow: "hidden",
};
