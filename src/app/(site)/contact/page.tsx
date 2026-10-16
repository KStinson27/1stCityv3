import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <section className="flex max-w-[760px] flex-col gap-3.5 px-4 pb-2 pt-16 md:px-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Contact Us
        </span>
        <h1 className="text-[36px] font-bold leading-tight">Get in touch</h1>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          Have a general question for 1st City LLC? Send us a message and our team will
          follow up. Looking to ask about a specific property or submit a vendor
          proposal? Use the contact form on that property&apos;s page, or our{" "}
          <a href="/vendors" className="text-primary hover:text-primary-dark">
            vendors page
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-8 px-4 pb-16 pt-10 md:flex-row md:px-16">
        <div className="flex w-full flex-col gap-7 md:w-[360px] md:shrink-0">
          <div className="flex flex-col gap-3 rounded bg-surface p-6 shadow-card">
            <h2 className="text-lg font-medium">Our office</h2>
            <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
              <span>28 W Adams, Ste 900, Detroit, MI 48226</span>
              <a href="tel:+13139654547" className="text-primary hover:text-primary-dark">
                (313) 965-4547
              </a>
              <a href="mailto:detroit1stcity@1stcityllc.com" className="text-primary hover:text-primary-dark">
                detroit1stcity@1stcityllc.com
              </a>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
