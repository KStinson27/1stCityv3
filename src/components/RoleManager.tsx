"use client";

import { useState, useTransition } from "react";
import { createRole, deleteRole, updateRole } from "@/app/admin/(protected)/actions";
import {
  ACTIONS,
  RESOURCES,
  RESOURCE_ACTIONS,
  RESOURCE_LABEL,
  ACTION_LABEL,
  type Action,
  type Resource,
} from "@/lib/permissionTypes";

type Grant = { resource: Resource; action: Action };
type Role = { id: string; name: string; userCount: number; permissions: Grant[] };

function grantKey(resource: Resource, action: Action) {
  return `${resource}:${action}`;
}

function PermissionGrid({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (resource: Resource, action: Action) => void;
}) {
  return (
    <div className="overflow-hidden rounded border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-background">
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-text-secondary">
              Resource
            </th>
            {ACTIONS.map((action) => (
              <th
                key={action}
                className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-text-secondary"
              >
                {ACTION_LABEL[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map((resource) => (
            <tr key={resource} className="border-t border-border">
              <td className="px-3 py-2 text-[13px]">{RESOURCE_LABEL[resource]}</td>
              {ACTIONS.map((action) => {
                const applies = RESOURCE_ACTIONS[resource].includes(action);
                return (
                  <td key={action} className="px-3 py-2 text-center">
                    {applies ? (
                      <input
                        type="checkbox"
                        checked={selected.has(grantKey(resource, action))}
                        onChange={() => onToggle(resource, action)}
                        aria-label={`${RESOURCE_LABEL[resource]} — ${ACTION_LABEL[action]}`}
                      />
                    ) : (
                      <span className="text-[#e0e0e0]">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"transition-transform " + (collapsed ? "-rotate-90" : "")}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function RoleCard({ role }: { role: Role }) {
  const [collapsed, setCollapsed] = useState(true);
  const [name, setName] = useState(role.name);
  const [selected, setSelected] = useState(
    () => new Set(role.permissions.map((p) => grantKey(p.resource, p.action))),
  );
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(resource: Resource, action: Action) {
    setNote(null);
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      const k = grantKey(resource, action);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const permissions = [...selected].map((k) => {
          const [resource, action] = k.split(":") as [Resource, Action];
          return { resource, action };
        });
        await updateRole(role.id, name, permissions);
        setNote("Saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete the role "${role.name}"? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteRole(role.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded bg-surface p-6 shadow-card">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        className="flex items-center justify-between gap-3 text-left"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-medium">{name}</span>
          <span className="text-xs text-text-secondary">
            {role.userCount} staff account{role.userCount === 1 ? "" : "s"}
          </span>
        </div>
        <span className="text-text-secondary">
          <ChevronIcon collapsed={collapsed} />
        </span>
      </button>

      {!collapsed && (
        <>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`role-name-${role.id}`}
              className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]"
            >
              Role name
            </label>
            <input
              id={`role-name-${role.id}`}
              type="text"
              value={name}
              onChange={(e) => {
                setNote(null);
                setError(null);
                setName(e.target.value);
              }}
              className="w-full max-w-sm rounded border border-input-border px-3.5 py-2.5 text-sm"
            />
          </div>

          <PermissionGrid selected={selected} onToggle={toggle} />

          {error && <span className="text-xs text-[#c62828]">{error}</span>}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="rounded bg-primary px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending || role.userCount > 0}
              title={role.userCount > 0 ? "Reassign staff off this role before deleting it" : undefined}
              className="rounded border border-[#ffcdd2] px-5 py-2 text-[13px] font-medium text-[#c62828] disabled:opacity-40"
            >
              Delete
            </button>
            <span role="status" className="text-xs text-text-secondary">
              {note}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function NewRoleForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(resource: Resource, action: Action) {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = grantKey(resource, action);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const permissions = [...selected].map((k) => {
          const [resource, action] = k.split(":") as [Resource, Action];
          return { resource, action };
        });
        await createRole(name, permissions);
        setName("");
        setSelected(new Set());
        setOpen(false);
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create role");
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
        + New role
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded bg-surface p-6 shadow-card">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-role-name" className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
          Role name
        </label>
        <input
          id="new-role-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Compliance Manager"
          className="w-full max-w-sm rounded border border-input-border px-3.5 py-2.5 text-sm"
        />
      </div>

      <PermissionGrid selected={selected} onToggle={toggle} />

      {error && <span className="text-xs text-[#c62828]">{error}</span>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCreate}
          disabled={pending}
          className="rounded bg-primary px-5 py-2 text-[13px] font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create role"}
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

export function RoleManager({ roles }: { roles: Role[] }) {
  // Server Actions revalidate the page's data automatically on completion
  // (same pattern as every other admin queue in this app); nothing extra
  // to do here on create besides closing the form, which createRole's
  // caller already handles.
  return (
    <div className="flex flex-col gap-4">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} />
      ))}
      <NewRoleForm onCreated={() => {}} />
    </div>
  );
}
