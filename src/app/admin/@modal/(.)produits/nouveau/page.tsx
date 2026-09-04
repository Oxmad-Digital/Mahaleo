import { requireAdmin } from "@/lib/admin/require-admin";
import { Modal } from "@/components/admin/Modal";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/app/actions/products";

export default async function NewProductModal() {
  await requireAdmin();

  return (
    <Modal title="Nouveau produit">
      <ProductForm
        action={createProduct.bind(null, false)}
        submitLabel="Créer le produit"
        pendingLabel="Création..."
        successMessage="Produit ajouté avec succès."
        embedded
      />
    </Modal>
  );
}
