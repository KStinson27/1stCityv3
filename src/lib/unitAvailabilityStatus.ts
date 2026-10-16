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

const STATUS_BADGE: Record<UnitAvailabilityStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Units available", className: "bg-primary-bg text-primary-dark" },
  WAITLIST: { label: "Waitlist", className: "bg-[#FFF3E0] text-[#E65100]" },
  FULL: { label: "Fully leased", className: "border border-input-border text-[#424242]" },
  CONTACT: { label: "Contact for availability", className: "border border-input-border text-[#424242]" },
};

export function describeStatus(status: UnitAvailabilityStatus) {
  return STATUS_BADGE[status];
}
