import Link from "next/link";
import type { Metadata } from "next";
import { properties, subsidizedCount } from "@/data/properties";
import { EqualHousingLogo } from "@/components/EqualHousingLogo";

export const metadata: Metadata = { title: "About" };

// Bios are intentionally brief until real background/history copy is
// provided — see PLAN.md §8. Update these two strings directly when ready.
const LEADERSHIP = [
  {
    name: "Freddie Dubose",
    title: "Owner",
    bio: "Freddie Dubose is the owner of 1st City LLC.",
  },
  {
    name: "Lori Ann Stinson",
    title: "Director",
    bio: "Lori Ann Stinson is the director of 1st City LLC.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="flex max-w-[760px] flex-col gap-3.5 px-4 pb-2 pt-16 md:px-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          About Us
        </span>
        <h1 className="text-[38px] font-bold leading-tight">About 1st City LLC</h1>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          {/* Expand with 1-2 sentences on company mission/history once provided — see PLAN.md §8. */}
          1st City LLC manages quality market-rate and subsidized housing throughout the
          city.
        </p>
      </section>

      <section id="commitment" className="mt-8 flex flex-col gap-5 bg-surface px-4 py-12 md:px-16">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Our Commitment
          </span>
          <h2 className="text-2xl font-bold">Fair housing &amp; accessibility</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <EqualHousingLogo size={22} color="#2e7d32" className="mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed text-[#424242]">
              <strong>Equal Housing Opportunity.</strong> 1st City LLC does not
              discriminate on the basis of race, color, national origin, religion, sex,
              familial status, or disability in the sale, rental, or financing of
              housing.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <p className="text-sm leading-relaxed text-[#424242]">
              <strong>Reasonable accommodations.</strong> Applicants and residents with
              disabilities may request a reasonable accommodation or modification at any
              point in the application or tenancy process by contacting their property
              office directly, or by emailing{" "}
              <a href="mailto:info@1stcityllc.example" className="underline">
                info@1stcityllc.example
              </a>
              . {/* Swap in a dedicated accommodations contact/line here if one is set up. */}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8 px-4 py-14 md:px-16">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Leadership
          </span>
          <h2 className="text-[26px] font-bold">Meet the team</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {LEADERSHIP.map((person) => (
            <div key={person.name} className="flex flex-col gap-4 rounded bg-surface p-7 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-bg text-[13px] text-primary-dark">
                  Photo
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-medium">{person.name}</span>
                  <span className="text-xs uppercase tracking-wide text-text-secondary">
                    {person.title}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#424242]">{person.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-6 bg-primary-dark px-4 py-14 md:flex-row md:items-center md:px-16">
        <div className="flex max-w-[640px] flex-col gap-2">
          <h2 className="text-2xl font-bold text-white">
            {properties.length} properties across the city
          </h2>
          <p className="text-[15px] leading-relaxed text-[#c8e6c9]">
            {subsidizedCount} of our properties offer subsidized or income-based
            housing. Browse the full list to find amenities, photos, and the on-site
            contact for each location.
          </p>
        </div>
        <Link
          href="/properties"
          className="shrink-0 rounded bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-primary-dark shadow-button"
        >
          View properties
        </Link>
      </section>
    </>
  );
}
