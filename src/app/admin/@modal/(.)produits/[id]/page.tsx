import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getProductById } from "@/lib/admin/products";
import { Modal } from "@/components/admin/Modal";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/app/actions/products";

export default async function EditProductModal(props: PageProps<"/admin/produits/[id]">) {
  await requireAdmin();
  const { id } = await props.params;

  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <Modal title="Modifier le produit">
      <ProductForm
        action={updateProduct.bind(null, product.id, false)}
        submitLabel="Enregistrer"
        pendingLabel="Enregistrement..."
        successMessage="Produit modifié avec succès."
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          color: product.color ?? "",
          price: (product.priceCents / 100).toFixed(2),
          images: product.images.join("\n"),
          sizes: product.sizes.map((s) => ({ size: s.size, stock: String(s.stock) })),
          onSale: product.onSale,
          salePrice: product.salePriceCents !== null ? (product.salePriceCents / 100).toFixed(2) : "",
        }}
        embedded
      />
    </Modal>
  );
}
