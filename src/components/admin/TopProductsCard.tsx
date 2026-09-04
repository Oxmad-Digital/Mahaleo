import { formatCents } from "@/lib/format";
import type { DashboardData } from "@/lib/admin/dashboard";

export function TopProductsCard({ products, currency }: { products: DashboardData["topProducts"]; currency: string }) {
  return (
    <div
      style={{
        padding: "22px 24px 20px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600 }}>Produits les plus vendus</div>

      {products.length === 0 ? (
        <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "12px 0" }}>Aucune vente sur cette période.</div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
          {products.map((product) => (
            <div key={product.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  flex: "none",
                  borderRadius: 6,
                  background: "#f7f7f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={product.name} style={{ width: "84%", height: "84%", objectFit: "contain" }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {product.name}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>{formatCents(product.revenueCents, currency)}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "rgba(55,53,47,0.08)" }}>
                  <div style={{ width: `${product.barPercent}%`, height: 4, borderRadius: 999, background: "#1c6b3a" }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(55,53,47,0.5)" }}>
                  {product.quantity} ventes · stock {product.stock}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
