// Préparation : node --dns-result-order=ipv4first scripts/compress-product-images.mjs
// Mise en ligne : node --dns-result-order=ipv4first scripts/compress-product-images.mjs --apply
import { glob, mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import env from "@next/env";
import sharp from "sharp";
import { neon } from "@neondatabase/serverless";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

setDefaultAutoSelectFamilyAttemptTimeout(5000);
env.loadEnvConfig(process.cwd());
for (const name of ["DATABASE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"]) {
  if (!process.env[name]) throw new Error(`Configuration manquante : ${name}`);
}
const sql = neon(process.env.DATABASE_URL);
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const baseUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
const directory = "output/catalogue-mahaleo/compressed-images";
const manifestPath = `${directory}/manifest.json`;
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const save = (path, data, options) => writeFile(path, JSON.stringify(data, null, 2) + "\n", options);

async function verifyPublic(asset, buffer) {
  const response = await fetch(asset.url, { signal: AbortSignal.timeout(30000), cache: "no-store" });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/webp")) {
    throw new Error(`Image WebP inaccessible : ${asset.url}`);
  }
  const downloaded = Buffer.from(await response.arrayBuffer());
  if (hash(downloaded) !== hash(buffer)) throw new Error(`Contenu R2 incorrect : ${asset.url}`);
}

if (!process.argv.includes("--apply")) {
  await mkdir(directory, { recursive: true });
  // Conserve le premier état ; une relance applique le manifeste déjà préparé.
  try {
    await readFile(manifestPath);
    throw new Error(`Préparation déjà présente : appliquer ou archiver ${directory} avant une nouvelle préparation.`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const products = await sql`SELECT * FROM "Product" ORDER BY slug`;
  const sizes = await sql`SELECT * FROM "ProductSize" ORDER BY "productId", size`;
  await save(`${directory}/before.json`, { products, sizes }, { flag: "wx" });
  // Réutilise les sources locales uniquement si leur empreinte correspond à la clé R2.
  const localByHash = new Map();
  for await (const path of glob("public/images/**/*.webp")) {
    const buffer = await readFile(path);
    localByHash.set(hash(buffer).slice(0, 16), buffer);
  }
  const assets = [];
  for (const source of new Set(products.flatMap((product) => product.images))) {
    let input;
    if (source.startsWith("/") && !source.startsWith("//")) {
      const publicRoot = resolve("public");
      const path = resolve(publicRoot, source.slice(1));
      if (!path.startsWith(publicRoot + sep)) throw new Error(`Chemin invalide : ${source}`);
      input = await readFile(path);
    } else if (source.startsWith(baseUrl + "/")) {
      const digest = source.match(/-([a-f0-9]{16})\.webp$/)?.[1];
      input = digest && localByHash.get(digest);
      if (!input) {
        const object = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: decodeURIComponent(source.slice(baseUrl.length + 1)) }));
        input = Buffer.from(await object.Body.transformToByteArray());
      }
    } else {
      throw new Error(`Source hors du projet : ${source}`);
    }
    const metadata = await sharp(input).metadata();
    if (metadata.pages > 1) throw new Error(`Image animée à traiter séparément : ${source}`);
    let output = await sharp(input).rotate().webp({ quality: 78, effort: 6 }).toBuffer();
    // Une image WebP déjà plus petite conserve ses octets et sa qualité.
    if (metadata.format === "webp" && input.length <= output.length) output = input;
    const outputMetadata = await sharp(output).metadata();
    if (outputMetadata.format !== "webp") throw new Error(`Conversion invalide : ${source}`);
    const digest = hash(output);
    const key = `products/compressed/${digest}.webp`;
    const file = `${directory}/${digest}.webp`;
    await writeFile(file, output);
    assets.push({ source, key, file, url: `${baseUrl}/${key}`, hash: digest, beforeBytes: input.length, afterBytes: output.length, width: outputMetadata.width, height: outputMetadata.height });
    console.log(`Compressée : ${assets.length} — ${input.length} → ${output.length} octets`);
  }
  const bySource = new Map(assets.map((asset) => [asset.source, asset.url]));
  const updates = products.map((product) => ({ id: product.id, slug: product.slug, previousImages: product.images, images: product.images.map((source) => bySource.get(source)) }));
  const beforeBytes = assets.reduce((total, asset) => total + asset.beforeBytes, 0);
  const afterBytes = assets.reduce((total, asset) => total + asset.afterBytes, 0);
  const summary = { products: products.length, images: assets.length, beforeBytes, afterBytes, reductionPercent: Math.round((1 - afterBytes / beforeBytes) * 1000) / 10 };
  await save(manifestPath, { summary, assets, updates }, { flag: "wx" });
  console.log(JSON.stringify(summary));
} else {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const before = JSON.parse(await readFile(`${directory}/before.json`, "utf8"));
  const current = await sql`SELECT id, images FROM "Product" ORDER BY id`;
  for (const update of manifest.updates) {
    const product = current.find((product) => product.id === update.id);
    if (!product || ![update.previousImages, update.images].some((images) => JSON.stringify(images) === JSON.stringify(product.images))) {
      throw new Error(`Galerie modifiée depuis la préparation : ${update.slug}`);
    }
  }
  // Valide tous les fichiers avant le premier upload.
  const buffers = new Map();
  for (const asset of manifest.assets) {
    const buffer = await readFile(asset.file);
    if (hash(buffer) !== asset.hash || asset.url !== `${baseUrl}/${asset.key}`) throw new Error(`Manifeste ou fichier incorrect : ${asset.file}`);
    buffers.set(asset.key, buffer);
  }
  for (const asset of manifest.assets) {
    const buffer = buffers.get(asset.key);
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: asset.key, Body: buffer, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
    await verifyPublic(asset, buffer);
    console.log(`R2 vérifié : ${asset.key}`);
  }
  const changed = manifest.updates.filter((update) => JSON.stringify(current.find((product) => product.id === update.id).images) !== JSON.stringify(update.images));
  if (changed.length) {
    const ids = changed.map((update) => update.id);
    const payload = JSON.stringify(changed);
    await sql.transaction([
      sql`SELECT id FROM "Product" WHERE id = ANY(${ids}::text[]) ORDER BY id FOR UPDATE`,
      sql`WITH incoming AS (
        SELECT id, images, "previousImages" FROM jsonb_to_recordset(${payload}::jsonb) AS r(id text, images text[], "previousImages" text[])
      ), guard AS (
        SELECT 1 / CASE WHEN count(*) = ${changed.length} THEN 1 ELSE 0 END AS ok
        FROM incoming i JOIN "Product" p ON p.id = i.id WHERE p.images = i."previousImages"
      )
      UPDATE "Product" p SET images = i.images, "updatedAt" = now()
      FROM incoming i CROSS JOIN guard g WHERE p.id = i.id AND g.ok = 1`,
    ]);
  }
  const afterProducts = await sql`SELECT * FROM "Product" ORDER BY slug`;
  const afterSizes = await sql`SELECT * FROM "ProductSize" ORDER BY "productId", size`;
  for (const product of before.products) {
    const after = afterProducts.find((entry) => entry.id === product.id);
    const expected = manifest.updates.find((entry) => entry.id === product.id).images;
    if (!after || JSON.stringify(after.images) !== JSON.stringify(expected)) throw new Error(`Images non mises à jour : ${product.slug}`);
    for (const field of Object.keys(product).filter((field) => !["images", "updatedAt"].includes(field))) {
      if (JSON.stringify(after[field]) !== JSON.stringify(product[field])) throw new Error(`Champ modifié pendant l'opération : ${product.slug}/${field}`);
    }
  }
  if (JSON.stringify(before.sizes) !== JSON.stringify(afterSizes)) throw new Error("Stocks modifiés pendant l'opération.");
  await save(`${directory}/verification.json`, { ...manifest.summary, updatedProducts: changed.length, publicWebpVerified: manifest.assets.length, productFieldsPreserved: true, stocksPreserved: true, products: manifest.updates.map(({ slug, images }) => ({ slug, images })) });
  console.log(`Migration terminée : ${changed.length} fiches mises à jour. ${JSON.stringify(manifest.summary)}`);
}
