import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/Logo";
import { AdminSignOutButton } from "@/components/AdminSignOutButton";
import { AdminNav } from "@/components/AdminNav";
import { requireSessionForPage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, permissions } = await requireSessionForPage();

  // An admin-set temporary password (see createStaffAccount) must be
  // replaced before this account can do anything else — checked fresh
  // against the DB rather than trusted from the session.
  const { mustChangePassword } = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { mustChangePassword: true },
  });
  if (mustChangePassword) redirect("/admin/change-password");

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-dark focus:shadow-card"
      >
        Skip to main content
      </a>
      <header className="flex h-[72px] items-center justify-between border-b border-border bg-surface px-4 shadow-appbar md:px-16">
        <div className="flex items-center gap-3.5">
          <Link href="/admin" className="flex items-center">
            <Wordmark />
          </Link>
          <span className="rounded bg-primary-bg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-dark">
            Staff Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[13px] text-text-secondary sm:inline">
            Signed in as {session.user.name}
          </span>
          <AdminSignOutButton />
        </div>
      </header>
      <AdminNav permissions={[...permissions]} />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
