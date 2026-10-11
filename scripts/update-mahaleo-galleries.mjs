// Import ponctuel des galeries dans Product.images ; aucune donnée statique dans les pages.
// Usage : node --dns-result-order=ipv4first scripts/update-mahaleo-galleries.mjs [--apply]
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import env from "@next/env";
import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

setDefaultAutoSelectFamilyAttemptTimeout(5000);
env.loadEnvConfig(process.cwd());
const { products } = JSON.parse(await readFile("output/catalogue-mahaleo/products.json", "utf8"));
const manifest = JSON.parse(await readFile("output/catalogue-mahaleo/gallery-generation.json", "utf8"));
const fronts = JSON.parse(await readFile("output/catalogue-mahaleo/import-result.json", "utf8"));
const views = ["mannequin", "dos", "detail"];
const plans = products.map((product) => {
  const model = product.slug.split("-")[0];
  const color = product.slug.endsWith("bleu-chine") ? "blue" : "grey";
  const assets = views.map((view) => {
    const matches = manifest.images.filter((image) => image.model === model && image.color === color && image.view === view);
    if (matches.length !== 1) throw new Error(`Vue manquante ou dupliquée : ${product.slug}/${view}`);
    return matches[0];
  });
  const initialImages = fronts.find((entry) => entry.slug === product.slug)?.images;
  // L'import initial peut déjà contenir les quatre vues sur une nouvelle base.
  const front = initialImages?.[initialImages.length === 4 ? 1 : 0];
  if (!front) throw new Error(`Face originale absente : ${product.slug}`);
  return { slug: product.slug, assets, front };
});
// Valide tous les fichiers avant toute écriture distante.
for (const plan of plans) for (const asset of plan.assets) await readFile(asset.assetPath);
if (!process.argv.includes("--apply")) {
  console.table(plans.map((plan) => ({ slug: plan.slug, ordre: "mannequin, face, dos, détail", nouvellesPhotos: plan.assets.length })));
  process.exit(0);
}
for (const key of ["DATABASE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"]) {
  if (!process.env[key]) throw new Error(`Configuration manquante : ${key}`);
}
const sql = neon(process.env.DATABASE_URL);
const slugs = plans.map((plan) => plan.slug);
const beforeProducts = await sql`SELECT * FROM "Product" WHERE slug = ANY(${slugs}::text[]) ORDER BY slug`;
const beforeSizes = await sql`SELECT s.* FROM "ProductSize" s JOIN "Product" p ON p.id = s."productId" WHERE p.slug = ANY(${slugs}::text[]) ORDER BY p.slug, s.size`;
if (beforeProducts.length !== plans.length) throw new Error("Une fiche cible est absente en base.");
try {
  await writeFile("output/catalogue-mahaleo/before-gallery-update.json", JSON.stringify({ products: beforeProducts, sizes: beforeSizes }, null, 2) + "\n", { flag: "wx" });
} catch (error) {
  if (error.code !== "EEXIST") throw error;
}
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const updates = [];
for (const plan of plans) {
  const uploaded = {};
  for (const asset of plan.assets) {
    const buffer = await readFile(asset.assetPath);
    const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
    const key = `products/mahaleo-20261011/${plan.slug}-${asset.view}-${hash}.webp`;
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: buffer, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
    const url = `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
    const response = await fetch(url);
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`Image inaccessible : ${plan.slug}/${asset.view}`);
    await response.arrayBuffer();
    uploaded[asset.view] = url;
  }
  const current = beforeProducts.find((product) => product.slug === plan.slug);
  const images = [uploaded.mannequin, plan.front, uploaded.dos, uploaded.detail];
  // Une relance ne réécrit pas l'ordre éventuellement changé depuis dans l'admin.
  const alreadyImported = images.every((url) => current.images.includes(url));
  if (!alreadyImported && (current.images.length !== 1 || current.images[0] !== plan.front)) {
    throw new Error(`Galerie déjà modifiée dans l'admin : ${plan.slug}. Import arrêté, aucune fiche modifiée.`);
  }
  updates.push({ slug: plan.slug, images: alreadyImported ? current.images : images, previousImages: current.images, changed: !alreadyImported });
  console.log(`Images vérifiées : ${plan.slug}`);
}
// Verrouille les fiches et vérifie leur galerie dans la même transaction.
// Une édition des photos pendant les uploads annule toutes les écritures.
const changed = updates.filter((update) => update.changed);
if (changed.length) {
  const payload = JSON.stringify(changed.map(({ slug, images, previousImages }) => ({ slug, images, previousImages })));
  await sql.transaction([
    sql`SELECT id FROM "Product" WHERE slug = ANY(${slugs}::text[]) ORDER BY id FOR UPDATE`,
    sql`WITH incoming AS (
      SELECT slug, images, "previousImages" FROM jsonb_to_recordset(${payload}::jsonb) AS r(slug text, images text[], "previousImages" text[])
    ), guard AS (
      SELECT 1 / CASE WHEN count(*) = ${changed.length} THEN 1 ELSE 0 END AS ok
      FROM incoming i JOIN "Product" p ON p.slug = i.slug WHERE p.images = i."previousImages"
    )
    UPDATE "Product" p SET images = i.images, "updatedAt" = now()
    FROM incoming i CROSS JOIN guard g WHERE p.slug = i.slug AND g.ok = 1`,
  ]);
}
const afterProducts = await sql`SELECT * FROM "Product" WHERE slug = ANY(${slugs}::text[]) ORDER BY slug`;
for (const before of beforeProducts) {
  const after = afterProducts.find((product) => product.id === before.id);
  for (const key of Object.keys(before).filter((key) => !["images", "updatedAt"].includes(key))) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) throw new Error(`Champ changé pendant l'import : ${before.slug}/${key}`);
  }
  if (after.images.length !== 4) throw new Error(`Galerie incomplète : ${after.slug}`);
}
await writeFile("output/catalogue-mahaleo/gallery-import-result.json", JSON.stringify(updates.map(({ slug, images }) => ({ slug, images })), null, 2) + "\n");
console.log(`${changed.length} galeries mises à jour ; ${updates.length} fiches à 4 images, prix et autres champs préservés.`);
