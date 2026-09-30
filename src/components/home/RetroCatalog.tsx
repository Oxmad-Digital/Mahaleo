"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCents } from "@/lib/format";
import { effectivePriceCents } from "@/lib/pricing";
import type { ShopProduct } from "@/lib/shop";
import guitar from "../../assets/mahaleo/guitar-retro.webp";

type Filter = "all" | "tee" | "sweat";

function getShopCategory(product: Pick<ShopProduct, "productType" | "name" | "description">): Exclude<Filter, "all"> | "other" {
  const text = [product.productType, product.name, product.description].filter(Boolean).join(" ");
  const normalized = text.toLocaleLowerCase("fr");
  if (normalized.includes("sweat") || normalized.includes("hoodie") || normalized.includes("pull")) return "sweat";
  if (normalized.includes("t-shirt") || normalized.includes("tee") || normalized.includes("maillot")) return "tee";
  return "other";
}

function usePageSize() {
  const [size, setSize] = useState(3);
  useEffect(() => {
    const update = () => setSize(window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export function RetroCatalog({ products }: { products: ShopProduct[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(0);
  const pageSize = usePageSize();
  const filtered = useMemo(
    () => products.filter((product) => filter === "all" || getShopCategory(product) === filter),
    [filter, products],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function changeFilter(next: Filter) {
    setFilter(next);
    setPage(0);
  }

  return (
    <main className="retro-home-main">
      <aside className="retro-guitar">
        <div className="retro-panel-label"><span>MAHALEO</span><span>DEPUIS 1972</span></div>
        <div className="retro-guitar-image">
          <Image src={guitar} alt="" fill priority sizes="290px" />
          <div><span>UNE HISTOIRE</span><strong>QUI SE TRANSMET.</strong></div>
        </div>
        <div className="retro-archive-note">
          <span>Des cordes.<br />Des voix. Des générations.</span>
          <a href="https://www.mahaleo.com/groupe.htm" target="_blank" rel="noreferrer">LES ORIGINES ↗</a>
        </div>
      </aside>

      <section className="retro-shop" aria-labelledby="collection-title">
        <div className="retro-shop-heading">
          <h2 id="collection-title">LA COLLECTION <span>{String(filtered.length).padStart(2, "0")}</span></h2>
          <div className="retro-filters" aria-label="Filtrer les vêtements">
            {([["all", "Tout"], ["tee", "T-shirts"], ["sweat", "Sweats"]] as [Filter, string][]).map(([value, label]) => (
              <button key={value} type="button" className={filter === value ? "active" : ""} aria-pressed={filter === value} onClick={() => changeFilter(value)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="retro-products" aria-live="polite">
          {visible.length ? visible.map((product, index) => {
            const image = product.images[0] ?? "/images/product-photo-sample.webp";
            const availableSizes = product.sizes.filter((size) => size.stock > 0).map((size) => size.size);
            const soldOut = product.sizes.length > 0 && availableSizes.length === 0;
            return (
              <article className="retro-product" key={product.id}>
                <span className="retro-product-index">{String(safePage * pageSize + index + 1).padStart(2, "0")} / {getShopCategory(product) === "sweat" ? "SWEAT" : "PIÈCE"}</span>
                <Link href={`/produit/${product.slug}`} className="retro-product-image" aria-label={`Voir ${product.name}`}>
                  <img src={image} alt={product.name} />
                  <span aria-hidden="true">{soldOut ? "×" : "+"}</span>
                </Link>
                <div className="retro-product-info">
                  <div><Link href={`/produit/${product.slug}`}>{product.name}</Link><strong>{effectivePriceCents(product) !== product.priceCents && <s>{formatCents(product.priceCents, product.currency)}</s>}{formatCents(effectivePriceCents(product), product.currency)}</strong></div>
                  <p>{product.colorName || product.color ? `${product.colorName ?? product.color} · ` : ""}{soldOut ? "Rupture de stock" : "Collection officielle"}</p>
                  <div className="retro-product-meta">
                    <i style={{ background: product.color || "#332f26" }} aria-label={product.color ? `Couleur ${product.colorName ?? product.color}` : "Couleur non renseignée"} />
                    <span>{availableSizes.length ? availableSizes.join(" — ") : "INDISPONIBLE"}</span>
                  </div>
                </div>
              </article>
            );
          }) : <p className="retro-empty">Aucun produit dans cette catégorie pour le moment.</p>}
        </div>

        <div className="retro-collection-bottom">
          <p>Des pièces pensées comme des souvenirs de concert.</p>
          <div className="retro-pager">
            <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={safePage === 0} aria-label="Produits précédents">←</button>
            <span>{String(safePage + 1).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}</span>
            <button type="button" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={safePage >= pageCount - 1} aria-label="Produits suivants">→</button>
          </div>
        </div>
      </section>
    </main>
  );
}
