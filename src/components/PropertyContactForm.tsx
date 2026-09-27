"use client";

import { cloneElement, isValidElement, useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  propertyContactSchema,
  type PropertyContactFormValues,
} from "@/lib/validation";

const inputClass =
  "w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm text-text outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]";
const labelClass = "text-xs font-medium uppercase tracking-wide text-text-secondary";
const errorClass = "text-xs text-[#c62828]";

export function PropertyContactForm({
  propertyName,
  propertySlug,
}: {
  propertyName: string;
  propertySlug: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<PropertyContactFormValues>({
    resolver: zodResolver(propertyContactSchema),
    defaultValues: { preferredContact: "email" },
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSubmit(values: PropertyContactFormValues) {
    setSubmitError(null);
    try {
      const res = await fetch(`/api/properties/${propertySlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Submission failed");
    } catch {
      setSubmitError("Something went wrong sending your message. Please try again.");
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
        <h1 className="text-xl font-bold">Your message was sent</h1>
        <p className="max-w-[420px] text-sm leading-relaxed text-text-secondary">
          The property manager for <strong>{propertyName}</strong> received your message
          and will follow up using your preferred contact method, typically within{" "}
          <strong>1 business day</strong>.
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
      <h1 className="text-xl font-medium">Contact about this property</h1>

      {submitError && (
        <div role="alert" className="rounded border border-[#ffcdd2] bg-[#ffebee] p-3.5 text-sm text-[#b71c1c]">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <Field id="name" label="Your name" error={errors.name?.message}>
          <input className={inputClass} placeholder="Full name" {...register("name")} />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone?.message}>
          <input className={inputClass} type="tel" placeholder="(555) 000-0000" {...register("phone")} />
        </Field>
      </div>

      <Field id="email" label="Email" error={errors.email?.message}>
        <input className={inputClass} type="email" placeholder="you@example.com" {...register("email")} />
      </Field>

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className={labelClass}>Preferred contact method</legend>
        <div className="flex gap-6 text-sm text-[#424242]">
          <label className="flex items-center gap-2">
            <input type="radio" value="email" {...register("preferredContact")} /> Email
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="phone" {...register("preferredContact")} /> Phone
          </label>
        </div>
      </fieldset>

      <Field id="message" label="Message" error={errors.message?.message}>
        <textarea
          className={inputClass}
          rows={5}
          placeholder={`I'm interested in units at ${propertyName} — what's the current availability?`}
          {...register("message")}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-primary px-7 py-3 text-sm font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
        >
          {isSubmitting ? "Sending…" : "Send message"}
        </button>
        <span className="text-[13px] text-[#9e9e9e]">
          We typically respond within 1 business day.
        </span>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(children, {
            id,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? errorId : undefined,
          })
        : children}
      {error && (
        <span id={errorId} role="alert" className={errorClass}>
          {error}
        </span>
      )}
    </div>
  );
}
