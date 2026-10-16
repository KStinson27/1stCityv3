import type { Metadata } from "next";
import Link from "next/link";
import { properties } from "@/data/properties";
import {
  computePropertyStatus,
  describeStatus,
  getUnitAvailabilityForAllProperties,
} from "@/lib/unitAvailability";

export const metadata: Metadata = { title: "Properties" };
export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const overlayByProperty = await getUnitAvailabilityForAllProperties();

  return (
    <>
      <section className="flex items-center justify-between px-4 pt-8 md:px-16">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Admin</span>
          <h1 className="text-[26px] font-bold">Properties</h1>
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 pb-12 pt-5 md:px-16">
        {properties.map((property) => {
          const overlay = overlayByProperty[property.slug] ?? {};
          const badge = describeStatus(computePropertyStatus(property.units, overlay));
          return (
            <Link
              key={property.slug}
              href={`/admin/properties/${property.slug}`}
              className="flex items-center justify-between gap-4 rounded bg-surface p-4 shadow-card transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{property.name}</span>
                <span className="text-xs text-text-secondary">
                  {property.units.length} unit type{property.units.length === 1 ? "" : "s"}
                </span>
              </div>
              <span className={"shrink-0 rounded-full px-3 py-1 text-xs font-medium " + badge.className}>
                {badge.label}
              </span>
            </Link>
          );
        })}
      </section>
    </>
  );
}
