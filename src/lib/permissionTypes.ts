export const RESOURCES = [
  "vendor_submissions",
  "general_contact_submissions",
  "property_contact_submissions",
  "properties",
  "documents",
  "staff",
] as const;
export type Resource = (typeof RESOURCES)[number];

export const ACTIONS = ["view", "edit", "archive", "delete"] as const;
export type Action = (typeof ACTIONS)[number];

/** Which actions are meaningful for each resource — drives the permission-matrix UI. */
export const RESOURCE_ACTIONS: Record<Resource, Action[]> = {
  vendor_submissions: ["view", "edit", "archive", "delete"],
  general_contact_submissions: ["view", "edit", "archive", "delete"],
  property_contact_submissions: ["view", "edit", "archive", "delete"],
  properties: ["view", "edit"],
  documents: ["view", "edit"],
  staff: ["view", "edit"],
};

export const RESOURCE_LABEL: Record<Resource, string> = {
  vendor_submissions: "Vendor Submissions",
  general_contact_submissions: "General Contact Submissions",
  property_contact_submissions: "Property Contact Inquiries",
  properties: "Properties",
  documents: "Documents",
  staff: "Staff & Roles",
};

export const ACTION_LABEL: Record<Action, string> = {
  view: "View",
  edit: "Edit",
  archive: "Archive",
  delete: "Delete",
};
