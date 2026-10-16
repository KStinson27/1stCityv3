import { prisma } from "@/lib/prisma";

export const RENTAL_APPLICATION_KEY = "rental-application";

export async function getSiteDocument(key: string): Promise<{ url: string; fileName: string } | null> {
  const row = await prisma.siteDocument.findUnique({ where: { key } });
  if (!row) return null;
  return { url: row.url, fileName: row.fileName };
}
