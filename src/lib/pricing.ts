/** Prix réellement facturé, partagé entre la boutique et le checkout. */
export function effectivePriceCents(product: { priceCents: number; onSale: boolean; salePriceCents: number | null }) {
  return product.onSale && product.salePriceCents != null ? product.salePriceCents : product.priceCents;
}
