import { prisma } from "@/lib/prisma";

export const MAINTENANCE_HOTLINE_KEY = "maintenance-hotline-phone";

export async function getSiteSetting(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}
