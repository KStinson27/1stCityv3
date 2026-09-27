import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPropertyBySlug, properties } from "@/data/properties";

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  return { title: property?.name ?? "Property not found" };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  return (
    <>
      <div className="border-b border-border bg-surface px-4 py-4 text-sm text-text-secondary md:px-16">
        <Link href="/properties" className="text-primary hover:text-primary-dark">
          Properties
        </Link>{" "}
        <span className="text-[#bdbdbd]">/</span> <span className="text-text">{property.name}</span>
      </div>

      {/* Gallery */}
      <section className="flex flex-col gap-3 px-4 pt-10 md:px-16">
        {property.photos[0] ? (
          <div className="relative h-[280px] overflow-hidden rounded shadow-card md:h-[420px]">
            <Image
              src={property.photos[0]}
              alt={`${property.name} — main photo`}
              fill
              priority
              sizes="(min-width: 768px) 1024px, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-[280px] items-center justify-center rounded bg-[#eeeeee] shadow-card md:h-[420px]">
            <span className="text-sm text-[#9e9e9e]">Main property photo coming soon</span>
          </div>
        )}
        {property.photos.length > 1 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {property.photos.slice(1, 6).map((photo, i) => (
              <div key={photo} className="relative h-[100px] overflow-hidden rounded shadow-card">
                <Image
                  src={photo}
                  alt={`${property.name} — photo ${i + 2}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {["Kitchen", "Bedroom", "Bathroom", "Common area", "Exterior"].map((label) => (
              <div
                key={label}
                className="flex h-[100px] items-center justify-center rounded bg-background shadow-card"
              >
                <span className="text-[11px] text-[#9e9e9e]">{label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Title block */}
      <section className="flex flex-col gap-3 px-4 pt-9 md:px-16">
        <div className="flex flex-wrap gap-2">
          <span
            className={
              "rounded-full px-3.5 py-1 text-xs font-medium " +
              (property.isSubsidized
                ? "bg-primary-bg text-primary-dark"
                : "border border-input-border text-[#424242]")
            }
          >
            {property.isSubsidized ? "Subsidized housing" : "Market rate"}
          </span>
        </div>
        <h1 className="text-[36px] font-bold">{property.name}</h1>
        <span className="text-[15px] text-text-secondary">
          {property.address ?? "Address"}, {property.neighborhood ?? "Neighborhood"} —{" "}
          {property.unitMixSummary ?? "Unit mix coming soon"}
        </span>

        {property.applyUrl ? (
          <div className="flex items-center gap-3.5 pt-1">
            <a
              href={property.applyUrl}
              className="flex items-center gap-2 rounded bg-primary px-6 py-3 text-[13px] font-medium uppercase tracking-wide text-white shadow-button"
            >
              Apply online
            </a>
            <span className="text-[13px] text-text-secondary">
              Or complete a paper application at our leasing office
            </span>
          </div>
        ) : (
          <p className="pt-1 text-[13px] text-text-secondary">
            Online applications for this property aren&apos;t set up yet — contact the
            property manager below, or ask about a paper application at our leasing
            office.
          </p>
        )}
      </section>

      {/* Main content */}
      <section className="flex flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:px-16">
        <div className="flex flex-1 flex-col gap-9">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-medium">About this property</h2>
            <p className="text-[15px] leading-relaxed text-[#424242]">
              {property.description ??
                `A description for ${property.name} hasn't been added yet.`}
            </p>
          </div>

          {property.isSubsidized && (
            <div className="flex flex-col gap-3.5 rounded bg-primary-bg p-6">
              <h2 className="text-xl font-medium text-primary-dark">
                Eligibility &amp; how to apply
              </h2>
              {property.incomeLimits ? (
                <>
                  <p className="text-sm leading-relaxed text-primary-dark">
                    Income-based units require household income at or below the limits
                    below, set annually by HUD. Final eligibility is confirmed during
                    application review.
                  </p>
                  <div className="overflow-hidden rounded shadow-card">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-white">
                          <th className="px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-text-secondary">
                            Household size
                          </th>
                          <th className="px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-text-secondary">
                            Max. annual income
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {property.incomeLimits.map((row) => (
                          <tr key={row.householdSize} className="border-t border-border bg-[#fafafa]">
                            <td className="px-3.5 py-2.5 text-[13px]">{row.householdSize}</td>
                            <td className="px-3.5 py-2.5 text-[13px]">
                              {row.maxAnnualIncome ?? "Contact the leasing office"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-primary-dark">
                  Income limits for this property haven&apos;t been published yet —
                  contact the leasing office for current figures.
                </p>
              )}

              {property.requiredDocuments.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-bold uppercase tracking-wide text-primary-dark">
                    Typically required at application
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {property.requiredDocuments.map((doc) => (
                      <div key={doc} className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b5e20" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-[13px] text-primary-dark">{doc}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-[#4b6455]">
                    (confirm the exact document checklist for this property)
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium">Amenities</h2>
            {property.amenities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-[#424242]">{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                Amenities for this property haven&apos;t been added yet — contact the
                leasing office for details.
              </p>
            )}
          </div>

          {property.units.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-medium">Unit types</h2>
              <div className="overflow-hidden rounded shadow-card">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-background">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-text-secondary">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-text-secondary">
                        Bed / Bath
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-text-secondary">
                        Rent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-text-secondary">
                        Availability
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.units.map((unit) => (
                      <tr key={unit.type} className="border-t border-border bg-surface">
                        <td className="px-4 py-3.5 text-sm">{unit.type}</td>
                        <td className="px-4 py-3.5 text-sm">{unit.bedBath ?? "—"}</td>
                        <td className="px-4 py-3.5 text-sm">{unit.rent ?? "Contact us"}</td>
                        <td className="px-4 py-3.5 text-sm font-medium text-[#757575]">
                          {unit.availability ?? "Contact us"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex w-full flex-col gap-5 md:w-[340px] md:shrink-0">
          <div className="flex flex-col gap-4 rounded bg-surface p-6 shadow-card">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-bg text-[13px] text-primary-dark">
                Photo
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-medium">
                  {property.contactName ?? "Property manager not listed yet"}
                </span>
                <span className="text-[13px] text-text-secondary">Property Manager</span>
              </div>
            </div>
            <div className="h-px bg-border" />
            <span className="text-sm text-[#424242]">
              {property.contactPhone ?? "Phone number coming soon"}
            </span>
            <span className="text-sm text-[#424242]">
              {property.contactEmail ?? "Email coming soon"}
            </span>
            <Link
              href={`/properties/${property.slug}/contact`}
              className="rounded bg-primary py-2.5 text-center text-[13px] font-medium uppercase tracking-wide text-white shadow-button"
            >
              Contact about this property
            </Link>
          </div>
          <div className="flex items-start gap-2.5 rounded bg-primary-bg p-[18px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b5e20" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="M3 9l9-7 9 7" />
              <path d="M9 22V12h6v10" />
            </svg>
            <span className="text-[13px] leading-relaxed text-primary-dark">
              Equal Housing Opportunity. We do not discriminate on the basis of race,
              color, national origin, religion, sex, familial status, or disability.
              Reasonable accommodations available on request — see our{" "}
              <Link href="/about#commitment" className="underline">
                fair housing commitment
              </Link>
              .
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
