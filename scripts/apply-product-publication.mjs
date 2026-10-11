// Fallback HTTPS for this additive migration when Postgres port 5432 is blocked.
import { readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import env from "@next/env";
import { neon } from "@neondatabase/serverless";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";

setDefaultAutoSelectFamilyAttemptTimeout(5000);
env.loadEnvConfig(process.cwd());
const sql = neon(process.env.DATABASE_URL);
const name = "20261011160000_product_publication";
const migration = await readFile(`prisma/migrations/${name}/migration.sql`, "utf8");
const checksum = createHash("sha256").update(migration).digest("hex");
const applied = await sql`SELECT checksum, finished_at, rolled_back_at FROM "_prisma_migrations" WHERE migration_name = ${name}`;
if (applied.length) {
  if (!applied.some((row) => row.checksum === checksum && row.finished_at && !row.rolled_back_at)) {
    throw new Error("Migration déjà enregistrée avec un état ou checksum différent.");
  }
  console.log("Migration de publication déjà appliquée.");
} else {
  await sql.transaction([
    sql.query(migration),
    sql`INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count)
      VALUES (${randomUUID()}, ${checksum}, ${name}, now(), 1)`,
  ]);
  console.log("Migration additive de publication appliquée et enregistrée.");
}
