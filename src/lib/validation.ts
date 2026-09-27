import { z } from "zod";

export const vendorSubmissionSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  contactName: z.string().trim().min(1, "Contact name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  serviceType: z.string().min(1, "Please select a service type"),
  message: z.string().trim().min(1, "Tell us a bit about your business"),
});

export type VendorSubmissionFormValues = z.infer<typeof vendorSubmissionSchema>;

export const propertyContactSchema = z.object({
  name: z.string().trim().min(1, "Your name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().optional(),
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
