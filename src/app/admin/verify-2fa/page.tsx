"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Wordmark } from "@/components/Logo";

export default function AdminVerifyTwoFactorPage() {
  const router = useRouter();
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: verifyError } = useBackupCode
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code, trustDevice });
    setSubmitting(false);
    if (verifyError) {
      setError(verifyError.message ?? "Invalid code. Please try again.");
      return;
    }
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
              <h1 className="text-xl font-bold">Two-factor verification</h1>
              <span className="text-[13px] text-text-secondary">
                {useBackupCode
                  ? "Enter one of your backup codes."
                  : "Enter the 6-digit code from your authenticator app."}
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
              <label htmlFor="code" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {useBackupCode ? "Backup code" : "Verification code"}
              </label>
              <input
                id="code"
                type="text"
                inputMode={useBackupCode ? "text" : "numeric"}
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={useBackupCode ? "xxxxx-xxxxx" : "123456"}
                className="w-full rounded border border-input-border bg-surface px-3.5 py-3 text-center text-lg tracking-widest outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]"
              />
            </div>

            {!useBackupCode && (
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                />
                Trust this device for 30 days
              </label>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-primary py-3 text-center text-sm font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
            >
              {submitting ? "Verifying…" : "Verify"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setUseBackupCode((prev) => !prev);
              setCode("");
              setError(null);
            }}
            className="text-center text-xs text-primary hover:text-primary-dark"
          >
            {useBackupCode ? "Use your authenticator app instead" : "Use a backup code instead"}
          </button>

          <div className="h-px bg-border" />
          <Link href="/admin/login" className="text-center text-xs text-text-secondary hover:text-text">
            Back to sign in
          </Link>
        </div>
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
