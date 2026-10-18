-- AlterTable
ALTER TABLE "user" ADD COLUMN     "roleId" TEXT;

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_roleId_resource_action_key" ON "role_permission"("roleId", "resource", "action");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bootstrap: a full-access "Owner" role, so this migration never locks
-- anyone out of their own admin portal. Fixed, deterministic ids (not
-- cuid()) since this is a one-time data seed, not an app-generated row.
INSERT INTO "role" ("id", "name", "createdAt", "updatedAt")
VALUES ('role_owner_bootstrap', 'Owner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "role_permission" ("id", "roleId", "resource", "action")
VALUES
  ('rp_owner_vendor_submissions_view', 'role_owner_bootstrap', 'vendor_submissions', 'view'),
  ('rp_owner_vendor_submissions_edit', 'role_owner_bootstrap', 'vendor_submissions', 'edit'),
  ('rp_owner_vendor_submissions_archive', 'role_owner_bootstrap', 'vendor_submissions', 'archive'),
  ('rp_owner_vendor_submissions_delete', 'role_owner_bootstrap', 'vendor_submissions', 'delete'),
  ('rp_owner_general_contact_submissions_view', 'role_owner_bootstrap', 'general_contact_submissions', 'view'),
  ('rp_owner_general_contact_submissions_edit', 'role_owner_bootstrap', 'general_contact_submissions', 'edit'),
  ('rp_owner_general_contact_submissions_archive', 'role_owner_bootstrap', 'general_contact_submissions', 'archive'),
  ('rp_owner_general_contact_submissions_delete', 'role_owner_bootstrap', 'general_contact_submissions', 'delete'),
  ('rp_owner_property_contact_submissions_view', 'role_owner_bootstrap', 'property_contact_submissions', 'view'),
  ('rp_owner_property_contact_submissions_edit', 'role_owner_bootstrap', 'property_contact_submissions', 'edit'),
  ('rp_owner_property_contact_submissions_archive', 'role_owner_bootstrap', 'property_contact_submissions', 'archive'),
  ('rp_owner_property_contact_submissions_delete', 'role_owner_bootstrap', 'property_contact_submissions', 'delete'),
  ('rp_owner_properties_view', 'role_owner_bootstrap', 'properties', 'view'),
  ('rp_owner_properties_edit', 'role_owner_bootstrap', 'properties', 'edit'),
  ('rp_owner_documents_view', 'role_owner_bootstrap', 'documents', 'view'),
  ('rp_owner_documents_edit', 'role_owner_bootstrap', 'documents', 'edit'),
  ('rp_owner_staff_view', 'role_owner_bootstrap', 'staff', 'view'),
  ('rp_owner_staff_edit', 'role_owner_bootstrap', 'staff', 'edit')
ON CONFLICT ("id") DO NOTHING;

-- Any existing staff account (every account today, since roles didn't
-- exist before this migration) gets the Owner role so nobody loses
-- access to the portal they were already signed into.
UPDATE "user" SET "roleId" = 'role_owner_bootstrap' WHERE "roleId" IS NULL;
