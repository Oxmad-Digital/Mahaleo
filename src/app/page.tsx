import Link from "next/link";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { IconRail } from "@/components/scene/IconRail";
import { ContactButton } from "@/components/scene/ContactButton";
import { Footer } from "@/components/scene/Footer";
import { GalleryToggle, HomeStage, HomeViewProvider } from "@/components/home/HomeView";
import { BagIcon } from "@/components/icons";
import { vmin } from "@/lib/fluid";
import { getShopProducts } from "@/lib/shop";

export default async function Home() {
  const products = await getShopProducts();

  return (
    <Scene className="scene-mobile">
      <HomeViewProvider>
        <TopBar
          className="scene-topbar"
          left={
            <>
              <LogoPill />
              <ContactButton />
              <GalleryToggle />
            </>
          }
          right={
            <Link
              href="/panier"
              className="shop-checkout"
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
              <span
                className="shop-checkout-label"
                style={{ fontSize: vmin(15), fontWeight: 500, whiteSpace: "nowrap" }}
              >
                Passer la commande
              </span>
            </Link>
          }
        />

        <HomeStage products={products} />

        <IconRail active="shop" />
        <Footer />
      </HomeViewProvider>
    </Scene>
  );
}
