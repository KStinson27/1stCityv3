import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContactSubmissionQueue } from "@/components/ContactSubmissionQueue";

export const metadata: Metadata = { title: "Contact Submissions" };
export const dynamic = "force-dynamic";

export default async function ContactSubmissionsPage() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ContactSubmissionQueue submissions={submissions} />;
}
