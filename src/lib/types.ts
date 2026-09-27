export type IncomeLimitRow = {
  householdSize: string;
  maxAnnualIncome: string | null;
};

export type Unit = {
  type: string;
  bedBath: string | null;
  rent: string | null;
  availability: string | null;
};

export type Property = {
  slug: string;
  name: string;
  isSubsidized: boolean;
  neighborhood: string | null;
  address: string | null;
  unitMixSummary: string | null;
  description: string | null;
  amenities: string[];
  units: Unit[];
  incomeLimits: IncomeLimitRow[] | null;
  requiredDocuments: string[];
  applyUrl: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
};

export type VendorSubmissionStatus = "NEW" | "REVIEWED" | "CONTACTED" | "DECLINED";

export type VendorSubmissionInput = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  serviceType: string;
  message: string;
};
