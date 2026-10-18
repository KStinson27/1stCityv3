-- Grants the new staff:reset_password permission to the bootstrap Owner
-- role. Existing roles are unaffected — the dynamic role system is
-- working as intended if an admin has to explicitly grant this to any
-- other role, but Owner itself must come with it out of the box so
-- password resets don't start out unusable for everyone right after
-- this feature deploys (same reasoning as the original Owner bootstrap
-- in 20261018201622_add_roles_and_permissions).
INSERT INTO "role_permission" ("id", "roleId", "resource", "action")
VALUES ('rp_owner_staff_reset_password', 'role_owner_bootstrap', 'staff', 'reset_password')
ON CONFLICT ("id") DO NOTHING;
