import { notFound } from "next/navigation";
import { getProductBySlug, isNewArrival } from "@/lib/shop";
import { ProductDetail } from "@/components/produit/ProductDetail";

export default async function ProductPage(props: PageProps<"/produit/[slug]">) {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetail product={product} isNewArrival={isNewArrival(product.createdAt)} />;
}
