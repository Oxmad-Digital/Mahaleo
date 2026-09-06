import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { BackLink } from "@/components/scene/BackLink";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { IconRail } from "@/components/scene/IconRail";
import { Footer } from "@/components/scene/Footer";
import { vmin } from "@/lib/fluid";
import { getUserFavorites } from "@/lib/favorites-data";
import { FavorisList } from "@/components/favoris/FavorisList";

export default async function FavorisPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const favorites = await getUserFavorites(session.user.id);
  const items = favorites.map(({ product }) => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? "",
    priceCents: product.priceCents,
    currency: product.currency,
  }));

  return (
    <Scene className="scene-mobile">
      <TopBar
        className="scene-topbar"
        left={
          <>
            <LogoPill />
            <BackLink href="/" label="Continuer mes achats" />
          </>
        }
        right={<Breadcrumb className="fav-crumb" items={["Boutique", "Favoris"]} />}
      />

      <div
        className="fav-scroll"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "fit-content",
          maxWidth: `calc(100% - ${vmin(220)})`,
          maxHeight: `calc(100% - ${vmin(240)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: vmin(20),
          overflowY: "auto",
          paddingBottom: vmin(20),
          paddingRight: vmin(60),
        }}
      >
        <FavorisList initialItems={items} />
      </div>

      <IconRail active="heart" />
      <Footer />
    </Scene>
  );
}
