import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { getPropertyBySlug, properties, subsidizedCount } from "@/data/properties";

const FEATURED_SLUGS = ["comstock-tower", "devin-apartments", "cultural-gardens"];

export default function HomePage() {
  const featured = FEATURED_SLUGS.map(getPropertyBySlug).filter(
    (property): property is NonNullable<typeof property> => Boolean(property)
  );

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center gap-10 bg-gradient-to-b from-primary-bg to-background px-4 py-16 md:flex-row md:px-16 md:py-20">
        <div className="flex max-w-[540px] flex-col gap-5">
          <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-dark shadow-card">
            Rental Properties &amp; Affordable Housing
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Quality homes across the city, for every budget.
          </h1>
          <p className="text-base leading-relaxed text-text-secondary">
            1st City LLC manages market-rate and subsidized housing throughout the metro
            area. Browse open units, see amenities and photos, and reach the property
            contact directly.
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Link
              href="/properties"
              className="rounded bg-primary px-6 py-3 text-center text-sm font-medium uppercase tracking-wide text-white shadow-button"
            >
              View Properties
            </Link>
            <Link
              href="#subsidized"
              className="rounded border border-primary px-6 py-3 text-center text-sm font-medium uppercase tracking-wide text-primary"
            >
              Subsidized Housing
            </Link>
          </div>
        </div>
        <div className="flex h-[300px] w-full items-center justify-center rounded bg-white shadow-card md:h-[380px]">
          <span className="text-sm font-medium text-[#9e9e9e]">
            Photo: exterior of a managed property
          </span>
        </div>
      </section>

      {/* Trust bar */}
      <section className="flex flex-col items-center gap-4 border-y border-border bg-surface px-4 py-6 md:flex-row md:justify-center md:gap-12 md:px-16">
        <TrustItem>{properties.length} managed properties</TrustItem>
        <TrustItem>Section 8 / housing assistance accepted at select locations</TrustItem>
        <TrustItem>Equal Housing Opportunity</TrustItem>
      </section>

      {/* Featured properties */}
      <section className="flex flex-col gap-10 px-4 py-16 md:px-16">
        <div className="flex max-w-[640px] flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Featured
          </span>
          <h2 className="text-3xl font-bold">Recently updated properties</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>
      </section>

      {/* Subsidized callout */}
      <section
        id="subsidized"
        className="flex flex-col items-center gap-10 bg-surface px-4 py-16 md:flex-row md:px-16"
      >
        <div className="flex max-w-[540px] flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Affordable housing
          </span>
          <h2 className="text-2xl font-bold leading-tight md:text-[28px]">
            Subsidized units at select properties
          </h2>
          <p className="text-[15px] leading-relaxed text-text-secondary">
            {subsidizedCount} of our {properties.length} properties participate in local
            and federal housing assistance programs. Each property page lists eligibility,
            income limits, and how to apply.
          </p>
          <div className="flex flex-col gap-2.5 pt-1">
            <TrustItem>
              Section 8 Housing Choice Vouchers accepted at select properties
            </TrustItem>
            <TrustItem>Income-based rent at qualifying properties</TrustItem>
            <TrustItem>
              Reasonable accommodations available for applicants and residents with
              disabilities
            </TrustItem>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/properties?filter=subsidized"
              className="rounded bg-primary px-6 py-3 text-sm font-medium uppercase tracking-wide text-white shadow-button"
            >
              See subsidized listings
            </Link>
            <Link href="/about#commitment" className="text-[13px] font-medium text-primary">
              Read our fair housing commitment
            </Link>
          </div>
        </div>
        <div className="flex h-[300px] w-full items-center justify-center rounded bg-background shadow-card md:h-[400px]">
          <span className="text-sm font-medium text-[#9e9e9e]">
            Photo: family in a managed unit
          </span>
        </div>
      </section>

      {/* Vendor callout */}
      <section className="flex flex-col items-start justify-between gap-6 bg-primary-dark px-4 py-14 md:flex-row md:items-center md:px-16">
        <div className="flex max-w-[640px] flex-col gap-2">
          <h2 className="text-2xl font-bold text-white">
            Are you a contractor or vendor?
          </h2>
          <p className="text-[15px] leading-relaxed text-[#c8e6c9]">
            We regularly work with landscaping, maintenance, and general contracting
            vendors across our properties. Submit a proposal and our team will follow up.
          </p>
        </div>
        <Link
          href="/vendors"
          className="shrink-0 rounded bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-primary-dark shadow-button"
        >
          Submit a proposal
        </Link>
      </section>
    </>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-[#424242]">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2e7d32"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
