import type { Metadata } from "next";
import { PropertiesExplorer } from "@/components/PropertiesExplorer";
import { PropertiesMap } from "@/components/PropertiesMap";
import { properties } from "@/data/properties";

// DEMO ONLY — rough neighborhood-level coordinates, not geocoded from the
// real street addresses. Would need real lat/lng per property (one-time
// geocoding pass) before this ships. Comstock Tower (Kalamazoo) omitted —
// it's ~140mi from the rest of the portfolio, needs its own map or a much
// wider zoom.
const DEMO_COORDS: Record<string, [number, number]> = {
  "devin-apartments": [42.3707, -83.0996],
  "lanier-court-apartments": [42.3698, -83.0218],
  "noel-village": [42.3487, -83.0346],
  "west-chicago-apartments": [42.3762, -83.1086],
  "marketplace-court": [42.3465, -83.0372],
  "cultural-gardens": [42.3657, -83.0689],
  "orchestra-tower": [42.3317, -83.0527],
};
import {
  computePropertyStatus,
  computeStartingRent,
  getUnitAvailabilityForAllProperties,
} from "@/lib/unitAvailability";
import { getAllPropertyPhotos, resolvePhotos } from "@/lib/propertyContent";

export const metadata: Metadata = {
  title: "Properties",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const initialFilter =
    filter === "subsidized" || filter === "market-rate" ? filter : "all";

  const [overlayByProperty, photosByProperty] = await Promise.all([
    getUnitAvailabilityForAllProperties(),
    getAllPropertyPhotos(),
  ]);
  const statusBySlug = Object.fromEntries(
    properties.map((property) => [
      property.slug,
      computePropertyStatus(property.units, overlayByProperty[property.slug] ?? {}),
    ]),
  );
  const photosBySlug = Object.fromEntries(
    properties.map((property) => [
      property.slug,
      resolvePhotos(property, photosByProperty[property.slug] ?? []),
    ]),
  );
  const rentBySlug = Object.fromEntries(
    properties.map((property) => [
      property.slug,
      computeStartingRent(property.units, overlayByProperty[property.slug] ?? {}),
    ]),
  );

  return (
    <section className="px-4 py-12 md:px-16 md:py-14">
      <div className="mb-8 flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          {properties.length} properties
        </span>
        <h1 className="text-[34px] font-bold">Our properties</h1>
        <p className="max-w-[680px] text-[15px] text-text-secondary">
          Market-rate and affordable units across Michigan. Search or filter below, or
          open any listing for amenities, photos, and the on-site contact.
        </p>
      </div>

      <div className="mb-8">
        <PropertiesMap
          properties={properties
            .filter((p) => DEMO_COORDS[p.slug])
            .map((p) => ({
              slug: p.slug,
              name: p.name,
              neighborhood: p.neighborhood,
              lat: DEMO_COORDS[p.slug][0],
              lng: DEMO_COORDS[p.slug][1],
            }))}
        />
      </div>

      <PropertiesExplorer
        properties={properties}
        initialFilter={initialFilter}
        statusBySlug={statusBySlug}
        photosBySlug={photosBySlug}
        rentBySlug={rentBySlug}
      />
    </section>
  );
}
