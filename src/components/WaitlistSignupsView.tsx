"use client";

import { useState, useTransition } from "react";
import { archiveContactSubmission, emailWaitlistToManager } from "@/app/admin/(protected)/actions";

type Signup = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  unitType: string | null;
  createdAt: Date;
  archivedAt: Date | null;
};

type Group = {
  slug: string;
  name: string;
  contactEmail: string | null;
  signups: Signup[];
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function WaitlistSignupsView({
  groups,
  canArchive,
  canEmail,
}: {
  groups: Group[];
  canArchive: boolean;
  canEmail: boolean;
}) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-24 text-center">
        <h1 className="text-xl font-medium">No waitlist signups yet</h1>
        <p className="text-sm text-text-secondary">
          Signups from a property&apos;s waitlist form will show up here, grouped by
          property.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-1 px-4 pt-8 md:px-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Admin</span>
        <h1 className="text-[26px] font-bold">Waitlist signups</h1>
        <p className="text-sm text-text-secondary">
          Grouped by property. Export a CSV or email the active list straight to that
          property&apos;s manager.
        </p>
      </section>

      <section className="flex flex-col gap-6 px-4 pb-12 pt-5 md:px-16">
        {groups.map((group) => (
          <PropertyGroup key={group.slug} group={group} canArchive={canArchive} canEmail={canEmail} />
        ))}
      </section>
    </>
  );
}

function PropertyGroup({
  group,
  canArchive,
  canEmail,
}: {
  group: Group;
  canArchive: boolean;
  canEmail: boolean;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  const active = group.signups.filter((s) => !s.archivedAt);
  const archived = group.signups.filter((s) => s.archivedAt);
  const rows = showArchived ? archived : active;

  function handleEmail() {
    setNote(null);
    startTransition(async () => {
      try {
        const result = await emailWaitlistToManager(group.slug);
        setNote(`Emailed ${result.count} signup${result.count === 1 ? "" : "s"} to ${result.to}.`);
      } catch (err) {
        setNote(err instanceof Error ? err.message : "Couldn't send that email.");
      }
    });
  }

  function handleArchiveToggle(id: string, archiving: boolean) {
    setNote(null);
    startTransition(async () => {
      await archiveContactSubmission(id, archiving);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-medium">{group.name}</h2>
          <span className="text-xs text-text-secondary">
            {active.length} active · {archived.length} archived
            {!group.contactEmail && " · no contact email set"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/admin/waitlist/export?property=${group.slug}`}
            className={
              "rounded border border-input-border px-3.5 py-2 text-xs font-medium text-primary-dark " +
              (active.length === 0 ? "pointer-events-none opacity-50" : "")
            }
            aria-disabled={active.length === 0}
          >
            Export CSV
          </a>
          {canEmail && (
            <button
              type="button"
              onClick={handleEmail}
              disabled={pending || active.length === 0 || !group.contactEmail}
              className="rounded bg-primary px-3.5 py-2 text-xs font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-50"
            >
              Email property manager
            </button>
          )}
        </div>
      </div>

      {note && <p className="text-xs text-text-secondary">{note}</p>}

      <div className="flex items-center gap-1 self-start rounded-full border border-input-border p-1">
        <button
          type="button"
          aria-pressed={!showArchived}
          onClick={() => setShowArchived(false)}
          className={
            "rounded-full px-3 py-1 text-[12px] font-medium " +
            (!showArchived ? "bg-primary text-white" : "text-[#424242]")
          }
        >
          Active ({active.length})
        </button>
        <button
          type="button"
          aria-pressed={showArchived}
          onClick={() => setShowArchived(true)}
          className={
            "rounded-full px-3 py-1 text-[12px] font-medium " +
            (showArchived ? "bg-primary text-white" : "text-[#424242]")
          }
        >
          Archived ({archived.length})
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary">No {showArchived ? "archived" : "active"} signups.</p>
      ) : (
        <div className="overflow-hidden rounded border border-border">
          {rows.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm first:border-t-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-text-secondary">
                  {s.unitType ?? "Unit type not specified"} · Signed up {dateFormatter.format(s.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <a href={`mailto:${s.email}`} className="text-primary">
                  {s.email}
                </a>
                {s.phone && (
                  <a href={`tel:${s.phone}`} className="text-primary">
                    {s.phone}
                  </a>
                )}
                {canArchive && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleArchiveToggle(s.id, !showArchived)}
                    className="rounded border border-input-border px-2.5 py-1 text-[11px] font-medium text-[#424242] disabled:opacity-50"
                  >
                    {showArchived ? "Unarchive" : "Archive"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
