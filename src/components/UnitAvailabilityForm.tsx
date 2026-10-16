"use client";

import { useState, useTransition } from "react";
import { updateUnitAvailability } from "@/app/admin/(protected)/actions";
import type { UnitAvailabilityStatus } from "@/generated/prisma/enums";

type Row = {
  unitType: string;
  status: UnitAvailabilityStatus;
  rent: string;
  availability: string;
};

const STATUS_LABEL: Record<UnitAvailabilityStatus, string> = {
  AVAILABLE: "Available",
  WAITLIST: "Waitlist",
  FULL: "Fully leased",
  CONTACT: "Contact for availability",
};

export function UnitAvailabilityForm({
  propertySlug,
  units,
}: {
  propertySlug: string;
  units: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(units);
  const [pending, startTransition] = useTransition();
  const [savedNote, setSavedNote] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<Row>) {
    setSavedNote(null);
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function handleSave() {
    startTransition(async () => {
      await updateUnitAvailability(propertySlug, rows);
      setSavedNote("Saved.");
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded bg-surface p-7 shadow-card">
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <div key={row.unitType} className="flex flex-col gap-3 rounded border border-border p-4">
            <span className="text-sm font-medium">{row.unitType}</span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
                  Status
                </label>
                <select
                  value={row.status}
                  onChange={(e) =>
                    updateRow(index, { status: e.target.value as UnitAvailabilityStatus })
                  }
                  className="w-full rounded border border-input-border px-3 py-2.5 text-sm"
                >
                  {(Object.keys(STATUS_LABEL) as UnitAvailabilityStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
                  Rent
                </label>
                <input
                  type="text"
                  value={row.rent}
                  onChange={(e) => updateRow(index, { rent: e.target.value })}
                  placeholder="e.g. $950/mo"
                  className="w-full rounded border border-input-border px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
                  Availability
                </label>
                <input
                  type="text"
                  value={row.availability}
                  onChange={(e) => updateRow(index, { availability: e.target.value })}
                  placeholder="e.g. Available now, Waitlist 3-6 mo"
                  className="w-full rounded border border-input-border px-3 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
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
  );
}
