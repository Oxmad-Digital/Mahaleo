import { RetroCatalog } from "@/components/home/RetroCatalog";
import { StoreShell } from "@/components/store/StoreChrome";
import { getShopProducts } from "@/lib/shop";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getShopProducts();

  return (
    <StoreShell className="retro-home">
      <div className="retro-masthead">
        <span>UNE HISTOIRE<br />QUI SE TRANSMET</span>
        <h1>BOUTIQUE OFFICIELLE MAHALEO</h1>
        <span>À PORTER.<br />À TRANSMETTRE.</span>
      </div>
      <RetroCatalog products={products} />
    </StoreShell>
  );
}
