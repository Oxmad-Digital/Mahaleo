"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { HeaderIconButton } from "@/components/scene/HeaderIconButton";
import { GridIcon } from "@/components/icons";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { PhotoWall } from "@/components/home/PhotoWall";
import type { ShopProduct } from "@/lib/shop";

type HomeViewMode = "carousel" | "wall";

const HomeViewContext = createContext<{
  mode: HomeViewMode;
  toggle: () => void;
} | null>(null);

function useHomeView() {
  const context = useContext(HomeViewContext);
  if (!context) throw new Error("useHomeView must be used inside a HomeViewProvider");
  return context;
}

/**
 * The gallery toggle sits in the top bar while the view it switches lives in
 * the middle of the scene, so the shared state travels through context rather
 * than through the page layout.
 */
export function HomeViewProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HomeViewMode>("carousel");
  const value = useMemo(
    () => ({ mode, toggle: () => setMode((m) => (m === "wall" ? "carousel" : "wall")) }),
    [mode],
  );

  return <HomeViewContext.Provider value={value}>{children}</HomeViewContext.Provider>;
}

export function GalleryToggle() {
  const { mode, toggle } = useHomeView();

  return (
    <HeaderIconButton
      onClick={toggle}
      pressed={mode === "wall"}
      label={mode === "wall" ? "Revenir au carrousel" : "Voir la galerie photo"}
    >
      <GridIcon />
    </HeaderIconButton>
  );
}

export function HomeStage({ products }: { products: ShopProduct[] }) {
  const { mode } = useHomeView();

  return mode === "wall" ? <PhotoWall products={products} /> : <HomeCarousel products={products} />;
}
