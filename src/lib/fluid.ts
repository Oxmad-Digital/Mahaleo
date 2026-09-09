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
 * their original pixel width on a huge screen, nor collapse below a usable
 * size on a phone.
 *
 * `vmin` scales against the limiting viewport dimension, so on a portrait
 * phone (where width << REFERENCE_HEIGHT) the design-matched value can drop
 * far below the `viewportPercent` safety net, which then never kicks in.
 * `clamp()` fixes that: it picks the vmin-scaled "ideal" value, but never
 * lets it go below `min(viewportPercent%, minPx)` (a usable floor that still
 * can't overflow a narrow viewport) nor above `max` (the ceiling for huge
 * screens).
 */
export function capped(
  px: number,
  opts: { max?: number; viewportPercent?: number; min?: number } = {},
): string {
  const max = opts.max ?? px;
  const pct = opts.viewportPercent ?? 92;
  const min = opts.min ?? Math.min(px, 360);
  return `clamp(min(${pct}%, ${min}px), ${vmin(px)}, ${max}px)`;
}
