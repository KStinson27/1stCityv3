import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/types";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="flex flex-col overflow-hidden rounded bg-surface shadow-card">
      {property.photos[0] ? (
        <div className="relative h-[200px] bg-[#eeeeee]">
          <Image
            src={property.photos[0]}
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
        <span
          className={
            "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium " +
            (property.isSubsidized
              ? "bg-primary-bg text-primary-dark"
              : "border border-input-border bg-background text-[#424242]")
          }
        >
          {property.isSubsidized ? "Subsidized housing" : "Market rate"}
        </span>
        <h3 className="text-lg font-medium">{property.name}</h3>
        <span className="text-sm text-text-secondary">
          {property.neighborhood ?? "Neighborhood coming soon"}
        </span>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-text-secondary">
            {property.unitMixSummary ?? "Unit mix coming soon"}
          </span>
          <Link
            href={`/properties/${property.slug}`}
            className="text-[13px] font-medium uppercase tracking-wide text-primary hover:text-primary-dark"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
