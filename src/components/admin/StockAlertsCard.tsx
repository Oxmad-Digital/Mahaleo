import type { DashboardData } from "@/lib/admin/dashboard";

export function StockAlertsCard({ products }: { products: DashboardData["lowStockProducts"] }) {
  if (products.length === 0) return null;

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
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Alertes de stock</div>
        <span style={{ padding: "3px 9px", borderRadius: 4, background: "#fbe4e4", fontSize: 12, fontWeight: 500, color: "#a82c2c" }}>
          {products.length} référence{products.length > 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {products.map((product, i) => {
          const outOfStock = product.stock === 0;
          return (
            <div
              key={product.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: i === products.length - 1 ? "none" : "1px solid rgba(55,53,47,0.06)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {product.name}
                </span>
              </div>
              <span
                style={{
                  flex: "none",
                  padding: "3px 9px",
                  borderRadius: 4,
                  background: outOfStock ? "#fbe4e4" : "#fbf3db",
                  fontSize: 12,
                  fontWeight: 500,
                  color: outOfStock ? "#a82c2c" : "#8a6416",
                }}
              >
                {outOfStock ? "0 en stock" : `${product.stock} restants`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
