"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Wordmark } from "@/components/Logo";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setSubmitting(false);
    setSent(true);
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-primary-bg to-background">
      <section className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-[420px] flex-col gap-6 rounded bg-surface p-10 shadow-card">
          <div className="flex flex-col items-center gap-3 text-center">
            <Wordmark height={56} />
            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl font-bold">Reset your password</h1>
              <span className="text-[13px] text-text-secondary">
                Enter your staff portal email and we&apos;ll send you a reset link.
              </span>
            </div>
          </div>

          {sent ? (
            <div
              role="status"
              className="rounded border border-[#c8e6c9] bg-[#f1f8f2] p-3 text-sm text-[#2e7d32]"
            >
              If that email has a staff account, a reset link is on its way — check your
              inbox.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wide text-text-secondary"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@1stcityllc.example"
                  className="w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-primary py-3 text-center text-sm font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <div className="h-px bg-border" />
          <Link href="/admin/login" className="text-center text-xs text-primary hover:text-primary-dark">
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
