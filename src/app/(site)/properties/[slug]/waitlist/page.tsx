import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WaitlistSignupForm } from "@/components/WaitlistSignupForm";
import { getPropertyBySlug, properties } from "@/data/properties";
import { getPropertyContent } from "@/lib/propertyContent";

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
  return { title: property ? `Join the waitlist — ${property.name}` : "Property not found" };
}

export default async function PropertyWaitlistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const content = await getPropertyContent(slug);
  const available = !property.isSubsidized && (content?.waitlistSignupEnabled ?? false);
  const contactName = content?.contactName ?? property.contactName;

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
        <span className="text-[#bdbdbd]">/</span> <span className="text-text">Waitlist</span>
      </div>

      <section className="flex flex-col gap-8 px-4 py-12 md:flex-row md:px-16">
        <div className="flex w-full flex-col gap-5 md:w-[360px] md:shrink-0">
          <div className="overflow-hidden rounded bg-surface shadow-card">
            <div className="flex h-[140px] items-center justify-center bg-[#eeeeee]">
              <span className="text-xs text-[#9e9e9e]">Property photo coming soon</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4">
              <span className="inline-flex w-fit items-center rounded-full border border-input-border px-3 py-1 text-xs font-medium text-[#424242]">
                Market rate
              </span>
              <h2 className="text-lg font-medium">{property.name}</h2>
              <span className="text-[13px] text-text-secondary">
                {property.address ?? "Address"}, {property.neighborhood ?? "Neighborhood"}
              </span>
            </div>
          </div>
          {available && (
            <div className="flex flex-col gap-3 rounded bg-surface p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-bg text-[11px] text-primary-dark">
                  Photo
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {contactName ?? "Property manager not listed yet"}
                  </span>
                  <span className="text-xs text-text-secondary">Property Manager</span>
                </div>
              </div>
              <span className="text-[13px] text-text-secondary">
                Your info goes directly to the on-site manager for this property.
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          {available ? (
            <WaitlistSignupForm propertyName={property.name} propertySlug={property.slug} />
          ) : (
            <div className="flex flex-col gap-4 rounded bg-surface p-8 shadow-card">
              <h1 className="text-xl font-medium">Waitlist signup isn&apos;t available</h1>
              <p className="text-sm leading-relaxed text-text-secondary">
                This property doesn&apos;t have waitlist signup set up right now — contact
                the leasing office directly and they can add you to the waitlist.
              </p>
              <Link
                href={`/properties/${property.slug}/contact`}
                className="w-fit rounded bg-primary px-6 py-2.5 text-[13px] font-medium uppercase tracking-wide text-white shadow-button"
              >
                Contact about this property
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
