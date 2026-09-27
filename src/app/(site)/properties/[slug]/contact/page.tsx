import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PropertyContactForm } from "@/components/PropertyContactForm";
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
  return { title: property ? `Contact about ${property.name}` : "Property not found" };
}

export default async function PropertyContactPage({
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
        <span className="text-[#bdbdbd]">/</span>{" "}
        <Link href={`/properties/${property.slug}`} className="text-primary hover:text-primary-dark">
          {property.name}
        </Link>{" "}
        <span className="text-[#bdbdbd]">/</span> <span className="text-text">Contact</span>
      </div>

      <section className="flex flex-col gap-8 px-4 py-12 md:flex-row md:px-16">
        <div className="flex w-full flex-col gap-5 md:w-[360px] md:shrink-0">
          <div className="overflow-hidden rounded bg-surface shadow-card">
            <div className="flex h-[140px] items-center justify-center bg-[#eeeeee]">
              <span className="text-xs text-[#9e9e9e]">Property photo coming soon</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4">
              <span
                className={
                  "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium " +
                  (property.isSubsidized
                    ? "bg-primary-bg text-primary-dark"
                    : "border border-input-border text-[#424242]")
                }
              >
                {property.isSubsidized ? "Subsidized housing" : "Market rate"}
              </span>
              <h2 className="text-lg font-medium">{property.name}</h2>
              <span className="text-[13px] text-text-secondary">
                {property.address ?? "Address"}, {property.neighborhood ?? "Neighborhood"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-bg text-[11px] text-primary-dark">
                Photo
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {property.contactName ?? "Property manager not listed yet"}
                </span>
                <span className="text-xs text-text-secondary">Property Manager</span>
              </div>
            </div>
            <span className="text-[13px] text-text-secondary">
              Your message goes directly to the on-site manager for this property.
            </span>
          </div>
        </div>

        <div className="flex-1">
          <PropertyContactForm propertyName={property.name} propertySlug={property.slug} />
        </div>
      </section>
    </>
  );
}
