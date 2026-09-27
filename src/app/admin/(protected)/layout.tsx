import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import { AdminSignOutButton } from "@/components/AdminSignOutButton";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/login");

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-dark focus:shadow-card"
      >
        Skip to main content
      </a>
      <header className="flex h-[72px] items-center justify-between bg-primary px-4 shadow-appbar md:px-16">
        <div className="flex items-center gap-3.5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-xl font-medium text-white">1st City LLC</span>
          </Link>
          <span className="rounded bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Staff Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[13px] text-primary-bg sm:inline">
            Signed in as {session.user.name}
          </span>
          <AdminSignOutButton />
        </div>
      </header>
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
