import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Action, Resource } from "@/lib/permissionTypes";

export { RESOURCES, ACTIONS, RESOURCE_ACTIONS, RESOURCE_LABEL, ACTION_LABEL } from "@/lib/permissionTypes";
export type { Resource, Action } from "@/lib/permissionTypes";

function key(resource: Resource, action: Action) {
  return `${resource}:${action}`;
}

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { permissions: { select: { resource: true, action: true } } } } },
  });
  const perms = user?.role?.permissions ?? [];
  return new Set(perms.map((p) => `${p.resource}:${p.action}`));
}

export function hasPermission(
  permissions: Set<string>,
  resource: Resource,
  action: Action,
): boolean {
  return permissions.has(key(resource, action));
}

/** For Server Components/pages: redirects to login if signed out, loads the permission set. */
export async function requireSessionForPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/login");
  const permissions = await getUserPermissions(session.user.id);
  return { session, permissions };
}

/** For Server Components/pages: like requireSessionForPage, but also requires a specific permission, redirecting to /admin if missing. */
export async function requirePagePermission(resource: Resource, action: Action) {
  const { session, permissions } = await requireSessionForPage();
  if (!hasPermission(permissions, resource, action)) redirect("/admin");
  return { session, permissions };
}

/** For Server Actions: throws if signed out or missing the permission. */
export async function requirePermission(resource: Resource, action: Action) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not signed in");
  }
  const permissions = await getUserPermissions(session.user.id);
  if (!hasPermission(permissions, resource, action)) {
    throw new Error("You don't have permission to do that.");
  }
  return session;
}
