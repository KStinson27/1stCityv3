"use client";

import { useState, useTransition } from "react";
import {
  createStaffAccount,
  resetStaffTwoFactor,
  sendStaffPasswordReset,
  updateStaffName,
  updateStaffRole,
} from "@/app/admin/(protected)/actions";

type StaffUser = {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  twoFactorEnabled: boolean;
};
type RoleOption = { id: string; name: string };

function RoleSelect({
  value,
  roleOptions,
  onChange,
  disabled,
}: {
  value: string | null;
  roleOptions: RoleOption[];
  onChange: (roleId: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full max-w-[220px] rounded border border-input-border px-3 py-2 text-sm disabled:opacity-60"
    >
      <option value="">No role (no access)</option>
      {roleOptions.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}

function NameField({ user }: { user: StaffUser }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) {
      setName(user.name);
      setEditing(false);
      setError(null);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateStaffName(user.id, trimmed);
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
        setName(user.name);
      }
    });
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={name}
          autoFocus
          disabled={pending}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setName(user.name);
              setEditing(false);
              setError(null);
            }
          }}
          className="w-full max-w-[200px] rounded border border-input-border px-2 py-1 text-sm font-medium disabled:opacity-60"
        />
        {error && <span className="text-xs text-[#c62828]">{error}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-fit text-left text-sm font-medium hover:underline"
      title="Click to edit name"
    >
      {name}
    </button>
  );
}

function ResetPasswordButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setNote(null);
    setError(null);
    startTransition(async () => {
      try {
        await sendStaffPasswordReset(userId);
        setNote("Reset email sent.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send reset email");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded border border-input-border px-3 py-1.5 text-xs font-medium text-primary-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset email"}
      </button>
      {error ? (
        <span className="text-xs text-[#c62828]">{error}</span>
      ) : (
        <span role="status" className="text-xs text-text-secondary">
          {note}
        </span>
      )}
    </div>
  );
}

function ResetTwoFactorButton({ userId, userName }: { userId: string; userName: string }) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(`Turn off two-factor authentication for ${userName}? Only do this if they've lost access to their authenticator app and backup codes.`)) {
      return;
    }
    setNote(null);
    setError(null);
    startTransition(async () => {
      try {
        await resetStaffTwoFactor(userId);
        setNote("Two-factor reset.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reset two-factor");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded border border-input-border px-3 py-1.5 text-xs font-medium text-primary-dark disabled:opacity-60"
      >
        {pending ? "Resetting…" : "Reset 2FA"}
      </button>
      {error ? (
        <span className="text-xs text-[#c62828]">{error}</span>
      ) : (
        <span role="status" className="text-xs text-text-secondary">
          {note}
        </span>
      )}
    </div>
  );
}

function StaffRow({
  user,
  roleOptions,
  canResetPassword,
}: {
  user: StaffUser;
  roleOptions: RoleOption[];
  canResetPassword: boolean;
}) {
  const [roleId, setRoleId] = useState(user.roleId);
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: string | null) {
    setRoleId(next);
    setNote(null);
    setError(null);
    startTransition(async () => {
      try {
        await updateStaffRole(user.id, next);
        setNote("Saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
        setRoleId(user.roleId);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3.5 first:border-t-0">
      <div className="flex flex-col gap-0.5">
        <NameField user={user} />
        <span className="text-xs text-text-secondary">{user.email}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <RoleSelect value={roleId} roleOptions={roleOptions} onChange={handleChange} disabled={pending} />
        {error ? (
          <span className="text-xs text-[#c62828]">{error}</span>
        ) : (
          <span role="status" className="text-xs text-text-secondary">
            {note}
          </span>
        )}
        {canResetPassword && <ResetPasswordButton userId={user.id} />}
        {user.twoFactorEnabled && <ResetTwoFactorButton userId={user.id} userName={user.name} />}
      </div>
    </div>
  );
}

function NewStaffForm({ roleOptions }: { roleOptions: RoleOption[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        await createStaffAccount({ name, email, password, roleId });
        setName("");
        setEmail("");
        setPassword("");
        setRoleId(null);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create account");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded border border-input-border px-4 py-2 text-sm font-medium text-primary-dark"
      >
        + New staff account
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded bg-surface p-6 shadow-card">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-staff-name" className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Name
          </label>
          <input
            id="new-staff-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-staff-email" className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Email
          </label>
          <input
            id="new-staff-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-staff-password" className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Temporary password
          </label>
          <input
            id="new-staff-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-staff-role" className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Role
          </label>
          <select
            id="new-staff-role"
            value={roleId ?? ""}
            onChange={(e) => setRoleId(e.target.value || null)}
            className="w-full rounded border border-input-border px-3 py-2.5 text-sm"
          >
            <option value="">No role (no access)</option>
            {roleOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <span className="text-xs text-[#c62828]">{error}</span>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCreate}
          disabled={pending}
          className="rounded bg-primary px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account"}
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

export function StaffManager({
  users,
  roleOptions,
  canResetPassword,
}: {
  users: StaffUser[];
  roleOptions: RoleOption[];
  canResetPassword: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded bg-surface shadow-card">
        {users.map((user) => (
          <StaffRow
            key={user.id}
            user={user}
            roleOptions={roleOptions}
            canResetPassword={canResetPassword}
          />
        ))}
      </div>
      <NewStaffForm roleOptions={roleOptions} />
    </div>
  );
}
