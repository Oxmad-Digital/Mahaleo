// Import ponctuel : les pages continuent à lire Product et ProductSize en base.
// Usage: node --dns-result-order=ipv4first scripts/import-mahaleo-products.mjs [--apply]
import { readFile, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import env from "@next/env";
import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

setDefaultAutoSelectFamilyAttemptTimeout(5000);
env.loadEnvConfig(process.cwd());
const { products } = JSON.parse(await readFile("output/catalogue-mahaleo/products.json", "utf8"));
if (!process.argv.includes("--apply")) {
  console.table(products.map((p) => ({ slug: p.slug, euros: p.priceCents / 100, stock: p.sizes.reduce((n, s) => n + s.stock, 0) })));
  process.exit(0);
}
for (const key of ["DATABASE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"]) {
  if (!process.env[key]) throw new Error(`Configuration manquante : ${key}`);
}
const sql = neon(process.env.DATABASE_URL);
const originalProducts = await sql`SELECT * FROM "Product" ORDER BY slug`;
const originalSizes = await sql`SELECT * FROM "ProductSize" ORDER BY "productId", size`;
// Le premier état est conservé aussi lors d'une relance de l'import.
try {
  await writeFile("output/catalogue-mahaleo/before-import.json", JSON.stringify({ products: originalProducts, sizes: originalSizes }, null, 2) + "\n", { flag: "wx" });
} catch (error) {
  if (error.code !== "EEXIST") throw error;
}
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const existingSlugs = new Set(originalProducts.map((p) => p.slug));
const imported = [];
const queries = [];
for (const p of products) {
  // Une relance ne remplace pas les prix, photos et stocks modifiés dans l'admin.
  if (existingSlugs.has(p.slug)) {
    console.log(`Déjà présent, conservé : ${p.slug}`);
    continue;
  }
  const images = [];
  for (const path of p.localImages) {
    const buffer = await readFile(path);
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
    const key = `products/mahaleo-20261011/${p.slug}-${hash}.webp`;
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: buffer, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
    const url = `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
    const response = await fetch(url);
    if (!response.ok || !response.headers.get("content-type")?.includes("image/")) throw new Error(`Image inaccessible : ${p.slug}`);
    await response.arrayBuffer();
    images.push(url);
  }
  const id = randomUUID();
  queries.push(sql`INSERT INTO "Product" (id, slug, name, description, "productType", color, "colorName", material, fit, care, "priceCents", currency, images, "isPublished", "createdAt", "updatedAt")
    VALUES (${id}, ${p.slug}, ${p.name}, ${p.description}, ${p.productType}, ${p.color}, ${p.colorName}, ${p.material}, ${p.fit}, ${p.care}, ${p.priceCents}, ${p.currency}, ${images}, ${p.isPublished}, now(), now())
    ON CONFLICT (slug) DO NOTHING`);
  for (const s of p.sizes) {
    queries.push(sql`INSERT INTO "ProductSize" (id, "productId", size, stock)
      SELECT ${randomUUID()}, id, ${s.size}, ${s.stock} FROM "Product" WHERE slug = ${p.slug}
      ON CONFLICT ("productId", size) DO NOTHING`);
  }
  imported.push({ slug: p.slug, images });
}
// Retire les trois anciennes fiches de démonstration sans supprimer leurs IDs
// ni modifier les commandes, les prix ou les stocks historiques.
queries.push(sql`UPDATE "Product" SET "isPublished" = false, "updatedAt" = now()
  WHERE (id, slug) IN (
    ('cmts9zx9k0003d7apzalt8ovg', 'pull-creme-en-maille'),
    ('cmtsa10az0008d7aptjvp8tit', 'pull-creme-en-maille-2'),
    ('cmtsa1x94000dd7aprlxrthxe', 'pull-creme-en-maille-3')
  ) AND "isPublished" = true`);
await sql.transaction(queries);
await writeFile("output/catalogue-mahaleo/import-result.json", JSON.stringify(imported, null, 2) + "\n");
console.log(`${imported.length} nouvelles fiches importées ; données historiques conservées.`);
