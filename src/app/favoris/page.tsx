import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserFavorites } from "@/lib/favorites-data";
import { FavorisList } from "@/components/favoris/FavorisList";
import { StorePage } from "@/components/store/StorePage";

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
    <StorePage eyebrow="VOTRE SÉLECTION" title="LES FAVORIS" className="retro-favorites-page">
      <FavorisList initialItems={items} />
    </StorePage>
  );
}
