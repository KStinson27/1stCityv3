import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminQueue } from "@/components/AdminQueue";
import { hasPermission, requirePagePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Vendor Submissions" };
export const dynamic = "force-dynamic";

export default async function VendorSubmissionsPage() {
  const { permissions } = await requirePagePermission("vendor_submissions", "view");

  const submissions = await prisma.vendorSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminQueue
      submissions={submissions}
      canEdit={hasPermission(permissions, "vendor_submissions", "edit")}
      canArchive={hasPermission(permissions, "vendor_submissions", "archive")}
      canDelete={hasPermission(permissions, "vendor_submissions", "delete")}
    />
  );
}
