"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SubmissionStatus, UnitAvailabilityStatus } from "@/generated/prisma/enums";

const VALID_STATUSES: SubmissionStatus[] = ["NEW", "REVIEWED", "CONTACTED", "DECLINED"];
const VALID_UNIT_STATUSES: UnitAvailabilityStatus[] = ["AVAILABLE", "WAITLIST", "FULL", "CONTACT"];

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

  revalidatePath("/admin/vendor-submissions");
}

export async function updateUnitAvailability(
  propertySlug: string,
  rows: {
    unitType: string;
    status: UnitAvailabilityStatus;
    rent: string;
    availability: string;
  }[],
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }
  for (const row of rows) {
    if (!VALID_UNIT_STATUSES.includes(row.status)) {
      throw new Error("Invalid status");
    }
  }

  await prisma.$transaction(
    rows.map((row) =>
      prisma.unitAvailability.upsert({
        where: { propertySlug_unitType: { propertySlug, unitType: row.unitType } },
        create: {
          propertySlug,
          unitType: row.unitType,
          status: row.status,
          rent: row.rent.trim() || null,
          availability: row.availability.trim() || null,
        },
        update: {
          status: row.status,
          rent: row.rent.trim() || null,
          availability: row.availability.trim() || null,
        },
      }),
    ),
  );

  revalidatePath(`/properties/${propertySlug}`);
  revalidatePath("/properties");
  revalidatePath("/");
  revalidatePath("/admin/properties");
}

export async function updateContactSubmission(input: {
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

  await prisma.contactSubmission.update({
    where: { id: input.id },
    data: {
      status: input.status,
      internalNote: input.internalNote.trim() || null,
    },
  });

  revalidatePath("/admin/contact-submissions");
}
