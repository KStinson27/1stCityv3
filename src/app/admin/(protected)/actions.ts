"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { SubmissionStatus, UnitAvailabilityStatus } from "@/generated/prisma/enums";
import type { IncomeLimitRow } from "@/lib/types";

const VALID_STATUSES: SubmissionStatus[] = ["NEW", "REVIEWED", "CONTACTED", "DECLINED"];
const VALID_UNIT_STATUSES: UnitAvailabilityStatus[] = ["AVAILABLE", "WAITLIST", "FULL", "CONTACT"];

function revalidatePropertyPaths(propertySlug: string) {
  revalidatePath(`/properties/${propertySlug}`);
  revalidatePath(`/properties/${propertySlug}/contact`);
  revalidatePath("/properties");
  revalidatePath("/");
  revalidatePath("/admin/properties");
}

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

export async function archiveVendorSubmission(id: string, archived: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }

  await prisma.vendorSubmission.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });

  revalidatePath("/admin/vendor-submissions");
}

export async function deleteVendorSubmission(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }

  await prisma.vendorSubmission.delete({ where: { id } });
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

  revalidatePropertyPaths(propertySlug);
}

export async function updatePropertyContent(
  propertySlug: string,
  data: {
    description: string;
    amenities: string[];
    incomeLimits: { householdSize: string; maxAnnualIncome: string }[];
    requiredDocuments: string[];
    applyUrl: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }

  const amenities = data.amenities.map((a) => a.trim()).filter(Boolean);
  const requiredDocuments = data.requiredDocuments.map((d) => d.trim()).filter(Boolean);
  const incomeLimits: IncomeLimitRow[] = data.incomeLimits
    .map((row) => ({
      householdSize: row.householdSize.trim(),
      maxAnnualIncome: row.maxAnnualIncome.trim() || null,
    }))
    .filter((row) => row.householdSize.length > 0);

  await prisma.propertyContent.upsert({
    where: { propertySlug },
    create: {
      propertySlug,
      description: data.description.trim() || null,
      amenities,
      incomeLimits: incomeLimits.length > 0 ? incomeLimits : Prisma.JsonNull,
      requiredDocuments,
      applyUrl: data.applyUrl.trim() || null,
      contactName: data.contactName.trim() || null,
      contactPhone: data.contactPhone.trim() || null,
      contactEmail: data.contactEmail.trim() || null,
    },
    update: {
      description: data.description.trim() || null,
      amenities,
      incomeLimits: incomeLimits.length > 0 ? incomeLimits : Prisma.JsonNull,
      requiredDocuments,
      applyUrl: data.applyUrl.trim() || null,
      contactName: data.contactName.trim() || null,
      contactPhone: data.contactPhone.trim() || null,
      contactEmail: data.contactEmail.trim() || null,
    },
  });

  revalidatePropertyPaths(propertySlug);
}

export async function deletePropertyPhoto(photoId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }

  const photo = await prisma.propertyPhoto.delete({ where: { id: photoId } });
  revalidatePropertyPaths(photo.propertySlug);
}

export async function reorderPropertyPhotos(propertySlug: string, photoIds: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }

  await prisma.$transaction(
    photoIds.map((id, index) =>
      prisma.propertyPhoto.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );

  revalidatePropertyPaths(propertySlug);
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

export async function archiveContactSubmission(id: string, archived: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }

  await prisma.contactSubmission.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });

  revalidatePath("/admin/contact-submissions");
}

export async function deleteContactSubmission(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }

  await prisma.contactSubmission.delete({ where: { id } });
  revalidatePath("/admin/contact-submissions");
}
