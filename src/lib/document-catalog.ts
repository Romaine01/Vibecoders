import type { DocumentStatus } from "@/lib/types";

export interface DocumentTypeDetail {
  description: string;
  requirements: string[];
  processing: string;
}

export const documentTypeDetails: Record<string, DocumentTypeDetail> = {
  "Certificate of Residency": {
    description: "Official proof that a person resides within the community.",
    requirements: ["Valid ID", "Proof of residency or utility bill"],
    processing: "Reviewed and released after resident verification.",
  },
  "Certificate of Indigency": {
    description: "Certification of household economic status for assistance programs.",
    requirements: ["Valid ID", "Barangay residency confirmation"],
    processing: "Reviewed by the community services desk before release.",
  },
  "Community Clearance": {
    description: "General clearance for employment, school, or personal requirements.",
    requirements: ["Valid ID", "Purpose letter if required"],
    processing: "Standard review, then soft or hard copy release.",
  },
  "Business Clearance": {
    description: "Clearance supporting a business permit or renewal application.",
    requirements: ["Valid ID", "Business name and location"],
    processing: "Verified against the business record before release.",
  },
  "Good Moral Certificate": {
    description: "Certification of good standing within the community.",
    requirements: ["Valid ID", "Stated purpose"],
    processing: "Reviewed by the community services desk before release.",
  },
  Other: {
    description: "Another official community document not listed above.",
    requirements: ["Valid ID", "Clear description of the document needed"],
    processing: "Staff confirm requirements during review.",
  },
};

export function documentTypeDetail(documentType: string): DocumentTypeDetail {
  return (
    documentTypeDetails[documentType] ?? {
      description: "Official community document.",
      requirements: ["Valid ID"],
      processing: "Reviewed by the community services desk.",
    }
  );
}

const transitions: Record<DocumentStatus, DocumentStatus[]> = {
  submitted: ["under_review", "rejected"],
  under_review: ["processing", "rejected"],
  processing: ["ready", "rejected"],
  ready: ["released"],
  released: [],
  rejected: [],
};

export function nextDocumentStatuses(status: DocumentStatus): DocumentStatus[] {
  return transitions[status] ?? [];
}

export const completedDocumentStatuses: DocumentStatus[] = ["released"];
export const activeDocumentStatuses: DocumentStatus[] = [
  "submitted",
  "under_review",
  "processing",
  "ready",
];
