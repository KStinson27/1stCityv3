import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyBySlug } from "@/data/properties";
import { getUnitAvailabilityForSlug } from "@/lib/unitAvailability";
import { UnitAvailabilityForm } from "@/components/UnitAvailabilityForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  return { title: property?.name ?? "Property not found" };
}

export default async function AdminPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const overlay = await getUnitAvailabilityForSlug(slug);

  return (
    <>
      <section className="flex flex-col gap-1 px-4 pt-8 md:px-16">
        <Link href="/admin/properties" className="text-sm text-primary hover:text-primary-dark">
          ← Properties
        </Link>
        <h1 className="text-[26px] font-bold">{property.name}</h1>
      </section>

      <section className="flex flex-col gap-5 px-4 pb-12 pt-5 md:px-16">
        {property.units.length === 0 ? (
          <p className="text-sm text-text-secondary">
            This property has no unit types defined in its data yet — add them in code
            before setting availability here.
          </p>
        ) : (
          <UnitAvailabilityForm
            propertySlug={property.slug}
            units={property.units.map((unit) => ({
              unitType: unit.type,
              status: overlay[unit.type]?.status ?? "CONTACT",
              rent: overlay[unit.type]?.rent ?? "",
              availability: overlay[unit.type]?.availability ?? "",
            }))}
          />
        )}
      </section>
    </>
  );
}
