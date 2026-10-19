-- Renames the bootstrap "Owner" role to "Website Owner" for clarity —
-- "Owner" read as ambiguous (owner of what?) once there were multiple
-- roles in play. Matches the fixed id from the bootstrap migration
-- (20261018201622_add_roles_and_permissions), not a cuid, so this is
-- safe to target directly rather than by name (which seed.ts also
-- updates to match, in case this runs against a fresh database where
-- the role doesn't exist yet under either name).
UPDATE "role" SET "name" = 'Website Owner' WHERE "id" = 'role_owner_bootstrap';
