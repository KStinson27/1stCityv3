"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { Prisma } from "@/generated/prisma/client";
import type { SubmissionStatus, UnitAvailabilityStatus } from "@/generated/prisma/enums";
import type { IncomeLimitRow } from "@/lib/types";
import { getPropertyBySlug } from "@/data/properties";
import { getPropertyContent, mergePropertyContent } from "@/lib/propertyContent";
import { sendEmail } from "@/lib/email";
import { renderEmailHtml } from "@/lib/emailTemplate";
import {
  ACTIONS,
  RESOURCES,
  requirePermission,
  type Action,
  type Resource,
} from "@/lib/permissions";

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
  await requirePermission("vendor_submissions", "edit");
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
  await requirePermission("vendor_submissions", "archive");

  await prisma.vendorSubmission.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });

  revalidatePath("/admin/vendor-submissions");
}

export async function deleteVendorSubmission(id: string) {
  await requirePermission("vendor_submissions", "delete");

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
  await requirePermission("properties", "edit");
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
    waitlistSignupEnabled: boolean;
    residentPortalUrl: string;
  },
) {
  await requirePermission("properties", "edit");

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
      waitlistSignupEnabled: data.waitlistSignupEnabled,
      residentPortalUrl: data.residentPortalUrl.trim() || null,
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
      waitlistSignupEnabled: data.waitlistSignupEnabled,
      residentPortalUrl: data.residentPortalUrl.trim() || null,
    },
  });

  revalidatePropertyPaths(propertySlug);
}

export async function deletePropertyPhoto(photoId: string) {
  await requirePermission("properties", "edit");

  const photo = await prisma.propertyPhoto.delete({ where: { id: photoId } });
  revalidatePropertyPaths(photo.propertySlug);
}

export async function reorderPropertyPhotos(propertySlug: string, photoIds: string[]) {
  await requirePermission("properties", "edit");

  await prisma.$transaction(
    photoIds.map((id, index) =>
      prisma.propertyPhoto.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );

  revalidatePropertyPaths(propertySlug);
}

/** general_contact_submissions for a general inquiry, property_contact_submissions for one tied to a property. */
function contactResource(propertySlug: string | null): Resource {
  return propertySlug ? "property_contact_submissions" : "general_contact_submissions";
}

export async function updateContactSubmission(input: {
  id: string;
  status: SubmissionStatus;
  internalNote: string;
}) {
  const submission = await prisma.contactSubmission.findUniqueOrThrow({
    where: { id: input.id },
    select: { propertySlug: true },
  });
  await requirePermission(contactResource(submission.propertySlug), "edit");
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
  const submission = await prisma.contactSubmission.findUniqueOrThrow({
    where: { id },
    select: { propertySlug: true },
  });
  await requirePermission(contactResource(submission.propertySlug), "archive");

  await prisma.contactSubmission.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });

  revalidatePath("/admin/contact-submissions");
  revalidatePath("/admin/waitlist");
}

export async function deleteContactSubmission(id: string) {
  const submission = await prisma.contactSubmission.findUniqueOrThrow({
    where: { id },
    select: { propertySlug: true },
  });
  await requirePermission(contactResource(submission.propertySlug), "delete");

  await prisma.contactSubmission.delete({ where: { id } });
  revalidatePath("/admin/contact-submissions");
}

export async function emailWaitlistToManager(
  propertySlug: string,
): Promise<{ count: number; to: string }> {
  await requirePermission("property_contact_submissions", "edit");

  const property = getPropertyBySlug(propertySlug);
  if (!property) throw new Error("Property not found.");

  const [contentRow, signups] = await Promise.all([
    getPropertyContent(propertySlug),
    prisma.contactSubmission.findMany({
      where: { propertySlug, isWaitlistSignup: true, archivedAt: null },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const to = mergePropertyContent(property, contentRow).contactEmail;
  if (!to) {
    throw new Error(
      `No contact email set for ${property.name} yet — add one on its Properties admin page first.`,
    );
  }
  if (signups.length === 0) {
    throw new Error(`No active waitlist signups for ${property.name} right now.`);
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const lines = signups.map(
    (s, i) =>
      `${i + 1}. ${s.name}\n   Email: ${s.email}\n   Phone: ${s.phone ?? "—"}\n   Unit type: ${s.unitType ?? "—"}\n   Signed up: ${dateFormatter.format(s.createdAt)}`,
  );
  const text = `${signups.length} waitlist signup${signups.length === 1 ? "" : "s"} for ${property.name}:\n\n${lines.join("\n\n")}`;

  await sendEmail({
    to,
    subject: `${property.name} — waitlist signups (${signups.length})`,
    text,
    html: renderEmailHtml({
      heading: `${property.name} — waitlist signups`,
      intro: `${signups.length} active signup${signups.length === 1 ? "" : "s"}, sent on request from the admin Waitlist page.`,
      items: signups.map((s) => ({
        title: s.name,
        fields: [
          { label: "Email", value: s.email, href: `mailto:${s.email}` },
          ...(s.phone ? [{ label: "Phone", value: s.phone, href: `tel:${s.phone}` }] : []),
          { label: "Unit type", value: s.unitType ?? "—" },
          { label: "Signed up", value: dateFormatter.format(s.createdAt) },
        ],
      })),
    }),
    fromName: "1st City LLC Website",
  });

  return { count: signups.length, to };
}

type PermissionGrant = { resource: Resource; action: Action };

function validatePermissions(permissions: PermissionGrant[]) {
  for (const p of permissions) {
    if (!(RESOURCES as readonly string[]).includes(p.resource)) {
      throw new Error(`Unknown resource: ${p.resource}`);
    }
    if (!(ACTIONS as readonly string[]).includes(p.action)) {
      throw new Error(`Unknown action: ${p.action}`);
    }
  }
}

/**
 * Refuses a role/staff change that would leave zero staff accounts able
 * to manage roles or staff — the only guardrail against locking
 * everyone out of /admin/staff, since roles here are fully data-driven.
 */
async function assertStaffEditSurvives(options: {
  roleIdBeingEdited?: string;
  newPermissionsForThatRole?: PermissionGrant[];
  userIdBeingReassigned?: string;
  newRoleIdForThatUser?: string | null;
}) {
  const [roles, users] = await Promise.all([
    prisma.role.findMany({ include: { permissions: true } }),
    prisma.user.findMany({ select: { id: true, roleId: true } }),
  ]);

  const hasStaffEdit = (roleId: string) => {
    if (options.roleIdBeingEdited && roleId === options.roleIdBeingEdited && options.newPermissionsForThatRole) {
      return options.newPermissionsForThatRole.some((p) => p.resource === "staff" && p.action === "edit");
    }
    const role = roles.find((r) => r.id === roleId);
    return role?.permissions.some((p) => p.resource === "staff" && p.action === "edit") ?? false;
  };

  const effectiveRoleId = (user: { id: string; roleId: string | null }) =>
    options.userIdBeingReassigned && user.id === options.userIdBeingReassigned
      ? (options.newRoleIdForThatUser ?? null)
      : user.roleId;

  const survives = users.some((u) => {
    const roleId = effectiveRoleId(u);
    return roleId ? hasStaffEdit(roleId) : false;
  });

  if (!survives) {
    throw new Error("This change would leave no staff account able to manage roles or staff — refusing.");
  }
}

export async function createRole(name: string, permissions: PermissionGrant[]) {
  await requirePermission("staff", "edit");
  validatePermissions(permissions);
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Role name is required");
  }

  await prisma.role.create({
    data: {
      name: trimmedName,
      permissions: { create: permissions.map((p) => ({ resource: p.resource, action: p.action })) },
    },
  });

  revalidatePath("/admin/staff");
}

export async function updateRolePermissions(roleId: string, permissions: PermissionGrant[]) {
  await requirePermission("staff", "edit");
  validatePermissions(permissions);
  await assertStaffEditSurvives({ roleIdBeingEdited: roleId, newPermissionsForThatRole: permissions });

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId, resource: p.resource, action: p.action })),
    }),
  ]);

  revalidatePath("/admin/staff");
}

export async function deleteRole(roleId: string) {
  await requirePermission("staff", "edit");
  const role = await prisma.role.findUniqueOrThrow({
    where: { id: roleId },
    include: { users: { select: { id: true } } },
  });
  if (role.users.length > 0) {
    throw new Error(
      `Can't delete "${role.name}" — ${role.users.length} staff account(s) still use it. Reassign them first.`,
    );
  }

  await prisma.role.delete({ where: { id: roleId } });
  revalidatePath("/admin/staff");
}

export async function createStaffAccount(input: {
  name: string;
  email: string;
  password: string;
  roleId: string | null;
}) {
  await requirePermission("staff", "edit");

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) {
    throw new Error("Name is required");
  }
  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required");
  }
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with that email already exists");
  }

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name,
      email,
      emailVerified: true,
      roleId: input.roleId,
    },
  });

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      // Better Auth's credential sign-in looks up the account by
      // accountId === user.id (not the email) — see prisma/seed.ts.
      accountId: user.id,
      providerId: "credential",
      password: await hashPassword(input.password),
    },
  });

  revalidatePath("/admin/staff");
}

export async function updateStaffRole(userId: string, roleId: string | null) {
  await requirePermission("staff", "edit");
  await assertStaffEditSurvives({ userIdBeingReassigned: userId, newRoleIdForThatUser: roleId });

  await prisma.user.update({ where: { id: userId }, data: { roleId } });
  revalidatePath("/admin/staff");
}

export async function updateStaffName(userId: string, name: string) {
  await requirePermission("staff", "edit");
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name is required");
  }

  await prisma.user.update({ where: { id: userId }, data: { name: trimmed } });
  revalidatePath("/admin/staff");
}

export async function sendStaffPasswordReset(userId: string) {
  await requirePermission("staff", "reset_password");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true },
  });

  await auth.api.requestPasswordReset({
    body: {
      email: user.email,
      redirectTo: `${SITE_URL}/admin/reset-password`,
    },
  });
}

/**
 * Recovery path for a staff member who's lost both their authenticator
 * device and backup codes — Better Auth's own disableTwoFactor endpoint
 * only acts on the caller's own session, so this does the same thing
 * directly for another user's account.
 */
export async function resetStaffTwoFactor(userId: string) {
  await requirePermission("staff", "edit");

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false } }),
    prisma.twoFactor.deleteMany({ where: { userId } }),
  ]);
  revalidatePath("/admin/staff");
}
