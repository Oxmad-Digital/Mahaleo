import Link from "next/link";
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
 * when it does something, so the decorative ones stay out of the tab order —
 * or an anchor when `href` makes it a navigation.
 */
export function HeaderIconButton({
  children,
  label,
  pressed,
  href,
  onClick,
  className,
}: {
  children: ReactNode;
  label?: string;
  pressed?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const classes = className ? `header-icon-button ${className}` : "header-icon-button";

  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={classes} style={shape}>
        {children}
      </Link>
    );
  }

  if (!onClick) {
    return (
      <div className={classes} style={shape}>
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
      className={classes}
      style={{ ...shape, cursor: "pointer", padding: 0 }}
    >
      {children}
    </button>
  );
}
