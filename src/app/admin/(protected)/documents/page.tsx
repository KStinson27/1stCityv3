import type { Metadata } from "next";
import { getSiteDocument, RENTAL_APPLICATION_KEY } from "@/lib/siteDocument";
import { DocumentUploader } from "@/components/DocumentUploader";

export const metadata: Metadata = { title: "Documents" };
export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const rentalApplication = await getSiteDocument(RENTAL_APPLICATION_KEY);

  return (
    <>
      <section className="flex flex-col gap-1 px-4 pt-8 md:px-16">
        <h1 className="text-[26px] font-bold">Documents</h1>
        <p className="text-sm text-text-secondary">
          Shared documents, available for download from the site.
        </p>
      </section>

      <section className="flex flex-col gap-5 px-4 pb-12 pt-5 md:px-16">
        <DocumentUploader
          documentKey={RENTAL_APPLICATION_KEY}
          label="Rental application (PDF) — shown on every affordable-housing property page"
          initial={rentalApplication}
        />
      </section>
    </>
  );
}
