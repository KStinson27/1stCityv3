import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/types";
import type { UnitAvailabilityStatus } from "@/generated/prisma/enums";
import { describeStatus } from "@/lib/unitAvailabilityStatus";

export function PropertyCard({
  property,
  availabilityStatus,
  photos,
  startingRent,
}: {
  property: Property;
  availabilityStatus?: UnitAvailabilityStatus;
  photos?: string[];
  startingRent?: string | null;
}) {
  const availabilityBadge = availabilityStatus ? describeStatus(availabilityStatus) : null;
  const cardPhoto = (photos ?? property.photos)[0];
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="flex flex-col overflow-hidden rounded bg-surface shadow-card transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {cardPhoto ? (
        <div className="relative h-[200px] bg-[#eeeeee]">
          <Image
            src={cardPhoto}
            alt={property.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center bg-[#eeeeee]">
          <span className="text-[13px] text-[#9e9e9e]">Property photo coming soon</span>
        </div>
      )}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          <span
            className={
              "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium " +
              (property.isSubsidized
                ? "bg-primary-bg text-primary-dark"
                : "border border-input-border bg-background text-[#424242]")
            }
          >
            {property.isSubsidized ? "Affordable housing" : "Market rate"}
          </span>
          {availabilityBadge && (
            <span
              className={
                "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium " +
                availabilityBadge.className
              }
            >
              {availabilityBadge.label}
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium">{property.name}</h3>
        <span className="text-sm text-text-secondary">
          {property.neighborhood ?? "Neighborhood coming soon"}
        </span>
        {startingRent && (
          <span className="text-sm font-medium text-primary-dark">
            Starting at {startingRent}/mo
          </span>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-text-secondary">
            {property.unitMixSummary ?? "Unit mix coming soon"}
          </span>
          <span className="text-[13px] font-medium uppercase tracking-wide text-primary">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}
