import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
  return settings ?? { id: SETTINGS_ID, maintenanceMode: false, updatedAt: new Date() };
}

export async function setMaintenanceMode(enabled: boolean) {
  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, maintenanceMode: enabled },
    update: { maintenanceMode: enabled },
  });
}

export async function getAdmins() {
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  });
}
