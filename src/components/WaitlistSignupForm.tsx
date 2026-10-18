"use client";

import { cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { waitlistSignupSchema, type WaitlistSignupFormValues } from "@/lib/validation";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptchaClient";
import { HoneypotField } from "@/components/HoneypotField";

const inputClass =
  "w-full rounded border border-input-border bg-surface px-3.5 py-3 text-sm text-text outline-none focus:border-2 focus:border-primary focus:px-[13px] focus:py-[11px]";
const labelClass = "text-xs font-medium uppercase tracking-wide text-text-secondary";
const errorClass = "text-xs text-[#c62828]";

export function WaitlistSignupForm({
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
  } = useForm<WaitlistSignupFormValues>({
    resolver: zodResolver(waitlistSignupSchema),
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [recaptchaScriptLoaded, setRecaptchaScriptLoaded] = useState(false);
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number | null>(null);

  useEffect(() => {
    if (
      RECAPTCHA_SITE_KEY &&
      recaptchaScriptLoaded &&
      recaptchaContainerRef.current &&
      recaptchaWidgetId === null &&
      window.grecaptcha
    ) {
      setRecaptchaWidgetId(
        window.grecaptcha.render(recaptchaContainerRef.current, { sitekey: RECAPTCHA_SITE_KEY })
      );
    }
  }, [recaptchaScriptLoaded, recaptchaWidgetId]);

  async function onSubmit(values: WaitlistSignupFormValues) {
    setSubmitError(null);

    let recaptchaToken: string | undefined;
    if (RECAPTCHA_SITE_KEY) {
      recaptchaToken = window.grecaptcha?.getResponse(recaptchaWidgetId ?? undefined);
      if (!recaptchaToken) {
        setSubmitError("Please complete the reCAPTCHA before sending.");
        return;
      }
    }

    try {
      const res = await fetch(`/api/properties/${propertySlug}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, recaptchaToken }),
      });
      if (!res.ok) throw new Error("Submission failed");
    } catch {
      setSubmitError("Something went wrong signing you up. Please try again.");
      if (RECAPTCHA_SITE_KEY) {
        window.grecaptcha?.reset(recaptchaWidgetId ?? undefined);
      }
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
        <h1 className="text-xl font-bold">You&apos;re on the waitlist</h1>
        <p className="max-w-[420px] text-sm leading-relaxed text-text-secondary">
          We&apos;ll reach out to you as soon as a unit opens up at{" "}
          <strong>{propertyName}</strong>.
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
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-medium">Join the waitlist</h1>
        <p className="text-sm text-text-secondary">
          We&apos;ll email or call you as soon as a unit becomes available at{" "}
          {propertyName}.
        </p>
      </div>

      <HoneypotField register={register} />

      {submitError && (
        <div role="alert" className="rounded border border-[#ffcdd2] bg-[#ffebee] p-3.5 text-sm text-[#b71c1c]">
          {submitError}
        </div>
      )}

      <Field id="name" label="Your name" error={errors.name?.message}>
        <input className={inputClass} placeholder="Full name" {...register("name")} />
      </Field>

      <Field id="email" label="Email" error={errors.email?.message}>
        <input className={inputClass} type="email" placeholder="you@example.com" {...register("email")} />
      </Field>

      <Field id="phone" label="Phone (optional)" error={errors.phone?.message}>
        <input className={inputClass} type="tel" placeholder="(555) 000-0000" {...register("phone")} />
      </Field>

      {RECAPTCHA_SITE_KEY && (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setRecaptchaScriptLoaded(true)}
        />
      )}
      {RECAPTCHA_SITE_KEY && <div ref={recaptchaContainerRef} />}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-primary px-7 py-3 text-sm font-medium uppercase tracking-wide text-white shadow-button disabled:opacity-60"
        >
          {isSubmitting ? "Signing up…" : "Join the waitlist"}
        </button>
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
