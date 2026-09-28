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

export const vendorSubmissionSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  contactName: z.string().trim().min(1, "Contact name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: phoneSchema,
  serviceType: z.string().min(1, "Please select a service type"),
  message: z.string().trim().min(1, "Tell us a bit about your business"),
});

export type VendorSubmissionFormValues = z.infer<typeof vendorSubmissionSchema>;

// What the API route accepts: the form fields above, plus the optional
// attachment metadata the client attaches after uploading the file
// (see src/app/api/uploads/route.ts).
export const vendorSubmissionApiSchema = vendorSubmissionSchema.extend({
  attachmentUrl: z.string().trim().optional(),
  attachmentName: z.string().trim().optional(),
});

export const propertyContactSchema = z.object({
  name: z.string().trim().min(1, "Your name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: phoneSchema,
  preferredContact: z.enum(["email", "phone"]),
  message: z.string().trim().min(1, "Please add a short message"),
});

export type PropertyContactFormValues = z.infer<typeof propertyContactSchema>;

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
