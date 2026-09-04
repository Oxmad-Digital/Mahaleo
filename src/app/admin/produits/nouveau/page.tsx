import { requireAdmin } from "@/lib/admin/require-admin";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/app/actions/products";

export default async function NewProductPage() {
  const session = await requireAdmin();

  return (
    <AdminShell
      breadcrumb={[{ label: "Tableau de bord", href: "/admin" }, { label: "Produits", href: "/admin/produits" }, { label: "Nouveau produit" }]}
      active="produits"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>Nouveau produit</div>
      <ProductForm action={createProduct.bind(null, true)} submitLabel="Créer le produit" pendingLabel="Création..." />
    </AdminShell>
  );
}
