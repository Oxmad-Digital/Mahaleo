/**
 * The original design was authored against a fixed 1440x960 canvas. `vmin`
 * scales uniformly with the limiting viewport dimension, so converting every
 * design value through this reference reproduces the original layout
 * pixel-for-pixel at a 1440x960 (3:2) viewport, and shrinks/grows shapes
 * (icons, square thumbnails, circular buttons) without stretching them at
 * any other aspect ratio.
 */
const REFERENCE_HEIGHT = 960;

export function vmin(px: number): string {
  return `${(px / REFERENCE_HEIGHT) * 100}vmin`;
}

/**
 * For content blocks (cards, panels) that should track the design at the
 * reference size but must never overflow a narrow viewport nor balloon past
 * their original pixel width on a huge screen: the smallest of a `%` of the
 * viewport (guarantees it always fits), the vmin-scaled value (matches the
 * original design proportions) and the original pixel value (ceiling).
 */
export function capped(px: number, opts: { max?: number; viewportPercent?: number } = {}): string {
  const max = opts.max ?? px;
  const pct = opts.viewportPercent ?? 92;
  return `min(${pct}%, ${vmin(px)}, ${max}px)`;
}
