import { z } from "zod";

// Optional phone field shared by every form that asks for one. Allows
// digits plus common formatting characters (spaces, dashes, parens, dot,
// a leading +) and requires enough digits for a real number — rejects
// letters and other junk without being strict about a single format.
const phoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^[0-9+\-().\s]+$/.test(value), {
    message: "Phone number can only contain digits and spaces, -, (, ), +",
  })
  .refine((value) => !value || (value.match(/\d/g)?.length ?? 0) >= 10, {
    message: "Enter a complete phone number (at least 10 digits)",
  });

// Honeypot: a field real users never see or fill in (see the hidden
// "website" input in each form component). Any non-empty value here
// means the submission came from a bot, so the API route short-circuits
// to a fake success without writing to the database or sending email.
const honeypotSchema = z.string().optional();

export const vendorSubmissionSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  contactName: z.string().trim().min(1, "Contact name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: phoneSchema,
  serviceType: z.string().min(1, "Please select a service type"),
  message: z.string().trim().min(1, "Tell us a bit about your business"),
  website: honeypotSchema,
});

export type VendorSubmissionFormValues = z.infer<typeof vendorSubmissionSchema>;

// What the API route accepts: the form fields above, plus the optional
// attachment metadata the client attaches after uploading the file
// (see src/app/api/uploads/route.ts).
export const vendorSubmissionApiSchema = vendorSubmissionSchema.extend({
  attachmentUrl: z.string().trim().optional(),
  attachmentName: z.string().trim().optional(),
  recaptchaToken: z.string().trim().optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Your name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: phoneSchema,
  message: z.string().trim().min(1, "Please add a short message"),
  website: honeypotSchema,
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// What the API route accepts: the form fields above, plus the reCAPTCHA
// token the client attaches after the widget is solved (see
// src/components/ContactForm.tsx). Optional because the widget only
// renders — and the server only verifies — when RECAPTCHA keys are set;
// see src/app/api/contact/route.ts.
export const contactApiSchema = contactSchema.extend({
  recaptchaToken: z.string().trim().optional(),
});

export const propertyContactSchema = z.object({
  name: z.string().trim().min(1, "Your name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: phoneSchema,
  preferredContact: z.enum(["email", "phone"]),
  message: z.string().trim().min(1, "Please add a short message"),
  website: honeypotSchema,
});

export type PropertyContactFormValues = z.infer<typeof propertyContactSchema>;

// What the API route accepts: the form fields above, plus the reCAPTCHA
// token the client attaches after the widget is solved. Optional for the
// same reason as contactApiSchema above.
export const propertyContactApiSchema = propertyContactSchema.extend({
  recaptchaToken: z.string().trim().optional(),
});

export const SERVICE_TYPES = [
  "Landscaping",
  "HVAC",
  "Plumbing",
  "Electrical",
  "General contracting",
  "Cleaning",
  "Pest control",
  "Other",
] as const;
