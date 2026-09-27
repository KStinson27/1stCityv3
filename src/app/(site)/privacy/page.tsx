import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-4 px-4 py-16 md:px-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-[15px] leading-relaxed text-text-secondary">
        This page is a placeholder. 1st City LLC&apos;s privacy policy needs to be
        drafted or reviewed by legal counsel before launch — see PLAN.md §8 — so no
        policy text has been generated here. Once that text is finalized, replace this
        page&apos;s content with it.
      </p>
    </section>
  );
}
