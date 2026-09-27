"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AdminSignOutButton() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded border border-input-border px-4 py-2 text-[13px] font-medium text-text hover:bg-background"
    >
      Sign out
    </button>
  );
}
