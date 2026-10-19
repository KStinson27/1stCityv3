import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyBySlug } from "@/data/properties";
import { getUnitAvailabilityForSlug } from "@/lib/unitAvailability";
import {
  getPropertyContent,
  getPropertyPhotoRows,
  mergePropertyContent,
} from "@/lib/propertyContent";
import { UnitAvailabilityForm } from "@/components/UnitAvailabilityForm";
import { PropertyContentForm } from "@/components/PropertyContentForm";
import { PropertyPhotoManager } from "@/components/PropertyPhotoManager";
import { requirePagePermission } from "@/lib/permissions";

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
  await requirePagePermission("properties", "view");
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const [overlay, contentRow, photoRows] = await Promise.all([
    getUnitAvailabilityForSlug(slug),
    getPropertyContent(slug),
    getPropertyPhotoRows(slug),
  ]);
  const content = mergePropertyContent(property, contentRow);

  return (
    <>
      <section className="flex flex-col gap-1 px-4 pt-8 md:px-16">
        <Link href="/admin/properties" className="text-sm text-primary hover:text-primary-dark">
          ← Properties
        </Link>
        <h1 className="text-[26px] font-bold">{property.name}</h1>
      </section>

      <section className="flex flex-col gap-8 px-4 pb-12 pt-5 md:px-16">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#9e9e9e]">
            Unit availability
          </h2>
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
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#9e9e9e]">
            Property details
          </h2>
          <PropertyContentForm
            propertySlug={property.slug}
            showIncomeLimits={property.isSubsidized}
            showWaitlistToggle={!property.isSubsidized}
            initial={{
              description: content.description ?? "",
              amenities: content.amenities,
              incomeLimits: (content.incomeLimits ?? []).map((row) => ({
                householdSize: row.householdSize,
                maxAnnualIncome: row.maxAnnualIncome ?? "",
              })),
              requiredDocuments: content.requiredDocuments,
              applyUrl: content.applyUrl ?? "",
              contactName: content.contactName ?? "",
              contactPhone: content.contactPhone ?? "",
              contactEmail: content.contactEmail ?? "",
              waitlistSignupEnabled: content.waitlistSignupEnabled,
              residentPortalUrl: content.residentPortalUrl ?? "",
            }}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#9e9e9e]">Photos</h2>
          <PropertyPhotoManager propertySlug={property.slug} initialPhotos={photoRows} />
        </div>
      </section>
    </>
  );
}
