import type { UnitAvailabilityStatus } from "@/generated/prisma/enums";
import type { Unit } from "@/lib/types";

export type UnitAvailabilityRow = {
  unitType: string;
  status: UnitAvailabilityStatus;
  rent: string | null;
  availability: string | null;
};

export type OverlayMap = Record<string, UnitAvailabilityRow>;

const STATUS_RANK: Record<UnitAvailabilityStatus, number> = {
  AVAILABLE: 0,
  WAITLIST: 1,
  FULL: 2,
  CONTACT: 3,
};

export function mergeUnits(units: Unit[], overlay: OverlayMap): Unit[] {
  return units.map((unit) => {
    const override = overlay[unit.type];
    if (!override) return unit;
    return {
      ...unit,
      rent: override.rent ?? unit.rent,
      availability: override.availability ?? unit.availability,
    };
  });
}

export function computePropertyStatus(units: Unit[], overlay: OverlayMap): UnitAvailabilityStatus {
  if (units.length === 0) return "CONTACT";
  let best: UnitAvailabilityStatus = "CONTACT";
  for (const unit of units) {
    const status = overlay[unit.type]?.status ?? "CONTACT";
    if (STATUS_RANK[status] < STATUS_RANK[best]) best = status;
  }
  return best;
}

/**
 * Lowest rent across a property's units, for card views — e.g. "$900".
 * Rent is free text (admins type "$900", "$1,200/mo", etc.), not a
 * number, so this pulls the first numeric run out of each unit's
 * effective rent (mergeUnits' resolution) and takes the minimum of
 * whatever parses. Returns null if nothing does, so callers can fall
 * back to today's "Contact us" treatment.
 */
export function computeStartingRent(units: Unit[], overlay: OverlayMap): string | null {
  const amounts = mergeUnits(units, overlay)
    .map((unit) => unit.rent)
    .filter((rent): rent is string => Boolean(rent))
    .map((rent) => parseFloat(rent.replace(/,/g, "").match(/\d+(\.\d+)?/)?.[0] ?? ""))
    .filter((amount) => !Number.isNaN(amount));

  if (amounts.length === 0) return null;
  return `$${Math.min(...amounts).toLocaleString()}`;
}

const STATUS_BADGE: Record<UnitAvailabilityStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Units available", className: "bg-primary-bg text-primary-dark" },
  WAITLIST: { label: "Waitlist", className: "bg-[#FFF3E0] text-[#E65100]" },
  FULL: { label: "Fully leased", className: "border border-input-border text-[#424242]" },
  CONTACT: { label: "Contact for availability", className: "border border-input-border text-[#424242]" },
};

export function describeStatus(status: UnitAvailabilityStatus) {
  return STATUS_BADGE[status];
}
