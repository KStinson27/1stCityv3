"use client";

import { useState, useTransition } from "react";
import { updatePropertyContent } from "@/app/admin/(protected)/actions";

type IncomeLimitDraft = { householdSize: string; maxAnnualIncome: string };

type Draft = {
  description: string;
  amenities: string[];
  incomeLimits: IncomeLimitDraft[];
  requiredDocuments: string[];
  applyUrl: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  waitlistSignupEnabled: boolean;
  residentPortalUrl: string;
  maintenanceMethod: "" | "HOTLINE" | "PORTAL";
};

export function PropertyContentForm({
  propertySlug,
  initial,
  showIncomeLimits,
  showWaitlistToggle,
}: {
  propertySlug: string;
  initial: Draft;
  showIncomeLimits: boolean;
  showWaitlistToggle: boolean;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [pending, startTransition] = useTransition();
  const [savedNote, setSavedNote] = useState<string | null>(null);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setSavedNote(null);
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      await updatePropertyContent(propertySlug, draft);
      setSavedNote("Saved.");
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded bg-surface p-7 shadow-card">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
          Description
        </label>
        <textarea
          value={draft.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          placeholder="A short description of the property..."
          className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
        />
      </div>

      <StringListEditor
        label="Amenities"
        placeholder="e.g. On-site laundry"
        values={draft.amenities}
        onChange={(values) => update("amenities", values)}
      />

      {showIncomeLimits && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Income limits
          </label>
          <div className="flex flex-col gap-2">
            {draft.incomeLimits.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={row.householdSize}
                  onChange={(e) =>
                    update(
                      "incomeLimits",
                      draft.incomeLimits.map((r, i) =>
                        i === index ? { ...r, householdSize: e.target.value } : r,
                      ),
                    )
                  }
                  placeholder="e.g. 1 person"
                  className="w-1/2 rounded border border-input-border px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={row.maxAnnualIncome}
                  onChange={(e) =>
                    update(
                      "incomeLimits",
                      draft.incomeLimits.map((r, i) =>
                        i === index ? { ...r, maxAnnualIncome: e.target.value } : r,
                      ),
                    )
                  }
                  placeholder="e.g. $35,000"
                  className="w-1/2 rounded border border-input-border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "incomeLimits",
                      draft.incomeLimits.filter((_, i) => i !== index),
                    )
                  }
                  className="shrink-0 rounded border border-input-border px-2.5 py-2 text-xs text-[#757575]"
                  aria-label="Remove row"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update("incomeLimits", [
                  ...draft.incomeLimits,
                  { householdSize: "", maxAnnualIncome: "" },
                ])
              }
              className="w-fit rounded border border-input-border px-3.5 py-2 text-xs font-medium text-primary-dark"
            >
              + Add row
            </button>
          </div>
        </div>
      )}

      {showIncomeLimits && (
        <StringListEditor
          label="Required documents"
          placeholder="e.g. Driver's License or State ID"
          values={draft.requiredDocuments}
          onChange={(values) => update("requiredDocuments", values)}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Apply URL
          </label>
          <input
            type="text"
            value={draft.applyUrl}
            onChange={(e) => update("applyUrl", e.target.value)}
            placeholder="https://..."
            className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Contact name
          </label>
          <input
            type="text"
            value={draft.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Contact phone
          </label>
          <input
            type="text"
            value={draft.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
            className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Contact email
          </label>
          <input
            type="text"
            value={draft.contactEmail}
            onChange={(e) => update("contactEmail", e.target.value)}
            className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
            Resident portal URL
          </label>
          <input
            type="text"
            value={draft.residentPortalUrl}
            onChange={(e) => update("residentPortalUrl", e.target.value)}
            placeholder="https://..."
            className="w-full rounded border border-input-border px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      {showWaitlistToggle && (
        <label className="flex items-start gap-2.5 rounded border border-input-border p-3.5 text-sm text-[#424242]">
          <input
            type="checkbox"
            checked={draft.waitlistSignupEnabled}
            onChange={(e) => update("waitlistSignupEnabled", e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Enable waitlist signup</span>
            <br />
            <span className="text-xs text-text-secondary">
              Shows a &quot;Join the waitlist&quot; option on the public site when a unit is
              waitlisted or fully leased, instead of just the contact form.
            </span>
          </span>
        </label>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
          Maintenance requests
        </label>
        <div className="flex flex-wrap gap-4 text-sm text-[#424242]">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name={`${propertySlug}-maintenance`}
              checked={draft.maintenanceMethod === ""}
              onChange={() => update("maintenanceMethod", "")}
            />
            Not set yet
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name={`${propertySlug}-maintenance`}
              checked={draft.maintenanceMethod === "HOTLINE"}
              onChange={() => update("maintenanceMethod", "HOTLINE")}
            />
            Work order hotline
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name={`${propertySlug}-maintenance`}
              checked={draft.maintenanceMethod === "PORTAL"}
              onChange={() => update("maintenanceMethod", "PORTAL")}
            />
            Tenant portal
          </label>
        </div>
        <span className="text-xs text-text-secondary">
          Shown on the public Residents page. &quot;Not set yet&quot; falls back to telling
          residents to contact the leasing office.
        </span>
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

function StringListEditor({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wide text-[#9e9e9e]">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(values.map((v, i) => (i === index ? e.target.value : v)))}
              placeholder={placeholder}
              className="w-full rounded border border-input-border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="shrink-0 rounded border border-input-border px-2.5 py-2 text-xs text-[#757575]"
              aria-label="Remove item"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="w-fit rounded border border-input-border px-3.5 py-2 text-xs font-medium text-primary-dark"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
