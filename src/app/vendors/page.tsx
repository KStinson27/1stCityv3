import type { Metadata } from "next";
import { VendorForm } from "@/components/VendorForm";
import { SERVICE_TYPES } from "@/lib/validation";
import { properties } from "@/data/properties";

export const metadata: Metadata = { title: "Vendors" };

export default function VendorsPage() {
  return (
    <>
      <section className="flex max-w-[760px] flex-col gap-3.5 px-4 pb-2 pt-16 md:px-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Vendors &amp; Contractors
        </span>
        <h1 className="text-[36px] font-bold leading-tight">Partner with 1st City LLC</h1>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          We work with landscaping, maintenance, cleaning, and general contracting
          vendors across our {properties.length} properties. Tell us about your business
          below — our team reviews every submission.
        </p>
      </section>

      <section className="flex flex-col gap-8 px-4 pb-16 pt-10 md:flex-row md:px-16">
        <div className="flex w-full flex-col gap-7 md:w-[400px] md:shrink-0">
          <div className="flex flex-col gap-2.5">
            <h2 className="text-lg font-medium">What we look for</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Licensed and insured vendors with experience in residential properties.
              Include your standard rates, service area, and references where possible.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <h2 className="text-lg font-medium">Service categories</h2>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-input-border bg-background px-4 py-1.5 text-[13px] text-[#424242]"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded bg-primary-bg p-5">
            <span className="text-sm font-medium text-primary-dark">
              Questions before applying?
            </span>
            <a href="mailto:vendors@1stcityllc.example" className="text-sm text-primary-dark">
              vendors@1stcityllc.example
            </a>
          </div>
        </div>

        <div className="flex-1">
          <VendorForm />
        </div>
      </section>
    </>
  );
}
