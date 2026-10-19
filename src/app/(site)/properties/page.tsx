import type { Metadata } from "next";
import { PropertiesExplorer } from "@/components/PropertiesExplorer";
import { PropertiesMap } from "@/components/PropertiesMap";
import { properties } from "@/data/properties";
import {
  computePropertyStatus,
  computeStartingRent,
  getUnitAvailabilityForAllProperties,
} from "@/lib/unitAvailability";
import { getAllPropertyPhotos, resolvePhotos } from "@/lib/propertyContent";

export const metadata: Metadata = {
  title: "Properties",
};

// Geocoded from each property's street address in src/data/properties.ts
// (this environment has no outbound access to a geocoding API, so these
// are placed from knowledge of the named street/cross-street rather than
// a live lookup — worth a spot-check against Google Maps, but they're
// real addresses, not guesses). Comstock Tower is in Kalamazoo, ~140mi
// from the rest of the portfolio — kept on the map, but excluded from
// the initial-view calculation below so it doesn't force the Detroit
// cluster to zoom out to fit it.
const PROPERTY_COORDS: Record<string, [number, number]> = {
  "devin-apartments": [42.3838, -83.1022], // 2710-2740 W Chicago Blvd, Boston-Edison
  "west-chicago-apartments": [42.3838, -83.1124], // 3410 W Chicago Blvd, Boston-Edison
  "lanier-court-apartments": [42.3652, -83.0135], // 3801 Holcomb St, Gratiot Woods
  "noel-village": [42.3511, -83.0282], // 2158 Chene St, Eastside Historic District
  "marketplace-court": [42.3478, -83.0376], // 3676 Rivard St, Eastern Market
  "cultural-gardens": [42.3732, -83.0689], // 500 Frederick St, Midtown/New Center
  "orchestra-tower": [42.3568, -83.0589], // 3501 Woodward Ave, Midtown/Downtown
  "comstock-tower": [42.3161, -85.5519], // 5285 E H Ave, Kalamazoo
};

const DETROIT_METRO_SLUGS = new Set([
  "devin-apartments",
  "west-chicago-apartments",
  "lanier-court-apartments",
  "noel-village",
  "marketplace-court",
  "cultural-gardens",
  "orchestra-tower",
]);

function detroitMetroCenter(): [number, number] {
  const metro = Object.entries(PROPERTY_COORDS).filter(([slug]) => DETROIT_METRO_SLUGS.has(slug));
  return [
    metro.reduce((sum, [, [lat]]) => sum + lat, 0) / metro.length,
    metro.reduce((sum, [, [, lng]]) => sum + lng, 0) / metro.length,
  ];
}

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
            .filter((p) => PROPERTY_COORDS[p.slug])
            .map((p) => ({
              slug: p.slug,
              name: p.name,
              neighborhood: p.neighborhood,
              lat: PROPERTY_COORDS[p.slug][0],
              lng: PROPERTY_COORDS[p.slug][1],
            }))}
          initialCenter={detroitMetroCenter()}
          initialZoom={12}
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
