import type { Metadata } from "next";
import { getSiteDocument, RENTAL_APPLICATION_KEY } from "@/lib/siteDocument";
import { getSiteSetting, MAINTENANCE_HOTLINE_KEY } from "@/lib/siteSettings";
import { DocumentUploader } from "@/components/DocumentUploader";
import { MaintenanceHotlineForm } from "@/components/MaintenanceHotlineForm";
import { requirePagePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Documents" };
export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  await requirePagePermission("documents", "view");
  const [rentalApplication, maintenanceHotline] = await Promise.all([
    getSiteDocument(RENTAL_APPLICATION_KEY),
    getSiteSetting(MAINTENANCE_HOTLINE_KEY),
  ]);

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
        <MaintenanceHotlineForm settingKey={MAINTENANCE_HOTLINE_KEY} initial={maintenanceHotline} />
      </section>
    </>
  );
}
