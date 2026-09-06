import type { CSSProperties, ReactNode } from "react";
import { vmin } from "@/lib/fluid";

const shape: CSSProperties = {
  width: vmin(40),
  height: vmin(40),
  flex: "none",
  borderRadius: "var(--radius-pill)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/**
 * The square glass button used for the icon-only actions of the top bar. Its
 * colours live in globals.css (`.header-icon-button`) so the hover and pressed
 * states are not overridden by the inline style. Renders a real button only
 * when it does something, so the decorative ones stay out of the tab order.
 */
export function HeaderIconButton({
  children,
  label,
  pressed,
  onClick,
}: {
  children: ReactNode;
  label?: string;
  pressed?: boolean;
  onClick?: () => void;
}) {
  if (!onClick) {
    return (
      <div className="header-icon-button" style={shape}>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="header-icon-button"
      style={{ ...shape, cursor: "pointer", padding: 0 }}
    >
      {children}
    </button>
  );
}
