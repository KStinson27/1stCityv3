"use client";

import { useState, useTransition } from "react";
import QRCode from "qrcode";
import { authClient } from "@/lib/auth-client";

type EnrollData = { totpURI: string; backupCodes: string[] };

function extractSecret(totpURI: string): string | null {
  try {
    return new URL(totpURI).searchParams.get("secret");
  } catch {
    return null;
  }
}

function BackupCodesList({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the
      // codes are still visible on screen to copy by hand.
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-[#ffe0b2] bg-[#fff8e1] p-4">
      <p className="text-sm font-medium text-[#8d6200]">
        Save these backup codes now — each works once, and you won&apos;t see them again.
      </p>
      <div className="grid grid-cols-2 gap-1.5 font-mono text-sm">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <button
        type="button"
        onClick={copyAll}
        className="w-fit rounded border border-input-border px-3 py-1.5 text-xs font-medium text-primary-dark"
      >
        {copied ? "Copied" : "Copy all"}
      </button>
    </div>
  );
}

function EnrollFlow({ onEnabled }: { onEnabled: () => void }) {
  const [stage, setStage] = useState<"password" | "confirm">("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [enrollData, setEnrollData] = useState<EnrollData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleEnable() {
    setError(null);
    startTransition(async () => {
      const { data, error: enableError } = await authClient.twoFactor.enable({
        password,
        method: "totp",
      });
      if (enableError || !data || data.method !== "totp") {
        setError(enableError?.message ?? "Failed to start enrollment");
        return;
      }
      setEnrollData({ totpURI: data.totpURI, backupCodes: data.backupCodes });
      setQrDataUrl(await QRCode.toDataURL(data.totpURI));
      setStage("confirm");
    });
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({ code });
      if (verifyError) {
        setError(verifyError.message ?? "Invalid code");
        return;
      }
      onEnabled();
    });
  }

  if (stage === "password") {
    return (
      <div className="flex flex-col gap-3 rounded bg-surface p-6 shadow-card">
        <p className="text-sm text-text-secondary">
          Confirm your password to start setting up an authenticator app.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="w-full max-w-sm rounded border border-input-border px-3.5 py-2.5 text-sm"
        />
        {error && <span className="text-xs text-[#c62828]">{error}</span>}
        <button
          type="button"
          onClick={handleEnable}
          disabled={pending || !password}
          className="w-fit rounded bg-primary px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
        >
          {pending ? "Starting…" : "Continue"}
        </button>
      </div>
    );
  }

  const secret = enrollData ? extractSecret(enrollData.totpURI) : null;

  return (
    <div className="flex flex-col gap-4 rounded bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">1. Scan this with your authenticator app</p>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- a locally-generated data: URL, not a remote image next/image would optimize
          <img src={qrDataUrl} alt="QR code for authenticator app enrollment" width={200} height={200} />
        )}
        {secret && (
          <p className="text-xs text-text-secondary">
            Can&apos;t scan? Enter this code manually:{" "}
            <span className="font-mono">{secret}</span>
          </p>
        )}
      </div>

      {enrollData && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">2. Save your backup codes</p>
          <BackupCodesList codes={enrollData.backupCodes} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">3. Enter the 6-digit code from the app</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-32 rounded border border-input-border px-3.5 py-2.5 text-center text-lg tracking-widest"
          />
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending || !code}
            className="rounded bg-primary px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
          >
            {pending ? "Verifying…" : "Verify & enable"}
          </button>
        </div>
        {error && <span className="text-xs text-[#c62828]">{error}</span>}
      </div>
    </div>
  );
}

function RegenerateBackupCodes() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRegenerate() {
    setError(null);
    startTransition(async () => {
      const { data, error: regenError } = await authClient.twoFactor.generateBackupCodes({
        password,
      });
      if (regenError || !data?.backupCodes) {
        setError(regenError?.message ?? "Failed to regenerate backup codes");
        return;
      }
      setCodes(data.backupCodes);
      setPassword("");
    });
  }

  if (codes) {
    return (
      <div className="flex flex-col gap-3">
        <BackupCodesList codes={codes} />
        <button
          type="button"
          onClick={() => {
            setCodes(null);
            setOpen(false);
          }}
          className="w-fit rounded border border-input-border px-4 py-2 text-sm font-medium text-[#424242]"
        >
          Done
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded border border-input-border px-4 py-2 text-sm font-medium text-primary-dark"
      >
        Regenerate backup codes
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Your password"
        className="w-full max-w-sm rounded border border-input-border px-3.5 py-2.5 text-sm"
      />
      {error && <span className="text-xs text-[#c62828]">{error}</span>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={pending || !password}
          className="rounded bg-primary px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
        >
          {pending ? "Generating…" : "Regenerate"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-input-border px-5 py-2 text-[13px] font-medium text-[#424242]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DisableTwoFactor({ onDisabled }: { onDisabled: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDisable() {
    setError(null);
    startTransition(async () => {
      const { error: disableError } = await authClient.twoFactor.disable({ password });
      if (disableError) {
        setError(disableError.message ?? "Failed to disable two-factor authentication");
        return;
      }
      onDisabled();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded border border-[#ffcdd2] px-4 py-2 text-sm font-medium text-[#c62828]"
      >
        Disable two-factor authentication
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Your password"
        className="w-full max-w-sm rounded border border-input-border px-3.5 py-2.5 text-sm"
      />
      {error && <span className="text-xs text-[#c62828]">{error}</span>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDisable}
          disabled={pending || !password}
          className="rounded bg-[#c62828] px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white disabled:opacity-60"
        >
          {pending ? "Disabling…" : "Confirm disable"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-input-border px-5 py-2 text-[13px] font-medium text-[#424242]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function SecurityManager({ twoFactorEnabled }: { twoFactorEnabled: boolean }) {
  const [enabled, setEnabled] = useState(twoFactorEnabled);
  const [enrolling, setEnrolling] = useState(false);

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1 rounded bg-surface p-6 shadow-card">
        <h2 className="text-base font-medium">Two-factor authentication</h2>
        <p className="text-sm text-text-secondary">
          {enabled
            ? "Enabled — your account requires a code from your authenticator app to sign in."
            : "Add an authenticator-app code as a second step when signing in. Optional — nobody is required to enable this."}
        </p>
      </div>

      {enabled ? (
        <div className="flex flex-col gap-3">
          <RegenerateBackupCodes />
          <DisableTwoFactor onDisabled={() => setEnabled(false)} />
        </div>
      ) : enrolling ? (
        <EnrollFlow
          onEnabled={() => {
            setEnabled(true);
            setEnrolling(false);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEnrolling(true)}
          className="w-fit rounded bg-primary px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white shadow-button"
        >
          Enable two-factor authentication
        </button>
      )}
    </div>
  );
}
