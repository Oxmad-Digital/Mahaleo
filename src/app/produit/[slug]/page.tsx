import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getProductBySlug, isNewArrival } from "@/lib/shop";
import { isProductFavorite } from "@/lib/favorites-data";
import { ProductDetail } from "@/components/produit/ProductDetail";

export default async function ProductPage(props: PageProps<"/produit/[slug]">) {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();
  const initialFavorite = session?.user ? await isProductFavorite(session.user.id, product.id) : false;

  return (
    <ProductDetail
      product={product}
      isNewArrival={isNewArrival(product.createdAt)}
      isAuthenticated={!!session?.user}
      initialFavorite={initialFavorite}
    />
  );
}
