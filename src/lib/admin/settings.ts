import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";
const CACHE_TTL_MS = 10_000;

type SiteSettings = Awaited<ReturnType<typeof loadSiteSettings>>;

// Le proxy lit ces réglages à chaque requête : on garde le résultat en mémoire
// pour ne pas payer un aller-retour Postgres avant chaque rendu de page.
let cache: { value: SiteSettings; expiresAt: number } | null = null;
let inFlight: Promise<SiteSettings> | null = null;
let generation = 0;
// Dernière valeur lue avec succès. Le proxy s'exécute sur chaque page : sans ce
// repli, une coupure passagère de Postgres ferait échouer le middleware et donc
// tomber le site entier, au lieu de le laisser servir le dernier état connu.
let lastKnown: SiteSettings | null = null;

async function loadSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  return settings ?? { id: SETTINGS_ID, maintenanceMode: false, updatedAt: new Date() };
}

export async function getSiteSettings() {
  if (cache && cache.expiresAt > Date.now()) return cache.value;

  if (!inFlight) {
    const requestGeneration = generation;
    inFlight = loadSiteSettings()
      .then((value) => {
        if (requestGeneration === generation) {
          cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
        }
        lastKnown = value;
        return value;
      })
      .catch((error) => {
        console.error("Lecture des réglages du site impossible :", error);
        // On ne met pas ce repli en cache : la prochaine requête retentera.
        return lastKnown ?? { id: SETTINGS_ID, maintenanceMode: false, updatedAt: new Date() };
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}

export function invalidateSiteSettings() {
  generation += 1;
  cache = null;
  inFlight = null;
}

export async function setMaintenanceMode(enabled: boolean) {
  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, maintenanceMode: enabled },
    update: { maintenanceMode: enabled },
  });
  invalidateSiteSettings();
}

export async function getAdmins() {
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  });
}
