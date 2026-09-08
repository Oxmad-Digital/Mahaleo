import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getProductById } from "@/lib/admin/products";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/app/actions/products";

export default async function EditProductPage(props: PageProps<"/admin/produits/[id]">) {
  const session = await requireAdmin();
  const { id } = await props.params;

  const product = await getProductById(id);
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id, true);

  return (
    <AdminShell
      breadcrumb={[{ label: "Tableau de bord", href: "/admin" }, { label: "Produits", href: "/admin/produits" }, { label: product.name }]}
      active="produits"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>Modifier le produit</div>
      <ProductForm
        action={action}
        submitLabel="Enregistrer"
        pendingLabel="Enregistrement..."
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
      />
    </AdminShell>
  );
}
