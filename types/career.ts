// Career-related TypeScript types

export type JobCategory = "marketing" | "technology" | "content" | "operations";
export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type ApplicationStatus = "new" | "reviewed" | "contacted" | "interviewing" | "offered" | "hired" | "rejected";

export interface CareerJob {
  id: string;
  title: string;
  category: JobCategory;
  type: JobType;
  description: string;
  requirements: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CareerTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CareerApplication {
  id: string;
  name: string;
  email: string;
  phone?: string;
  area_of_interest?: string;
  availability?: string;
  message?: string;
  resume_url?: string;
  job_id?: string;
  ghl_contact_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  status: ApplicationStatus;
  created_at: string;
}

// Form submission types
export interface CareerApplicationFormData {
  name: string;
  email: string;
  phone?: string;
  area_of_interest?: string;
  availability?: string;
  message?: string;
  resume?: File;
  job_id?: string;
}

export interface CareerApplicationPayload {
  name: string;
  email: string;
  phone?: string;
  area_of_interest?: string;
  availability?: string;
  message?: string;
  resume_url?: string;
  job_id?: string;
  pageUrl?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// API response types
export interface CareerUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface CareerApplicationResponse {
  success: boolean;
  applicationId?: string;
  ghlContactId?: string;
  error?: string;
}

// Area of interest options
export const AREAS_OF_INTEREST = [
  { value: "marketing", label: "Marketing" },
  { value: "technology", label: "Technology" },
  { value: "content", label: "Content & Editorial" },
  { value: "operations", label: "Operations" },
  { value: "sales", label: "Sales & Partnerships" },
  { value: "other", label: "Other" },
] as const;

// Availability options
export const AVAILABILITY_OPTIONS = [
  { value: "immediate", label: "Immediately" },
  { value: "2_weeks", label: "Within 2 weeks" },
  { value: "1_month", label: "Within 1 month" },
  { value: "flexible", label: "Flexible" },
] as const;

// Job category display names
export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  marketing: "Marketing",
  technology: "Technology",
  content: "Content",
  operations: "Operations",
};

// Job type badge colors
export const JOB_TYPE_COLORS: Record<JobType, string> = {
  "Full-time": "bg-green-100 text-green-700",
  "Part-time": "bg-blue-100 text-blue-700",
  "Contract": "bg-yellow-100 text-yellow-700",
  "Internship": "bg-purple-100 text-purple-700",
};
