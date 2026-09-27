"use client";

import { useMemo, useState, useTransition } from "react";
import { updateVendorSubmission } from "@/app/admin/(protected)/actions";
import type { SubmissionStatus } from "@/generated/prisma/enums";

type Submission = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  serviceType: string;
  message: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  status: SubmissionStatus;
  internalNote: string | null;
  createdAt: Date;
};

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  NEW: "New",
  REVIEWED: "Reviewed",
  CONTACTED: "Contacted",
  DECLINED: "Declined",
};

const STATUS_CHIP: Record<SubmissionStatus, string> = {
  NEW: "bg-[#e3f2fd] text-[#1565c0]",
  REVIEWED: "bg-[#fff3e0] text-[#e65100]",
  CONTACTED: "bg-primary-bg text-primary-dark",
  DECLINED: "bg-background text-[#757575]",
};

const TABS: Array<{ id: "ALL" | SubmissionStatus; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "NEW", label: "New" },
  { id: "REVIEWED", label: "Reviewed" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "DECLINED", label: "Declined" },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function AdminQueue({ submissions }: { submissions: Submission[] }) {
  const [tab, setTab] = useState<"ALL" | SubmissionStatus>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(submissions[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: submissions.length };
    for (const s of submissions) c[s.status] = (c[s.status] ?? 0) + 1;
    return c;
  }, [submissions]);

  const filtered = useMemo(
    () => (tab === "ALL" ? submissions : submissions.filter((s) => s.status === tab)),
    [submissions, tab]
  );

  const selected = submissions.find((s) => s.id === selectedId) ?? filtered[0] ?? null;

  const [draftStatus, setDraftStatus] = useState<SubmissionStatus | null>(null);
  const [draftNote, setDraftNote] = useState<string | null>(null);

  const currentStatus = draftStatus ?? selected?.status ?? "NEW";
  const currentNote = draftNote ?? selected?.internalNote ?? "";

  function selectSubmission(id: string) {
    setSelectedId(id);
    setDraftStatus(null);
    setDraftNote(null);
    setSavedNote(null);
  }

  function handleSave() {
    if (!selected) return;
    startTransition(async () => {
      await updateVendorSubmission({
        id: selected.id,
        status: currentStatus,
        internalNote: currentNote,
      });
      setSavedNote("Saved.");
    });
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-24 text-center">
        <h1 className="text-xl font-medium">No vendor submissions yet</h1>
        <p className="text-sm text-text-secondary">
          Proposals submitted through the public Vendors page will show up here.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="flex items-center justify-between px-4 pt-8 md:px-16">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Admin
          </span>
          <h1 className="text-[26px] font-bold">Vendor submissions</h1>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2 px-4 pt-5 md:px-16" role="group" aria-label="Filter by status">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(t.id)}
              className={
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium " +
                (active
                  ? "bg-primary text-white"
                  : "border border-input-border bg-surface text-[#424242]")
              }
            >
              {t.label}
              <span
                className={
                  "rounded-full px-1.5 py-0.5 text-[11px] " +
                  (active ? "bg-white/25" : "bg-background")
                }
              >
                {counts[t.id] ?? 0}
              </span>
            </button>
          );
        })}
      </section>

      <section className="flex min-h-0 flex-1 flex-col gap-6 px-4 pb-12 pt-5 md:flex-row md:px-16">
        <div className="w-full shrink-0 overflow-hidden rounded bg-surface shadow-card md:w-[420px]">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={selected?.id === s.id}
              onClick={() => selectSubmission(s.id)}
              className={
                "flex w-full flex-col gap-1 border-t border-border px-4 py-3.5 text-left first:border-t-0 " +
                (selected?.id === s.id
                  ? "border-l-4 border-l-primary bg-primary-bg"
                  : "border-l-4 border-l-transparent")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{s.companyName}</span>
                <span
                  className={
                    "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase " +
                    STATUS_CHIP[s.status]
                  }
                >
                  {STATUS_LABEL[s.status]}
                </span>
              </div>
              <span className="text-xs text-text-secondary">
                {s.serviceType} · {dateFormatter.format(s.createdAt)}
              </span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="flex flex-1 flex-col gap-5 rounded bg-surface p-7 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-medium">{selected.companyName}</h2>
                <span className="text-[13px] text-text-secondary">
                  Submitted {dateFormatter.format(selected.createdAt)}
                </span>
              </div>
              <span
                className={
                  "rounded-full px-3 py-1 text-xs font-bold uppercase " +
                  STATUS_CHIP[selected.status]
                }
              >
                {STATUS_LABEL[selected.status]}
              </span>
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Contact">{selected.contactName}</Field>
              <Field label="Service type">{selected.serviceType}</Field>
              <Field label="Email">
                <a href={`mailto:${selected.email}`} className="text-primary">
                  {selected.email}
                </a>
              </Field>
              <Field label="Phone">
                {selected.phone ? (
                  <a href={`tel:${selected.phone}`} className="text-primary">
                    {selected.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Field>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
                Message
              </span>
              <p className="whitespace-pre-wrap rounded bg-background p-3.5 text-sm leading-relaxed text-[#424242]">
                {selected.message}
              </p>
            </div>

            {selected.attachmentUrl && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
                  Attachment
                </span>
                <a
                  href={selected.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-fit items-center gap-2 rounded border border-border bg-background px-3.5 py-2.5 text-[13px] text-text"
                >
                  {selected.attachmentName ?? "Download attachment"}
                </a>
              </div>
            )}

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="submission-status"
                className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]"
              >
                Status
              </label>
              <select
                id="submission-status"
                value={currentStatus}
                onChange={(e) => setDraftStatus(e.target.value as SubmissionStatus)}
                className="w-full max-w-[260px] rounded border border-input-border px-3 py-2.5 text-sm"
              >
                {(Object.keys(STATUS_LABEL) as SubmissionStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="submission-note"
                className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]"
              >
                Internal note
              </label>
              <textarea
                id="submission-note"
                value={currentNote}
                onChange={(e) => setDraftNote(e.target.value)}
                rows={3}
                placeholder="Add a note for your team — not visible to the vendor..."
                className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={pending}
                className="rounded bg-primary px-6 py-2.5 text-[13px] font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <span role="status" className="text-xs text-text-secondary">
                {savedNote}
              </span>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
