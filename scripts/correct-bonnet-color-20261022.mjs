// Prépare quatre retouches ; --apply remplace uniquement la galerie du bonnet olive.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import env from "@next/env";
import sharp from "sharp";
import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

setDefaultAutoSelectFamilyAttemptTimeout(5000);
env.loadEnvConfig(process.cwd());
const directory = "output/bonnet-color-20261022";
const read = async (file) => JSON.parse(await readFile(file, "utf8"));
const save = (file, data, options) => writeFile(file, JSON.stringify(data, null, 2) + "\n", options);
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
if (!baseUrl) throw new Error("R2_PUBLIC_URL absent.");
const original = await read("output/catalogue-mahaleo-20261021/manifest.json");
const target = original.updates.find((p) => p.slug === "bonnet-a-revers-bleu-chine");
if (!target || target.data.colorName !== "Vert olive") throw new Error("Fiche olive introuvable.");

if (!process.argv.includes("--apply") && !process.argv.includes("--verify")) {
  const generation = await read(`${directory}/generation.json`);
  const views = ["mannequin", "face", "dos", "detail"];
  if (generation.images.length !== 4 || new Set(generation.images.map((i) => i.view)).size !== 4) throw new Error("Quatre vues distinctes requises.");
  await mkdir(`${directory}/webp`, { recursive: true });
  const assets = [];
  for (const view of views) {
    const image = generation.images.find((i) => i.view === view);
    if (!image) throw new Error(`Vue absente : ${view}`);
    const source = await readFile(image.file);
    const body = await sharp(source).rotate().resize({ width: 1200, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toBuffer();
    const metadata = await sharp(body).metadata();
    if (metadata.format !== "webp" || metadata.width > metadata.height) throw new Error(`Format invalide : ${view}`);
    const digest = hash(body);
    const name = `mahaleo-bonnet-vert-olive-${view}-couleur-v2`;
    const file = `${directory}/webp/${name}.webp`;
    const key = `products/mahaleo-20261022/${name}-${digest.slice(0, 16)}.webp`;
    await writeFile(file, body);
    assets.push({ view, file, key, url: `${baseUrl}/${key}`, hash: digest, width: metadata.width, height: metadata.height, bytes: body.length });
  }
  await save(`${directory}/manifest.json`, { id: target.id, slug: target.slug, previousImages: target.data.images, images: assets.map((a) => a.url), assets });
  console.log("Quatre WebP préparés ; aucune donnée distante modifiée.");
  process.exit(0);
}

for (const name of ["DATABASE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"]) if (!process.env[name]) throw new Error(`Configuration manquante : ${name}`);
const manifest = await read(`${directory}/manifest.json`);
if (manifest.id !== target.id || manifest.assets.length !== 4 || !equal(manifest.previousImages, target.data.images) || !equal(manifest.images, manifest.assets.map((a) => a.url))) throw new Error("Manifeste invalide.");
const sql = neon(process.env.DATABASE_URL);
const [before] = await sql`SELECT * FROM "Product" WHERE id = ${manifest.id}`;
if (!before || (!equal(before.images, manifest.previousImages) && !equal(before.images, manifest.images))) throw new Error("Galerie modifiée depuis la référence ; contrôler avant de remplacer.");
const buffers = new Map();
for (const asset of manifest.assets) {
  const body = await readFile(asset.file);
  if (hash(body) !== asset.hash || asset.url !== `${baseUrl}/${asset.key}`) throw new Error(`Empreinte invalide : ${asset.view}`);
  buffers.set(asset.key, body);
}
async function verifyPublic(asset) {
  const response = await fetch(asset.url, { cache: "no-store", signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/webp") || hash(Buffer.from(await response.arrayBuffer())) !== asset.hash) throw new Error(`Image distante invalide : ${asset.view}`);
}
if (process.argv.includes("--apply")) {
  await save(`${directory}/before-apply.json`, { product: before }, { flag: "wx" }).catch((error) => { if (error.code !== "EEXIST") throw error; });
  const r2 = new S3Client({ region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
  for (const asset of manifest.assets) {
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: asset.key, Body: buffers.get(asset.key), ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
    await verifyPublic(asset);
    console.log(`R2 vérifié : ${asset.view}`);
  }
  if (!equal(before.images, manifest.images)) {
    const changed = await sql`UPDATE "Product" SET images = ${manifest.images}::text[], "updatedAt" = now() WHERE id = ${manifest.id} AND to_jsonb(images) = ${JSON.stringify(before.images)}::jsonb RETURNING id`;
    if (changed.length !== 1) throw new Error("Galerie modifiée pendant la publication ; remplacement annulé.");
  }
}
const [after] = await sql`SELECT * FROM "Product" WHERE id = ${manifest.id}`;
if (!equal(after.images, manifest.images)) throw new Error("Galerie non conforme en base.");
for (const field of Object.keys(before).filter((k) => !["images", "updatedAt"].includes(k))) if (!equal(before[field], after[field])) throw new Error(`Champ modifié pendant le contrôle : ${field}`);
for (const asset of manifest.assets) await verifyPublic(asset);
await save(`${directory}/verification.json`, { verifiedAt: new Date().toISOString(), id: after.id, slug: after.slug, publicWebpVerified: 4, galleryVerified: true, unrelatedProductFieldsPreserved: true, images: after.images });
console.log("Bonnet olive : quatre images publiées et vérifiées, autres champs préservés.");
