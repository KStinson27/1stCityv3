"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { clearMustChangePassword } from "@/app/admin/(protected)/actions";
import { Wordmark } from "@/components/Logo";

export default function AdminChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSubmitting(true);
    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });
    if (changeError) {
      setSubmitting(false);
      setError(changeError.message ?? "Couldn't change your password. Check your current password.");
      return;
    }

    await clearMustChangePassword();
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-primary-bg to-background">
      <section className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-[420px] flex-col gap-6 rounded bg-surface p-10 shadow-card">
          <div className="flex flex-col items-center gap-3 text-center">
            <Wordmark height={56} />
            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl font-bold">Set a new password</h1>
              <span className="text-[13px] text-text-secondary">
                Your account was created with a temporary password. Set your own before
                continuing.
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            {error && (
              <div role="alert" className="rounded border border-[#ffcdd2] bg-[#ffebee] p-3 text-sm text-[#b71c1c]">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="currentPassword" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Temporary password
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-primary py-3 text-center text-sm font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Set password"}
            </button>
          </form>

          <div className="h-px bg-border" />
          <p className="text-center text-xs text-text-secondary">
            Once you&apos;re in, you can also turn on two-factor authentication for
            extra security under Admin → Security.
          </p>
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-border px-4 py-6 text-[13px] text-text-secondary md:px-16">
        <span>© {new Date().getFullYear()} 1st City LLC. All rights reserved.</span>
      </footer>
    </div>
  );
}
