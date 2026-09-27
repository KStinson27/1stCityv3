import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use" };

// Standard boilerplate terms of use, not yet reviewed by an attorney. 1st
// City LLC should have counsel review this — particularly the governing-law
// clause below — before relying on it. See PLAN.md §8/§9.
export default function TermsPage() {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-6 px-4 py-16 md:px-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Terms of Use</h1>
        <span className="text-sm text-text-secondary">Effective September 27, 2026</span>
      </div>

      <p className="text-[15px] leading-relaxed text-text-secondary">
        Welcome to this website (this &quot;Site&quot;), operated by 1st City LLC
        (&quot;1st City,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By
        accessing or using this Site, you agree to these Terms of Use. If you do not
        agree, please do not use this Site.
      </p>

      <Section title="Use of This Site">
        <p>
          This Site provides general information about 1st City LLC&apos;s managed
          properties and an online means to submit vendor proposals and property
          inquiries. You agree to use this Site only for lawful purposes and to provide
          accurate information in any form you submit.
        </p>
      </Section>

      <Section title="Not a Lease or Binding Offer">
        <p>
          Information on this Site — including unit availability, pricing, photos, and
          income limits — is provided for general informational purposes only and does
          not constitute a lease, an offer to lease, or a guarantee of availability. All
          applications are subject to our standard screening criteria and a signed
          lease agreement.
        </p>
      </Section>

      <Section title="Third-Party Links and Services">
        <p>
          This Site may link to or integrate with third-party services — for example,
          an online rental application platform. We are not responsible for the
          content, policies, or practices of any third-party site or service.
        </p>
      </Section>

      <Section title="Intellectual Property">
        <p>
          All content on this Site — including text, graphics, logos, and photographs —
          is the property of 1st City LLC or its licensors and may not be copied,
          reproduced, or distributed without our prior written permission.
        </p>
      </Section>

      <Section title="No Warranty">
        <p>
          This Site is provided &quot;as is&quot; and &quot;as available,&quot; without
          warranties of any kind, either express or implied, including but not limited
          to warranties of merchantability, fitness for a particular purpose, or
          non-infringement.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, 1st City LLC will not be liable for
          any indirect, incidental, special, or consequential damages arising out of or
          relating to your use of this Site.
        </p>
      </Section>

      <Section title="Equal Housing Opportunity">
        <p>
          1st City LLC does not discriminate on the basis of race, color, national
          origin, religion, sex, familial status, or disability. See our full{" "}
          <Link href="/about#commitment" className="text-primary underline">
            fair housing &amp; accessibility commitment
          </Link>{" "}
          on our About page.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These Terms are governed by the laws of the state in which our properties are
          located, without regard to its conflict of laws principles.
        </p>
      </Section>

      <Section title="Changes to These Terms">
        <p>
          We may revise these Terms from time to time. The effective date above
          reflects the latest revision. Continued use of the Site after changes are
          posted constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          Questions about these Terms can be directed to{" "}
          <a href="mailto:info@1stcityllc.example" className="text-primary underline">
            info@1stcityllc.example
          </a>{" "}
          or 220 Main Street, Suite 300, (555) 123-4567.
        </p>
      </Section>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-2 text-[15px] leading-relaxed text-text-secondary">
        {children}
      </div>
    </div>
  );
}
