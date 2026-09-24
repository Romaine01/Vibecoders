export const concernCategories = [
  "roads_infrastructure",
  "waste_management",
  "water_sanitation",
  "environment",
  "public_safety",
  "health_sanitation",
  "disaster_emergency",
  "other",
] as const;

export type ConcernCategory = (typeof concernCategories)[number];
export type ConcernUrgency = "normal" | "urgent";
export type ConcernStatus =
  | "submitted"
  | "received"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected";

export const concernStatuses: ConcernStatus[] = [
  "submitted",
  "received",
  "assigned",
  "in_progress",
  "resolved",
  "rejected",
];

export type UserRole = "resident" | "admin";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  mobileNumber?: string;
  address?: string;
  policyAcceptedAt?: string;
  role: UserRole;
  organizationName: string;
  phone?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl?: string;
  createdAt: string;
}

export interface ConcernUpdate {
  id: string;
  status: ConcernStatus;
  note: string;
  actorName: string;
  createdAt: string;
}

export interface Concern {
  id: string;
  reference: string;
  residentId: string;
  residentName: string;
  category: ConcernCategory;
  title: string;
  description: string;
  locationText: string;
  latitude?: number;
  longitude?: number;
  urgency: ConcernUrgency;
  status: ConcernStatus;
  assignedTo?: string;
  actionTaken?: string;
  resolutionNotes?: string;
  submittedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments: Attachment[];
  completionEvidence?: Attachment;
  updates: ConcernUpdate[];
}

export const documentStatuses = [
  "submitted",
  "under_review",
  "processing",
  "ready",
  "released",
  "rejected",
] as const;

export type DocumentStatus = (typeof documentStatuses)[number];

export interface DocumentRequest {
  id: string;
  reference: string;
  residentId: string;
  residentName: string;
  documentType: string;
  purpose: string;
  status: DocumentStatus;
  submittedAt: string;
  issueDate?: string;
  issuingOrganization: string;
  updates: { id: string; status: DocumentStatus; note: string; createdAt: string }[];
}

export const announcementTypes = [
  "announcement",
  "advisory",
  "emergency",
  "service_notice",
] as const;

export type AnnouncementType = (typeof announcementTypes)[number];

export const announcementStatuses = ["draft", "published", "archived"] as const;

export type AnnouncementStatus = (typeof announcementStatuses)[number];

export interface Announcement {
  id: string;
  priority: "high" | "standard";
  title: string;
  excerpt: string;
  publishedAt: string;
  type?: AnnouncementType;
  status?: AnnouncementStatus;
}

export const announcementTypeLabels: Record<AnnouncementType, string> = {
  announcement: "Announcement",
  advisory: "Advisory",
  emergency: "Emergency",
  service_notice: "Service notice",
};

export const emergencyCategories = [
  "medical",
  "police",
  "fire",
  "disaster",
  "other",
] as const;

export type EmergencyCategory = (typeof emergencyCategories)[number];

export const emergencyCategoryLabels: Record<EmergencyCategory, string> = {
  medical: "Medical",
  police: "Police",
  fire: "Fire",
  disaster: "Disaster response",
  other: "Other",
};

export interface EmergencyContact {
  id: string;
  label: string;
  number: string;
  description: string;
  category?: EmergencyCategory;
}

export interface ImpactMetric {
  label: string;
  value: number | string;
  detail: string;
}

export interface ImpactSnapshot {
  concernsReceived: number;
  concernsResolved: number;
  resolutionRate: number;
  averageResolutionHours: number | null;
  documentsProcessed: number;
  concernsByCategory: Record<string, number>;
  sdg11: ImpactMetric[];
  sdg16: ImpactMetric[];
  generatedAt: string;
}

export const categoryLabels: Record<ConcernCategory, string> = {
  roads_infrastructure: "Roads & infrastructure",
  waste_management: "Waste management",
  water_sanitation: "Water & sanitation",
  environment: "Environment",
  public_safety: "Public safety",
  health_sanitation: "Health & sanitation",
  disaster_emergency: "Disaster & emergency",
  other: "Other",
};

export const statusLabels: Record<ConcernStatus, string> = {
  submitted: "Submitted",
  received: "Received",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  processing: "Processing",
  ready: "Ready for release",
  released: "Released",
  rejected: "Rejected",
};

export const documentTypes = [
  "Certificate of Residency",
  "Certificate of Indigency",
  "Community Clearance",
  "Business Clearance",
  "Good Moral Certificate",
  "Other",
];

export const sdgMappings: Record<ConcernCategory, string[]> = {
  roads_infrastructure: ["SDG 9", "SDG 11"],
  waste_management: ["SDG 11", "SDG 12"],
  water_sanitation: ["SDG 6", "SDG 11"],
  environment: ["SDG 11", "SDG 13"],
  public_safety: ["SDG 11", "SDG 16"],
  health_sanitation: ["SDG 3", "SDG 6"],
  disaster_emergency: ["SDG 11", "SDG 13"],
  other: ["SDG 16"],
};

export const sdgNames: Record<string, string> = {
  "SDG 3": "Good health and well-being",
  "SDG 6": "Clean water and sanitation",
  "SDG 9": "Industry, innovation and infrastructure",
  "SDG 11": "Sustainable cities and communities",
  "SDG 12": "Responsible consumption and production",
  "SDG 13": "Climate action",
  "SDG 16": "Peace, justice and strong institutions",
  "SDG 17": "Partnerships for the goals",
};
