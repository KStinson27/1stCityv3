import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

// Standard boilerplate privacy policy, not yet reviewed by an attorney.
// 1st City LLC should have counsel review this — particularly the sections
// on data sharing and any state-specific privacy law obligations — before
// relying on it. See PLAN.md §8/§9.
export default function PrivacyPage() {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-6 px-4 py-16 md:px-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <span className="text-sm text-text-secondary">Effective September 27, 2026</span>
      </div>

      <p className="text-[15px] leading-relaxed text-text-secondary">
        1st City LLC (&quot;1st City,&quot; &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;) respects your privacy. This Privacy Policy explains what
        information we collect through this website (this &quot;Site&quot;), how we use
        it, and the choices you have. By using this Site, you agree to this Privacy
        Policy.
      </p>

      <Section title="Information We Collect">
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>
            <strong>Contact and vendor form information</strong> — your name, email,
            phone number, company name, and any message or attachment you submit
            through our vendor proposal or property contact forms.
          </li>
          <li>
            <strong>Automatically collected information</strong> — standard technical
            information such as your IP address, browser type, and pages visited,
            collected through server logs and hosting infrastructure.
          </li>
          <li>
            <strong>Cookies</strong> — we use a small number of essential cookies,
            primarily to keep staff securely signed in to our internal administrative
            tools. We do not use cookies for third-party advertising.
          </li>
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>Respond to vendor proposals and property inquiries</li>
          <li>Operate, maintain, and improve the Site</li>
          <li>Maintain the security of our internal systems</li>
          <li>Comply with legal obligations, including fair housing recordkeeping</li>
        </ul>
      </Section>

      <Section title="How We Share Your Information">
        <p>We do not sell your personal information. We may share it with:</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li>
            Service providers who help us operate the Site — for example, our email
            delivery provider, our hosting provider, and, for rental applications, our
            online leasing platform
          </li>
          <li>Law enforcement or regulators when required by law</li>
          <li>
            A successor entity in the event of a merger, acquisition, or sale of assets
          </li>
        </ul>
      </Section>

      <Section title="Data Retention">
        <p>
          We retain vendor and contact submissions for as long as reasonably necessary
          for the purposes described above, or as required by law.
        </p>
      </Section>

      <Section title="Your Choices">
        <p>
          You may contact us at any time to ask what information we have about you, or
          to request a correction or deletion, subject to any legal recordkeeping
          requirements — including fair housing law — that require us to retain certain
          records.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          This Site is not directed at children under 13, and we do not knowingly
          collect personal information from children under 13.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We use reasonable administrative and technical safeguards to protect the
          information we collect, but no method of transmission or storage is
          completely secure.
        </p>
      </Section>

      <Section title="Fair Housing">
        <p>
          1st City LLC is committed to Equal Housing Opportunity. See our full{" "}
          <Link href="/about#commitment" className="text-primary underline">
            fair housing &amp; accessibility commitment
          </Link>{" "}
          on our About page.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. The effective date above
          reflects the latest revision.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          Questions about this Privacy Policy can be directed to{" "}
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
