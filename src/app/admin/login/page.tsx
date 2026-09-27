"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await authClient.signIn.email({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message ?? "Invalid email or password.");
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
            <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-primary">
              <span className="text-lg font-bold text-white">1C</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl font-bold">Staff Portal</h1>
              <span className="text-[13px] text-text-secondary">
                Sign in to manage vendor submissions
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            {error && (
              <div className="rounded border border-[#ffcdd2] bg-[#ffebee] p-3 text-sm text-[#b71c1c]">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
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
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-primary py-3 text-center text-sm font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="h-px bg-border" />
          <span className="text-center text-xs text-text-secondary">
            This portal is for 1st City LLC staff only. Contact your administrator if you
            need access.
          </span>
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
