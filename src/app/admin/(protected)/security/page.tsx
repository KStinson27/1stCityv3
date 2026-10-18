import type { Metadata } from "next";
import { requireSessionForPage } from "@/lib/permissions";
import { SecurityManager } from "@/components/SecurityManager";

export const metadata: Metadata = { title: "Security" };
export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const { session } = await requireSessionForPage();

  return (
    <>
      <section className="flex flex-col gap-1 px-4 pt-8 md:px-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Admin</span>
        <h1 className="text-[26px] font-bold">Security</h1>
      </section>

      <section className="flex flex-col gap-3 px-4 pb-12 pt-5 md:px-16">
        <SecurityManager twoFactorEnabled={session.user.twoFactorEnabled ?? false} />
      </section>
    </>
  );
}
