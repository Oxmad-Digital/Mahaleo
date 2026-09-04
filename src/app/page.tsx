import Link from "next/link";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { BagIcon, GridIcon, LocationDotIcon, MenuIcon } from "@/components/icons";
import { vmin } from "@/lib/fluid";
import { getShopProducts } from "@/lib/shop";

function HeaderIconButton({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: vmin(40),
        height: vmin(40),
        flex: "none",
        borderRadius: "var(--radius-pill)",
        background: "var(--glass-pill-bg)",
        border: "1px solid var(--glass-pill-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

export default async function Home() {
  const products = await getShopProducts();

  return (
    <Scene>
      <TopBar
        left={
          <>
            <LogoPill />
            <HeaderIconButton>
              <LocationDotIcon />
            </HeaderIconButton>
            <HeaderIconButton>
              <GridIcon />
            </HeaderIconButton>
            <HeaderIconButton>
              <MenuIcon />
            </HeaderIconButton>
          </>
        }
        right={
          <Link
            href="/panier"
            style={{
              display: "flex",
              alignItems: "center",
              gap: vmin(10),
              padding: `${vmin(10)} ${vmin(22)}`,
              borderRadius: "var(--radius-pill)",
              background: "var(--glass-pill-bg)",
              border: "1px solid var(--glass-pill-border)",
            }}
          >
            <BagIcon />
            <span style={{ fontSize: vmin(15), fontWeight: 500, whiteSpace: "nowrap" }}>
              Passer la commande
            </span>
          </Link>
        }
      />

      <HomeCarousel products={products} />

      <IconRail active="shop" />
      <Footer />
    </Scene>
  );
}
