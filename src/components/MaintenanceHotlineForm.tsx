"use client";

import { useState, useTransition } from "react";
import { updateSiteSetting } from "@/app/admin/(protected)/actions";

export function MaintenanceHotlineForm({
  settingKey,
  initial,
}: {
  settingKey: string;
  initial: string | null;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [pending, startTransition] = useTransition();
  const [savedNote, setSavedNote] = useState<string | null>(null);

  function handleSave() {
    startTransition(async () => {
      await updateSiteSetting(settingKey, value);
      setSavedNote("Saved.");
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded bg-surface p-7 shadow-card">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          Maintenance work order hotline — shown on the public Residents page for
          properties where maintenance requests go through the hotline
        </span>
        <span className="text-xs text-text-secondary">
          Leave blank to show a &quot;coming soon&quot; message instead.
        </span>
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-sm">
        <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
          Hotline phone number
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSavedNote(null);
          }}
          placeholder="e.g. (313) 555-0100"
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
  );
}
