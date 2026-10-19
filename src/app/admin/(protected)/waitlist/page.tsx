import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { properties } from "@/data/properties";
import { getAllPropertyContent, mergePropertyContent } from "@/lib/propertyContent";
import { WaitlistSignupsView } from "@/components/WaitlistSignupsView";
import { hasPermission, requirePagePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Waitlist Signups" };
export const dynamic = "force-dynamic";

export default async function WaitlistPage() {
  const { permissions } = await requirePagePermission("property_contact_submissions", "view");

  const [signups, contentBySlug] = await Promise.all([
    prisma.contactSubmission.findMany({
      where: { isWaitlistSignup: true },
      orderBy: { createdAt: "asc" },
    }),
    getAllPropertyContent(),
  ]);

  const groups = properties
    .map((property) => ({
      slug: property.slug,
      name: property.name,
      contactEmail: mergePropertyContent(property, contentBySlug[property.slug] ?? null).contactEmail,
      signups: signups.filter((s) => s.propertySlug === property.slug),
    }))
    .filter((group) => group.signups.length > 0);

  return (
    <WaitlistSignupsView
      groups={groups}
      canArchive={hasPermission(permissions, "property_contact_submissions", "archive")}
      canEmail={hasPermission(permissions, "property_contact_submissions", "edit")}
    />
  );
}
