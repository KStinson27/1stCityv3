import type { Metadata } from "next";
import { PropertiesExplorer } from "@/components/PropertiesExplorer";
import { properties } from "@/data/properties";
import { computePropertyStatus, getUnitAvailabilityForAllProperties } from "@/lib/unitAvailability";
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

      <PropertiesExplorer
        properties={properties}
        initialFilter={initialFilter}
        statusBySlug={statusBySlug}
        photosBySlug={photosBySlug}
      />
    </section>
  );
}
