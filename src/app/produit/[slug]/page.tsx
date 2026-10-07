import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, isNewArrival } from "@/lib/shop";
import { ProductDetail } from "@/components/produit/ProductDetail";

export async function generateMetadata(props: PageProps<"/produit/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Page introuvable" };

  const description =
    product.description?.slice(0, 160) ?? `${product.name} — boutique officielle Mahaleo.`;
  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage(props: PageProps<"/produit/[slug]">) {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      isNewArrival={isNewArrival(product.createdAt)}
    />
  );
}
