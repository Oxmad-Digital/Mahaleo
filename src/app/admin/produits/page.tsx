import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getProductsData } from "@/lib/admin/products";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductSearchForm } from "@/components/admin/ProductsFilters";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function AdminProductsPage(props: PageProps<"/admin/produits">) {
  const session = await requireAdmin();
  const searchParams = await props.searchParams;

  const queryParam = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const query = queryParam.length > 0 ? queryParam : undefined;

  const pageParam = Number(searchParams.page);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const errorParam = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const data = await getProductsData({ query, page });

  return (
    <AdminShell
      breadcrumb={[{ label: "Tableau de bord", href: "/admin" }, { label: "Produits" }]}
      active="produits"
      userName={session.user.name}
      userEmail={session.user.email ?? ""}
    >
      <div
        className="admin-page-header-row"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}
      >
        <div className="admin-page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Produits
        </div>
        <div className="admin-product-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ProductSearchForm query={query} />
          <Link
            href="/admin/produits/nouveau"
            className="admin-product-add-btn"
            style={{
              padding: "9px 16px",
              borderRadius: 6,
              background: "var(--brand-green, #1c6b3a)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            Ajouter un produit
          </Link>
        </div>
      </div>

      {errorParam && (
        <div style={{ padding: "12px 16px", borderRadius: 6, background: "#fbe4e4", color: "#a82c2c", fontSize: 14, fontWeight: 500 }}>
          {errorParam}
        </div>
      )}

      <ProductsTable data={data} query={query} />
    </AdminShell>
  );
}
