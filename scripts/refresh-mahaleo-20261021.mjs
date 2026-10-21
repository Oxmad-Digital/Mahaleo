// Prépare les WebP et fiches, puis --apply publie sur R2 et dans Product.
// Les pages continuent de lire exclusivement les données de l'administration.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import env from "@next/env";
import sharp from "sharp";
import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

setDefaultAutoSelectFamilyAttemptTimeout(5000);
env.loadEnvConfig(process.cwd());
const directory = "output/catalogue-mahaleo-20261021";
const save = (path, data, options) => writeFile(path, JSON.stringify(data, null, 2) + "\n", options);
const read = async (path) => JSON.parse(await readFile(path, "utf8"));
const digest = (buffer) => createHash("sha256").update(buffer).digest("hex");
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fields = ["name", "description", "color", "colorName", "material", "fit", "images"];
const pick = (product) => Object.fromEntries(fields.map((key) => [key, product[key]]));
const viewOrder = ["mannequin", "face", "dos", "detail"];
const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
if (!baseUrl) throw new Error("R2_PUBLIC_URL absent.");

const models = {
  bonnet: { name: "Bonnet à revers", file: "bonnet-a-revers", material: "Maille côtelée", fit: "Bonnet à large revers et calotte façonnée.", description: (thread) => `Un bonnet en maille côtelée avec un large revers et une calotte façonnée. Le nom Mahaleo et une guitare sont brodés en ${thread} sur le revers.` },
  echarpe: { name: "Écharpe à franges", file: "echarpe-a-franges", material: "Maille côtelée", fit: "Format rectangulaire à longues franges.", description: (thread) => `Une écharpe rectangulaire en maille côtelée, terminée par de longues franges. Le nom Mahaleo et la guitare, brodés en ${thread}, signent les deux extrémités.` },
  gilet: { name: "Gilet zippé", file: "gilet-zippe", material: "Maille avec finitions côtelées", fit: "Coupe droite, manches longues et col montant zippé.", description: (thread) => `Un gilet en maille à fermeture zippée intégrale et col montant, avec deux poches obliques et des finitions côtelées. Le nom Mahaleo est brodé en ${thread} sur la poitrine gauche, et une guitare souligne le bas de la manche droite.` },
  pull: { name: "Pull torsadé demi-zip", file: "pull-torsade-demi-zip", material: "Maille à torsades sur le devant, le dos et les manches", fit: "Coupe droite, manches longues, col montant et fermeture demi-zip.", description: (thread) => `Un pull à torsades sur le devant, le dos et les manches. Son col montant s’ouvre par un demi-zip à tirette contrastée. Les broderies ${thread === "écru" ? "écrues" : "rouges"} placent le nom Mahaleo sur la poitrine gauche et la guitare au bas de la manche droite.` },
  manteau: { name: "Manteau long", file: "manteau-long", material: "Maille avec col et finitions côtelés", fit: "Coupe longue ouverte, col châle, manches longues et deux poches plaquées.", description: (thread) => `Un manteau long en maille, ouvert sur le devant, avec un col châle côtelé et deux poches plaquées. Le nom Mahaleo est brodé en ${thread} sur la poitrine gauche, avec une guitare au bas de la manche droite.` },
};
const colors = {
  olive: { name: "Vert olive", file: "vert-olive", hex: "#464D29", thread: "écru" },
  taupe: { name: "Taupe chiné", file: "taupe-chine", hex: "#938674", thread: "rouge" },
  gris: { name: "Gris chiné", file: "gris-chine", hex: "#A4A5A1", thread: "rouge" },
};

async function verifyPublic(asset, buffer) {
  const response = await fetch(asset.url, { signal: AbortSignal.timeout(30000), cache: "no-store" });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/webp")) throw new Error(`WebP inaccessible : ${asset.key}`);
  if (digest(Buffer.from(await response.arrayBuffer())) !== digest(buffer)) throw new Error(`Contenu différent sur R2 : ${asset.key}`);
}

if (!process.argv.includes("--apply") && !process.argv.includes("--verify")) {
  const generation = await read(`${directory}/generation.json`);
  const before = await read(`${directory}/before.json`);
  const images = generation.images;
  if (images.length !== 40 || new Set(images.map((i) => i.id)).size !== 40) throw new Error("40 images distinctes sont nécessaires.");
  const portraits = images.filter((i) => i.view === "mannequin");
  if (portraits.length !== 10 || portraits.filter((i) => i.modelGender === "homme").length !== 5 || portraits.filter((i) => i.modelGender === "femme").length !== 5 || new Set(portraits.map((i) => i.modelDescription)).size !== 10) throw new Error("Il faut dix mannequins différents, cinq hommes et cinq femmes.");
  const updates = [];
  const assets = [];
  await mkdir(`${directory}/webp`, { recursive: true });
  for (const portrait of portraits) {
    const model = models[portrait.model];
    const color = colors[portrait.color];
    const matching = before.products.filter((p) => p.slug.startsWith(model.file + "-") && p.slug.endsWith(portrait.oldColor));
    if (matching.length !== 1) throw new Error(`Fiche cible ambiguë : ${portrait.id}`);
    const previous = matching[0];
    if (previous.images.length !== 4) throw new Error(`Nombre de vues modifié : ${previous.slug}`);
    const urls = [];
    for (const view of viewOrder) {
      const matches = images.filter((i) => i.model === portrait.model && i.color === portrait.color && i.view === view);
      if (matches.length !== 1) throw new Error(`Vue manquante ou dupliquée : ${portrait.id}/${view}`);
      const image = matches[0];
      const source = await readFile(image.originalPath);
      const body = await sharp(source).rotate().resize({ width: 1200, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toBuffer();
      const metadata = await sharp(body).metadata();
      if (metadata.format !== "webp" || metadata.width > metadata.height) throw new Error(`Format WebP invalide : ${image.id}`);
      const filename = `mahaleo-${model.file}-${color.file}-${view}`;
      const file = `${directory}/webp/${filename}.webp`;
      const hash = digest(body);
      const key = `products/mahaleo-20261021/${filename}-${hash.slice(0, 16)}.webp`;
      await writeFile(file, body);
      const asset = { id: image.id, file, key, url: `${baseUrl}/${key}`, hash, beforeBytes: source.length, afterBytes: body.length, width: metadata.width, height: metadata.height };
      assets.push(asset);
      urls.push(asset.url);
    }
    const data = { name: `${model.name} Mahaleo — ${color.name.toLowerCase()}`, description: model.description(color.thread), color: color.hex, colorName: color.name, material: model.material, fit: model.fit, images: urls };
    updates.push({ id: previous.id, slug: previous.slug, previous: pick(previous), data, modelGender: portrait.modelGender, modelDescription: portrait.modelDescription });
  }
  const summary = { products: updates.length, images: assets.length, maleModels: 5, femaleModels: 5, originalBytes: assets.reduce((n, a) => n + a.beforeBytes, 0), webpBytes: assets.reduce((n, a) => n + a.afterBytes, 0) };
  summary.reductionPercent = Math.round((1 - summary.webpBytes / summary.originalBytes) * 1000) / 10;
  await save(`${directory}/manifest.json`, { summary, assets, updates });
  console.log(JSON.stringify(summary));
  process.exit(0);
}

for (const key of ["DATABASE_URL", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"]) if (!process.env[key]) throw new Error(`Configuration manquante : ${key}`);
const sql = neon(process.env.DATABASE_URL);
const manifest = await read(`${directory}/manifest.json`);
const ids = manifest.updates.map((u) => u.id);
if (ids.length !== 10 || new Set(ids).size !== 10 || manifest.assets.length !== 40) throw new Error("Manifeste incomplet.");
const current = await sql`SELECT * FROM "Product" WHERE id = ANY(${ids}::text[]) ORDER BY id`;
const sizesBefore = await sql`SELECT * FROM "ProductSize" WHERE "productId" = ANY(${ids}::text[]) ORDER BY "productId", size`;
const buffers = new Map();
for (const asset of manifest.assets) {
  const buffer = await readFile(asset.file);
  if (digest(buffer) !== asset.hash || asset.url !== `${baseUrl}/${asset.key}`) throw new Error(`Fichier/manifeste modifié : ${asset.file}`);
  buffers.set(asset.key, buffer);
}

if (process.argv.includes("--apply")) {
  const changed = manifest.updates.filter((u) => {
    const product = current.find((p) => p.id === u.id);
    if (!product || (!equal(pick(product), u.previous) && !equal(pick(product), u.data))) throw new Error(`Fiche modifiée dans l'admin : ${u.slug}`);
    return !equal(pick(product), u.data);
  });
  const r2 = new S3Client({ region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
  for (const asset of manifest.assets) {
    const body = buffers.get(asset.key);
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: asset.key, Body: body, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
    await verifyPublic(asset, body);
    console.log(`R2 vérifié : ${asset.key}`);
  }
  if (changed.length) {
    await save(`${directory}/before-apply.json`, { products: current, sizes: sizesBefore }, { flag: "wx" }).catch((e) => { if (e.code !== "EEXIST") throw e; });
    const payload = JSON.stringify(changed);
    await sql.transaction([
      sql`SELECT id FROM "Product" WHERE id = ANY(${ids}::text[]) ORDER BY id FOR UPDATE`,
      sql`WITH incoming AS (SELECT * FROM jsonb_to_recordset(${payload}::jsonb) AS r(id text, previous jsonb, data jsonb)),
      guard AS (
        SELECT 1 / CASE WHEN count(*) = ${changed.length} THEN 1 ELSE 0 END AS ok
        FROM incoming i JOIN "Product" p ON p.id = i.id
        WHERE jsonb_build_object('name', p.name, 'description', p.description, 'color', p.color, 'colorName', p."colorName", 'material', p.material, 'fit', p.fit, 'images', to_jsonb(p.images)) = i.previous
      )
      UPDATE "Product" p SET name = i.data->>'name', description = i.data->>'description', color = i.data->>'color', "colorName" = i.data->>'colorName', material = i.data->>'material', fit = i.data->>'fit', images = ARRAY(SELECT jsonb_array_elements_text(i.data->'images')), "updatedAt" = now()
      FROM incoming i CROSS JOIN guard g WHERE p.id = i.id AND g.ok = 1`,
    ]);
  }
}

const after = await sql`SELECT * FROM "Product" WHERE id = ANY(${ids}::text[]) ORDER BY id`;
const sizesAfter = await sql`SELECT * FROM "ProductSize" WHERE "productId" = ANY(${ids}::text[]) ORDER BY "productId", size`;
for (const update of manifest.updates) {
  const product = after.find((p) => p.id === update.id);
  if (!product || !equal(pick(product), update.data)) throw new Error(`Fiche non conforme : ${update.slug}`);
  const old = current.find((p) => p.id === update.id);
  for (const key of Object.keys(old).filter((key) => ![...fields, "updatedAt"].includes(key))) if (!equal(old[key], product[key])) throw new Error(`Champ non ciblé changé : ${update.slug}/${key}`);
}
if (!equal(sizesBefore, sizesAfter)) throw new Error("Les stocks ont changé pendant la vérification ; contrôler les ventes concurrentes.");
for (const asset of manifest.assets) await verifyPublic(asset, buffers.get(asset.key));
await save(`${directory}/verification.json`, { ...manifest.summary, verifiedAt: new Date().toISOString(), publicWebpVerified: 40, productFieldsVerified: true, unrelatedFieldsPreserved: true, stocksPreserved: true, products: after.map((p) => ({ id: p.id, slug: p.slug, name: p.name, colorName: p.colorName, images: p.images })) });
console.log("10 fiches mises à jour et 40 WebP vérifiés ; prix, stocks et autres champs préservés.");
