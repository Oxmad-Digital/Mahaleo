import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { IconRail } from "@/components/scene/IconRail";
import { ContactButton } from "@/components/scene/ContactButton";
import { Footer } from "@/components/scene/Footer";
import { GalleryToggle, HomeStage, HomeViewProvider } from "@/components/home/HomeView";
import { vmin } from "@/lib/fluid";
import { getShopProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

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
            <h1
              className="shop-title"
              style={{
                margin: 0,
                fontSize: vmin(15),
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Mahaleo — Boutique Officielle &amp; Merch
            </h1>
          }
        />

        <HomeStage products={products} />

        <IconRail active="shop" />
        <Footer />
      </HomeViewProvider>
    </Scene>
  );
}
