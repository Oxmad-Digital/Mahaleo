"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/format";
import { vmin } from "@/lib/fluid";
import type { ShopProduct } from "@/lib/shop";

const PLACEHOLDER_IMAGE = "/images/product-photo-sample.webp";

/** Instagram's portrait post ratio (width / height): product cut-outs are taller than wide. */
const TILE_ASPECT = 4 / 5;
/** How narrow a tile may get once stretched into the height the rows leave over. */
const TALLEST_TILE_ASPECT = 0.6;
/** Below this width a photo stops being readable, so the wall scrolls instead of shrinking further. */
const MIN_TILE_WIDTH = 132;
/** A handful of photos should not blow up into a couple of poster-sized tiles. */
const MAX_TILE_WIDTH = 460;
/**
 * A phone is too narrow to solve a wall against: two columns is the only
 * sensible answer, and the page — not the wall — is what scrolls there.
 */
const COMPACT_MAX_WIDTH = 560;
const COMPACT_GAP = 10;

type Photo = {
  key: string;
  src: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
};

function toPhotos(products: ShopProduct[]): Photo[] {
  return products.flatMap((product) => {
    const images = product.images.length > 0 ? product.images : [PLACEHOLDER_IMAGE];
    return images.map((src, index) => ({
      key: `${product.id}-${index}`,
      src,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      currency: product.currency,
    }));
  });
}

type WallLayout = {
  tileWidth: number;
  tileHeight: number;
  gap: number;
  scrolls: boolean;
};

/**
 * Picks the tile size that fills the available box: for every possible column
 * count, a tile is limited either by the row width or by the height left for
 * the rows it implies — the best column count is the one whose larger tile
 * still satisfies both. Photo count and box size are the only inputs, so the
 * wall re-solves itself on every resize and on any catalogue size.
 */
function solveLayout(count: number, width: number, height: number): WallLayout {
  const gap = Math.max(8, Math.min(18, Math.min(width, height) * 0.018));

  let tileWidth = 0;
  let columns = 1;
  for (let candidate = 1; candidate <= count; candidate++) {
    const rows = Math.ceil(count / candidate);
    const fromWidth = (width - (candidate - 1) * gap) / candidate;
    const fromHeight = ((height - (rows - 1) * gap) / rows) * TILE_ASPECT;
    const candidateWidth = Math.min(fromWidth, fromHeight);
    if (candidateWidth > tileWidth) {
      tileWidth = candidateWidth;
      columns = candidate;
    }
  }

  if (tileWidth < MIN_TILE_WIDTH) {
    // More photos than the frame can hold at a legible size: keep the floor and scroll.
    const floorColumns = Math.max(1, Math.floor((width + gap) / (MIN_TILE_WIDTH + gap)));
    const floored = (width - (floorColumns - 1) * gap) / floorColumns;
    return { tileWidth: floored, tileHeight: floored / TILE_ASPECT, gap, scrolls: true };
  }

  tileWidth = Math.min(tileWidth, MAX_TILE_WIDTH);

  // A width-limited grid leaves height over (a wide frame, few photos). Grow the
  // tiles into it rather than stranding a band of empty glass, down to the
  // narrowest ratio that still frames a garment sensibly.
  // (the solve guarantees the natural height already fits, so this only grows it)
  const rows = Math.ceil(count / columns);
  const rowHeight = (height - (rows - 1) * gap) / rows;
  const tileHeight = Math.min(rowHeight, tileWidth / TALLEST_TILE_ASPECT);

  return { tileWidth, tileHeight, gap, scrolls: false };
}

function WallTile({
  photo,
  index,
  size,
}: {
  photo: Photo;
  index: number;
  size: React.CSSProperties;
}) {
  return (
    <Link
      href={`/produit/${photo.slug}`}
      className="wall-tile"
      title={photo.name}
      style={{
        position: "relative",
        ...size,
        borderRadius: "var(--radius-md)",
        background:
          "linear-gradient(180deg, var(--glass-fill-strong-top), var(--glass-fill-bottom))",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(var(--blur-standard))",
        WebkitBackdropFilter: "blur(var(--blur-standard))",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animationDelay: `${Math.min(index, 24) * 30}ms`,
      }}
    >
      <img
        src={photo.src}
        alt={photo.name}
        loading={index < 12 ? undefined : "lazy"}
        style={{ width: "88%", height: "88%", objectFit: "contain" }}
      />

      <div
        className="wall-tile-overlay"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: `${vmin(22)} ${vmin(12)} ${vmin(10)}`,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: vmin(8),
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      >
        <span
          className="wall-tile-name"
          style={{
            fontSize: vmin(14),
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {photo.name}
        </span>
        <span className="wall-tile-price" style={{ fontSize: vmin(15), fontWeight: 700, whiteSpace: "nowrap" }}>
          {formatCents(photo.priceCents, photo.currency)}
        </span>
      </div>
    </Link>
  );
}

export function PhotoWall({ products }: { products: ShopProduct[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // In the compact grid the wall's own height follows its content, so only
      // commit real changes — re-rendering on every reported height would loop.
      setBox((prev) =>
        prev && prev.width === width && prev.height === height ? prev : { width, height },
      );
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const photos = useMemo(() => toPhotos(products), [products]);
  const compact = box !== null && box.width <= COMPACT_MAX_WIDTH;
  const layout = useMemo(
    () => (box && !compact && photos.length > 0 ? solveLayout(photos.length, box.width, box.height) : null),
    [box, compact, photos.length],
  );

  return (
    <div
      ref={containerRef}
      className="photo-wall"
      style={{
        position: "absolute",
        top: vmin(76),
        left: vmin(100),
        right: vmin(22),
        bottom: `calc(var(--space-footer-height) + ${vmin(6)})`,
      }}
    >
      {photos.length === 0 ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: vmin(20),
            fontWeight: 500,
            color: "var(--text-on-scene-secondary)",
          }}
        >
          Aucune photo à afficher pour le moment.
        </div>
      ) : compact ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: COMPACT_GAP,
          }}
        >
          {photos.map((photo, index) => (
            <WallTile key={photo.key} photo={photo} index={index} size={{ aspectRatio: "4 / 5" }} />
          ))}
        </div>
      ) : (
        layout && (
          <div
            className={layout.scrolls ? "fav-scroll" : undefined}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              // Centring an overflowing wrap container puts its first row out of
              // scroll reach, so the scrolling variant stacks from the top.
              alignContent: layout.scrolls ? "flex-start" : "center",
              gap: layout.gap,
              overflowY: layout.scrolls ? "auto" : "hidden",
              overflowX: "hidden",
            }}
          >
            {photos.map((photo, index) => (
              <WallTile
                key={photo.key}
                photo={photo}
                index={index}
                size={{
                  // A hair under the solved width so rounding never wraps a column early.
                  width: layout.tileWidth - 0.5,
                  height: layout.tileHeight,
                  flex: "none",
                }}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
