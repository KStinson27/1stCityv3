import { prisma } from "@/lib/prisma";
import type { IncomeLimitRow, Property } from "@/lib/types";

export type PropertyContentFields = {
  description: string | null;
  amenities: string[];
  incomeLimits: IncomeLimitRow[] | null;
  requiredDocuments: string[];
  applyUrl: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  waitlistSignupEnabled: boolean;
  residentPortalUrl: string | null;
};

function toContentFields(row: {
  description: string | null;
  amenities: string[];
  incomeLimits: unknown;
  requiredDocuments: string[];
  applyUrl: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  waitlistSignupEnabled: boolean;
  residentPortalUrl: string | null;
}): PropertyContentFields {
  return {
    description: row.description,
    amenities: row.amenities,
    incomeLimits: (row.incomeLimits as IncomeLimitRow[] | null) ?? null,
    requiredDocuments: row.requiredDocuments,
    applyUrl: row.applyUrl,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    waitlistSignupEnabled: row.waitlistSignupEnabled,
    residentPortalUrl: row.residentPortalUrl,
  };
}

export async function getPropertyContent(propertySlug: string): Promise<PropertyContentFields | null> {
  const row = await prisma.propertyContent.findUnique({ where: { propertySlug } });
  return row ? toContentFields(row) : null;
}

export async function getAllPropertyContent(): Promise<Record<string, PropertyContentFields>> {
  const rows = await prisma.propertyContent.findMany();
  const result: Record<string, PropertyContentFields> = {};
  for (const row of rows) result[row.propertySlug] = toContentFields(row);
  return result;
}

export function mergePropertyContent(
  property: Property,
  content: PropertyContentFields | null,
): PropertyContentFields {
  if (!content) {
    return {
      description: property.description,
      amenities: property.amenities,
      incomeLimits: property.incomeLimits,
      requiredDocuments: property.requiredDocuments,
      applyUrl: property.applyUrl,
      contactName: property.contactName,
      contactPhone: property.contactPhone,
      contactEmail: property.contactEmail,
      // No static-data equivalent (this is a brand-new, admin-only
      // toggle) — off is the only sane default for a property nobody's
      // edited in the admin yet.
      waitlistSignupEnabled: false,
      residentPortalUrl: null,
    };
  }
  return content;
}

export async function getPropertyPhotos(propertySlug: string): Promise<string[]> {
  const rows = await getPropertyPhotoRows(propertySlug);
  return rows.map((row) => row.url);
}

export async function getPropertyPhotoRows(
  propertySlug: string,
): Promise<{ id: string; url: string }[]> {
  return prisma.propertyPhoto.findMany({
    where: { propertySlug },
    orderBy: { sortOrder: "asc" },
    select: { id: true, url: true },
  });
}

export async function getAllPropertyPhotos(): Promise<Record<string, string[]>> {
  const rows = await prisma.propertyPhoto.findMany({ orderBy: { sortOrder: "asc" } });
  const result: Record<string, string[]> = {};
  for (const row of rows) {
    result[row.propertySlug] ??= [];
    result[row.propertySlug].push(row.url);
  }
  return result;
}

export function resolvePhotos(property: Property, dbPhotos: string[]): string[] {
  return dbPhotos.length > 0 ? dbPhotos : property.photos;
}
