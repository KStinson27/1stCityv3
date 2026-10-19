import Link from "next/link";
import type { Metadata } from "next";
import { properties } from "@/data/properties";
import { getAllPropertyContent } from "@/lib/propertyContent";

export const metadata: Metadata = { title: "Residents" };

// Admin-editable content (the per-property resident portal link) needs
// to show up immediately after a save — see the property pages for
// the same reasoning, src/app/(site)/properties/[slug]/page.tsx.
export const dynamic = "force-dynamic";

// Placeholder copy — not yet reviewed, and the renters-insurance
// requirement specifics (coverage minimums, whether a tracking service
// like a named carrier is required) vary by lease and haven't been
// confirmed. Update before relying on this.
const FAQ: { question: string; answer: string }[] = [
  {
    question: "How do I pay rent?",
    answer:
      "Use your property's resident portal link above to pay online. If your property doesn't have a portal set up yet, contact the leasing office for payment options.",
  },
  {
    question: "How do I submit a maintenance request?",
    answer:
      "Submit a maintenance request through your resident portal, or call the work order hotline if your property doesn't use the portal for maintenance. For an emergency outside business hours — no heat, active flooding, no working smoke detector — call your property's emergency maintenance line first.",
  },
  {
    question: "What's the guest and pet policy?",
    answer:
      "Guest and pet policies (including any pet deposit or breed/weight restrictions) are set per property and detailed in your lease. Contact your leasing office if you're unsure what applies to your unit.",
  },
  {
    question: "Where do I park?",
    answer:
      "Parking varies by property — some include assigned or unassigned parking, others require a separate permit. Check your lease or ask your leasing office which applies to you.",
  },
  {
    question: "How do I renew my lease?",
    answer:
      "Your property manager will typically reach out 60–90 days before your lease ends with renewal terms. If you haven't heard from them and your lease end date is approaching, contact your leasing office.",
  },
];

export default async function ResidentsPage() {
  const content = await getAllPropertyContent();

  return (
    <>
      <section className="flex max-w-[760px] flex-col gap-3.5 px-4 pb-2 pt-16 md:px-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Residents
        </span>
        <h1 className="text-[38px] font-bold leading-tight">Resident Resources</h1>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          Pay rent online, find answers to common questions, and learn what&apos;s
          expected for renters insurance.
        </p>
      </section>

      <section className="mt-8 flex flex-col gap-5 px-4 py-10 md:px-16">
        <h2 className="text-2xl font-bold">Pay rent</h2>
        <div className="overflow-hidden rounded bg-surface shadow-card">
          {properties.map((property) => {
            const portalUrl = content[property.slug]?.residentPortalUrl ?? null;
            return (
              <div
                key={property.slug}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 first:border-t-0"
              >
                <span className="text-sm font-medium">{property.name}</span>
                {portalUrl ? (
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded bg-primary px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white shadow-button"
                  >
                    Pay rent →
                  </a>
                ) : (
                  <Link
                    href={`/properties/${property.slug}/contact`}
                    className="text-[13px] text-primary hover:text-primary-dark"
                  >
                    Contact the leasing office
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-5 bg-surface px-4 py-12 md:px-16">
        <h2 className="text-2xl font-bold">Resident FAQ</h2>
        <div className="flex flex-col gap-6">
          {FAQ.map((item) => (
            <div key={item.question} className="flex flex-col gap-1.5">
              <h3 className="text-base font-medium">{item.question}</h3>
              <p className="text-sm leading-relaxed text-[#424242]">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 px-4 py-12 md:px-16">
        <h2 className="text-2xl font-bold">Renters insurance</h2>
        <div className="flex max-w-[720px] flex-col gap-3 rounded bg-primary-bg p-6">
          <p className="text-sm leading-relaxed text-primary-dark">
            Most leases require renters insurance covering your personal property and
            liability for the full term of your tenancy. Renters insurance is
            inexpensive — often $10–20/month — and protects your belongings from
            things like fire, theft, and water damage, which your property&apos;s own
            insurance doesn&apos;t cover.
          </p>
          <p className="text-sm leading-relaxed text-primary-dark">
            Check your lease for the exact coverage minimums required, and provide
            proof of coverage to your leasing office before move-in and at each
            renewal.
          </p>
        </div>
      </section>
    </>
  );
}
