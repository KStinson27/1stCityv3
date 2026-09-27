"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SERVICE_TYPES,
  vendorSubmissionSchema,
  type VendorSubmissionFormValues,
} from "@/lib/validation";

const inputClass =
  "w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm text-text outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]";
const labelClass = "text-xs font-medium uppercase tracking-wide text-text-secondary";
const errorClass = "text-xs text-[#c62828]";

export function VendorForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<VendorSubmissionFormValues>({
    resolver: zodResolver(vendorSubmissionSchema),
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);

  async function handleFileSelect(file: File | undefined) {
    if (!file) return;
    setFileError(null);
    setFileName(file.name);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      if (data.url) {
        setAttachment({ url: data.url, name: data.name });
      }
      // If storage isn't configured (`data.skipped`), we keep the
      // filename shown but don't have a URL to submit — same
      // filename-only fallback as before file storage existed.
    } catch {
      setFileError("Couldn't upload that file. You can still submit without it.");
      setFileName(null);
    } finally {
      setUploading(false);
    }
  }

  function removeFile() {
    setFileName(null);
    setAttachment(null);
    setFileError(null);
  }

  async function onSubmit(values: VendorSubmissionFormValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/vendor-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          attachmentUrl: attachment?.url,
          attachmentName: attachment?.name,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      reset();
      setFileName(null);
      setAttachment(null);
    } catch {
      setSubmitError("Something went wrong sending your proposal. Please try again.");
    }
  }

  if (isSubmitSuccessful && !submitError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded bg-surface p-14 text-center shadow-card">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-bg">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Thanks — we received your proposal</h2>
        <p className="max-w-[420px] text-sm leading-relaxed text-text-secondary">
          Our team reviews new vendor submissions within <strong>5 business days</strong>.
          If it&apos;s a good fit, someone from 1st City LLC will reach out.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 rounded bg-surface p-8 shadow-card"
      noValidate
    >
      <h2 className="text-lg font-medium">Submit a proposal</h2>

      {submitError && (
        <div className="rounded border border-[#ffcdd2] bg-[#ffebee] p-3.5 text-sm text-[#b71c1c]">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <Field label="Company name" error={errors.companyName?.message}>
          <input className={inputClass} placeholder="e.g. Greenline Landscaping" {...register("companyName")} />
        </Field>
        <Field label="Contact name" error={errors.contactName?.message}>
          <input className={inputClass} placeholder="Full name" {...register("contactName")} />
        </Field>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Field label="Email" error={errors.email?.message}>
          <input className={inputClass} type="email" placeholder="you@company.com" {...register("email")} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input className={inputClass} type="tel" placeholder="(555) 000-0000" {...register("phone")} />
        </Field>
      </div>

      <Field label="Service type" error={errors.serviceType?.message}>
        <select className={inputClass} defaultValue="" {...register("serviceType")}>
          <option value="" disabled>
            Select one...
          </option>
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tell us about your business" error={errors.message?.message}>
        <textarea
          className={inputClass}
          rows={5}
          placeholder="Services offered, service area, licensing/insurance, references, rates..."
          {...register("message")}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>Attachment (optional)</span>
        {fileName ? (
          <div className="flex items-center gap-3 rounded border border-primary-light bg-primary-bg px-4 py-3.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="flex-1 truncate text-sm font-medium text-primary-dark">
              {uploading ? `Uploading ${fileName}…` : fileName}
            </span>
            <button
              type="button"
              aria-label="Remove file"
              onClick={removeFile}
              className="text-primary-dark"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-2.5 rounded border border-dashed border-input-border bg-background px-4 py-4 text-sm text-text-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#616161" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Drag a proposal, W-9, or insurance cert here, or click to browse (PDF, max
            10MB)
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
          </label>
        )}
        {fileError && <span className={errorClass}>{fileError}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-primary px-7 py-3 text-sm font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : "Submit proposal"}
        </button>
        <span className="text-[13px] text-[#9e9e9e]">
          We review new submissions within 5 business days.
        </span>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <label className={labelClass}>{label}</label>
      {children}
      {error && <span className={errorClass}>{error}</span>}
    </div>
  );
}
