import type { ReactNode } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/format";
import { DeleteProductButton } from "./DeleteProductButton";
import type { ProductsData } from "@/lib/admin/products";

const GRID_COLUMNS = "48px minmax(0, 1.8fr) minmax(90px, 0.8fr) minmax(140px, 1.1fr) minmax(70px, 0.6fr)";

function buildHref(params: { q?: string; page: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return `/admin/produits${qs ? `?${qs}` : ""}`;
}

export function ProductsTable({ data, query }: { data: ProductsData; query?: string }) {
  const { products, page, pageCount, total } = data;

  return (
    <div
      style={{
        padding: "22px 24px 18px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Résultats</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(55,53,47,0.5)" }}>
          {total} produit{total > 1 ? "s" : ""}
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "24px 0" }}>Aucun produit ne correspond à ces critères.</div>
      ) : (
        <div className="admin-products-scroll">
          <div style={{ minWidth: 640 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: GRID_COLUMNS,
                gap: 16,
                alignItems: "center",
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(55,53,47,0.45)",
                paddingBottom: 10,
                borderBottom: "1px solid rgba(55,53,47,0.09)",
              }}
            >
              <span />
              <span>Produit</span>
              <span>Prix</span>
              <span>Stock</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {products.map((product, i) => {
                return (
                  <div
                    key={product.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: GRID_COLUMNS,
                      gap: 16,
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i === products.length - 1 ? "none" : "1px solid rgba(55,53,47,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        background: "#f7f7f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {product.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt={product.name} style={{ width: "84%", height: "84%", objectFit: "contain" }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {product.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(55,53,47,0.45)" }}>{product.slug}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{formatCents(product.priceCents, product.currency)}</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {product.sizes.length === 0 ? (
                        <Badge tone="neutral">Aucune taille</Badge>
                      ) : (
                        product.sizes.map((s) => (
                          <Badge key={s.size} tone={s.stock === 0 ? "red" : s.stock <= 5 ? "yellow" : "neutral"}>
                            {s.size} · {s.stock}
                          </Badge>
                        ))
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <Link
                        href={`/admin/produits/${product.id}`}
                        title="Modifier"
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          border: "1px solid rgba(55,53,47,0.09)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#37352f" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8L17 5.2a2 2 0 0 0-2.8 0L4 15.5z" />
                          <path d="M13 6.5l4 4" />
                        </svg>
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {pageCount > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            rowGap: 8,
            paddingTop: 12,
            borderTop: "1px solid rgba(55,53,47,0.09)",
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(55,53,47,0.5)" }}>
            Page {page} / {pageCount}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <PageLink disabled={page <= 1} href={buildHref({ q: query, page: page - 1 })}>
              Précédent
            </PageLink>
            <PageLink disabled={page >= pageCount} href={buildHref({ q: query, page: page + 1 })}>
              Suivant
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: "red" | "yellow" | "neutral"; children: ReactNode }) {
  const styles = {
    red: { bg: "#fbe4e4", ink: "#a82c2c" },
    yellow: { bg: "#fbf3db", ink: "#8a6416" },
    neutral: { bg: "#f1f1ef", ink: "rgba(55,53,47,0.65)" },
  }[tone];
  return (
    <span
      style={{
        justifySelf: "start",
        padding: "3px 9px",
        borderRadius: 4,
        background: styles.bg,
        fontSize: 12,
        fontWeight: 500,
        color: styles.ink,
      }}
    >
      {children}
    </span>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: ReactNode }) {
  const style = {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid rgba(55,53,47,0.09)",
    fontSize: 13,
    fontWeight: 500,
    color: disabled ? "rgba(55,53,47,0.3)" : "#37352f",
  };
  if (disabled) return <span style={style}>{children}</span>;
  return (
    <Link href={href} style={style}>
      {children}
    </Link>
  );
}
