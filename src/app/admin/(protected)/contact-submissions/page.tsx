import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContactSubmissionQueue } from "@/components/ContactSubmissionQueue";
import { hasPermission, requireSessionForPage } from "@/lib/permissions";

export const metadata: Metadata = { title: "Contact Submissions" };
export const dynamic = "force-dynamic";

export default async function ContactSubmissionsPage() {
  const { permissions } = await requireSessionForPage();

  const canViewGeneral = hasPermission(permissions, "general_contact_submissions", "view");
  const canViewProperty = hasPermission(permissions, "property_contact_submissions", "view");
  if (!canViewGeneral && !canViewProperty) redirect("/admin");

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
    where:
      canViewGeneral && canViewProperty
        ? undefined
        : canViewProperty
          ? { propertySlug: { not: null } }
          : { propertySlug: null },
  });

  return (
    <ContactSubmissionQueue
      submissions={submissions}
      general={{
        canEdit: hasPermission(permissions, "general_contact_submissions", "edit"),
        canArchive: hasPermission(permissions, "general_contact_submissions", "archive"),
        canDelete: hasPermission(permissions, "general_contact_submissions", "delete"),
      }}
      property={{
        canEdit: hasPermission(permissions, "property_contact_submissions", "edit"),
        canArchive: hasPermission(permissions, "property_contact_submissions", "archive"),
        canDelete: hasPermission(permissions, "property_contact_submissions", "delete"),
      }}
    />
  );
}
