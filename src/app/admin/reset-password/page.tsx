"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Wordmark } from "@/components/Logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalidLink = searchParams.get("error") === "INVALID_TOKEN" || !token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token: token!,
    });
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message ?? "Failed to reset password. The link may have expired.");
      return;
    }
    router.push("/admin/login?reset=success");
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-6 rounded bg-surface p-10 shadow-card">
      <div className="flex flex-col items-center gap-3 text-center">
        <Wordmark height={56} />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold">
            {invalidLink ? "Link expired" : "Set a new password"}
          </h1>
        </div>
      </div>

      {invalidLink ? (
        <>
          <div role="alert" className="rounded border border-[#ffcdd2] bg-[#ffebee] p-3 text-sm text-[#b71c1c]">
            This reset link is invalid or has expired.
          </div>
          <Link
            href="/admin/forgot-password"
            className="rounded bg-primary py-3 text-center text-sm font-medium uppercase tracking-wide text-white shadow-button"
          >
            Request a new link
          </Link>
        </>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          {error && (
            <div role="alert" className="rounded border border-[#ffcdd2] bg-[#ffebee] p-3 text-sm text-[#b71c1c]">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Confirm password
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
            {submitting ? "Saving…" : "Set new password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-primary-bg to-background">
      <section className="flex flex-1 items-center justify-center px-4 py-16">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </section>

      <footer className="flex items-center justify-between border-t border-border px-4 py-6 text-[13px] text-text-secondary md:px-16">
        <span>© {new Date().getFullYear()} 1st City LLC. All rights reserved.</span>
        <Link href="/" className="text-primary hover:text-primary-dark">
          Back to public site
        </Link>
      </footer>
    </div>
  );
}
