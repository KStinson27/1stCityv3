"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SubmissionStatus } from "@/generated/prisma/enums";

const VALID_STATUSES: SubmissionStatus[] = ["NEW", "REVIEWED", "CONTACTED", "DECLINED"];

export async function updateVendorSubmission(input: {
  id: string;
  status: SubmissionStatus;
  internalNote: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }
  if (!VALID_STATUSES.includes(input.status)) {
    throw new Error("Invalid status");
  }

  await prisma.vendorSubmission.update({
    where: { id: input.id },
    data: {
      status: input.status,
      internalNote: input.internalNote.trim() || null,
    },
  });

  revalidatePath("/admin");
}
