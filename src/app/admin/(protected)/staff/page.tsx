import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { hasPermission, requirePagePermission } from "@/lib/permissions";
import { RoleManager } from "@/components/RoleManager";
import { StaffManager } from "@/components/StaffManager";
import type { Action, Resource } from "@/lib/permissionTypes";

export const metadata: Metadata = { title: "Staff & Roles" };
export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const { permissions } = await requirePagePermission("staff", "view");
  const canResetPassword = hasPermission(permissions, "staff", "reset_password");

  const [roles, users] = await Promise.all([
    prisma.role.findMany({
      orderBy: { name: "asc" },
      include: { permissions: true, users: { select: { id: true } } },
    }),
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, roleId: true, twoFactorEnabled: true },
    }),
  ]);

  const roleOptions = roles.map((r) => ({ id: r.id, name: r.name }));

  return (
    <>
      <section className="flex flex-col gap-1 px-4 pt-8 md:px-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Admin</span>
        <h1 className="text-[26px] font-bold">Staff &amp; Roles</h1>
      </section>

      <section className="flex flex-col gap-10 px-4 pb-12 pt-5 md:px-16">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#9e9e9e]">
            Staff accounts
          </h2>
          <StaffManager
            users={users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              roleId: u.roleId,
              twoFactorEnabled: u.twoFactorEnabled,
            }))}
            roleOptions={roleOptions}
            canResetPassword={canResetPassword}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#9e9e9e]">Roles</h2>
          <RoleManager
            roles={roles.map((r) => ({
              id: r.id,
              name: r.name,
              userCount: r.users.length,
              permissions: r.permissions.map((p) => ({
                resource: p.resource as Resource,
                action: p.action as Action,
              })),
            }))}
          />
        </div>
      </section>
    </>
  );
}
