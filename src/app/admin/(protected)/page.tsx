import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminQueue } from "@/components/AdminQueue";

export const metadata: Metadata = { title: "Vendor Submissions" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const submissions = await prisma.vendorSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AdminQueue submissions={submissions} />;
}
