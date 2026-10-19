import { prisma } from "@/lib/prisma";
import type { OverlayMap, UnitAvailabilityRow } from "@/lib/unitAvailabilityStatus";

export async function getUnitAvailabilityForSlug(propertySlug: string): Promise<OverlayMap> {
  const rows = await prisma.unitAvailability.findMany({ where: { propertySlug } });
  return toOverlayMap(rows);
}

export async function getUnitAvailabilityForAllProperties(): Promise<Record<string, OverlayMap>> {
  const rows = await prisma.unitAvailability.findMany();
  const result: Record<string, OverlayMap> = {};
  for (const row of rows) {
    result[row.propertySlug] ??= {};
    result[row.propertySlug][row.unitType] = row;
  }
  return result;
}

function toOverlayMap(rows: UnitAvailabilityRow[]): OverlayMap {
  const map: OverlayMap = {};
  for (const row of rows) map[row.unitType] = row;
  return map;
}

export {
  mergeUnits,
  computePropertyStatus,
  computeStartingRent,
  describeStatus,
} from "@/lib/unitAvailabilityStatus";
