import type {
  Announcement,
  Attachment,
  Concern,
  ConcernCategory,
  ConcernStatus,
  ConcernUpdate,
  DocumentRequest,
  DocumentStatus,
  EmergencyContact,
  ImpactSnapshot,
  Profile,
} from "@/lib/types";
import { categoryLabels, documentTypes, sdgMappings, statusLabels } from "@/lib/types";

interface DemoStore {
  profiles: Profile[];
  concerns: Concern[];
  documentRequests: DocumentRequest[];
  announcements: Announcement[];
  emergencyContacts: EmergencyContact[];
  auditLogs: { id: string; actorId: string; action: string; entityType: string; entityId: string; metadata: Record<string, unknown>; createdAt: string }[];
  impactRecords: { id: string; concernId: string; sdgCode: string; outcome: string; recordedBy: string; createdAt: string }[];
  sessions: Map<string, Profile>;
  credentials: Map<string, string>;
}

const runtime = globalThis as typeof globalThis & { __oneDemoStore?: DemoStore };

function createInitialStore(): DemoStore {
  return {
    profiles: [
      {
        id: "admin-demo",
        email: "admin@one.local",
        fullName: "ONE Operations",
        role: "admin",
        organizationName: process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services",
      },
      {
        id: "resident-demo",
        email: "resident@one.local",
        fullName: "Alex Rivera",
        firstName: "Alex",
        lastName: "Rivera",
        mobileNumber: "+63 917 000 0000",
        address: "Kihare, Tankulan, Manolo Fortich, Bukidnon",
        policyAcceptedAt: new Date().toISOString(),
        role: "resident",
        organizationName: process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services",
      },
    ],
    concerns: [],
    documentRequests: [],
    announcements: [
      {
        id: "announcement-1",
        priority: "high",
        title: "Keep service requests specific",
        excerpt: "Include a clear location and the outcome you need so the operations team can route your request quickly.",
        publishedAt: new Date().toISOString(),
      },
      {
        id: "announcement-2",
        priority: "standard",
        title: "Community action updates",
        excerpt: "Resolved concerns now include an action record and completion evidence when available.",
        publishedAt: new Date(Date.now() - 86_400_000).toISOString(),
      },
    ],
    emergencyContacts: [
      { id: "emergency-1", label: "Emergency response", number: "911", description: "For immediate danger or urgent medical assistance." },
      { id: "emergency-2", label: "Public safety desk", number: "+63 2 8888 0000", description: "For safety concerns that need coordinated follow-up." },
      { id: "emergency-3", label: "Health support", number: "+63 2 8777 0000", description: "For non-emergency health and sanitation guidance." },
    ],
    auditLogs: [],
    impactRecords: [],
    sessions: new Map(),
    credentials: new Map([["resident@one.local", "demo-resident"]]),
  };
}

export const store = runtime.__oneDemoStore ?? (runtime.__oneDemoStore = createInitialStore());

export function now() {
  return new Date().toISOString();
}

function nextReference(prefix: "CON" | "DOC", collectionLength: number) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(collectionLength + 1).padStart(4, "0")}`;
}

export function getProfileById(id: string) {
  return store.profiles.find((profile) => profile.id === id);
}

export function getProfileByEmail(email: string) {
  return store.profiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase());
}

export function createResident(input: {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNumber: string;
  address: string;
}) {
  const fullName = [input.firstName, input.middleName, input.lastName].filter(Boolean).join(" ");
  const profile: Profile = {
    id: `resident-${crypto.randomUUID()}`,
    email: input.email,
    fullName,
    firstName: input.firstName,
    middleName: input.middleName || undefined,
    lastName: input.lastName,
    mobileNumber: input.mobileNumber,
    address: input.address,
    policyAcceptedAt: now(),
    role: "resident",
    organizationName: process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services",
  };
  store.profiles.push(profile);
  // This only exists in the explicit in-memory development adapter. Production uses Supabase Auth.
  store.credentials.set(input.email.toLowerCase(), input.password);
  return profile;
}

export function authenticateResident(email: string, password: string) {
  const profile = getProfileByEmail(email);
  if (!profile || profile.role !== "resident") return null;
  return store.credentials.get(email.toLowerCase()) === password ? profile : null;
}

export function createSession(profile: Profile) {
  const sessionId = crypto.randomUUID();
  store.sessions.set(sessionId, profile);
  return sessionId;
}

export function getSession(sessionId: string | undefined) {
  return sessionId ? store.sessions.get(sessionId) : undefined;
}

export function deleteSession(sessionId: string | undefined) {
  if (sessionId) store.sessions.delete(sessionId);
}

export function createConcern(input: {
  resident: Profile;
  category: ConcernCategory;
  title: string;
  description: string;
  locationText: string;
  latitude?: number;
  longitude?: number;
  urgency: "normal" | "urgent";
  attachments: Attachment[];
}) {
  const timestamp = now();
  const concern: Concern = {
    id: crypto.randomUUID(),
    reference: nextReference("CON", store.concerns.length),
    residentId: input.resident.id,
    residentName: input.resident.fullName,
    category: input.category,
    title: input.title,
    description: input.description,
    locationText: input.locationText,
    latitude: input.latitude,
    longitude: input.longitude,
    urgency: input.urgency,
    status: "submitted",
    submittedAt: timestamp,
    updatedAt: timestamp,
    attachments: input.attachments,
    updates: [
      {
        id: crypto.randomUUID(),
        status: "submitted",
        note: "Concern submitted and queued for review.",
        actorName: input.resident.fullName,
        createdAt: timestamp,
      },
    ],
  };
  store.concerns.unshift(concern);
  return concern;
}

export function getConcern(reference: string) {
  return store.concerns.find((concern) => concern.reference.toUpperCase() === reference.toUpperCase());
}

export function listConcerns(residentId?: string) {
  return residentId ? store.concerns.filter((concern) => concern.residentId === residentId) : store.concerns;
}

export function addConcernUpdate(concern: Concern, input: { status: ConcernStatus; note: string; actorName: string; assignedTo?: string; actionTaken?: string; resolutionNotes?: string; completionEvidence?: Attachment }) {
  const timestamp = now();
  const update: ConcernUpdate = {
    id: crypto.randomUUID(),
    status: input.status,
    note: input.note,
    actorName: input.actorName,
    createdAt: timestamp,
  };
  concern.status = input.status;
  concern.updatedAt = timestamp;
  concern.updates.push(update);
  if (input.assignedTo) concern.assignedTo = input.assignedTo;
  if (input.actionTaken) concern.actionTaken = input.actionTaken;
  if (input.resolutionNotes) concern.resolutionNotes = input.resolutionNotes;
  if (input.completionEvidence) concern.completionEvidence = input.completionEvidence;
  if (input.status === "resolved") concern.resolvedAt = timestamp;
  return update;
}

export function addAuditLog(input: { actorId: string; action: string; entityType: string; entityId: string; metadata?: Record<string, unknown> }) {
  store.auditLogs.unshift({ id: crypto.randomUUID(), ...input, metadata: input.metadata ?? {}, createdAt: now() });
}

export function addImpactRecords(concern: Concern, recordedBy: string) {
  const existingCodes = new Set(store.impactRecords.filter((record) => record.concernId === concern.id).map((record) => record.sdgCode));
  sdgMappings[concern.category].forEach((sdgCode) => {
    if (!existingCodes.has(sdgCode)) {
      store.impactRecords.unshift({
        id: crypto.randomUUID(),
        concernId: concern.id,
        sdgCode,
        outcome: concern.actionTaken ?? "Completed action recorded",
        recordedBy,
        createdAt: now(),
      });
    }
  });
}

export function createDocumentRequest(input: { resident: Profile; documentType: string; purpose: string }) {
  const timestamp = now();
  const request: DocumentRequest = {
    id: crypto.randomUUID(),
    reference: nextReference("DOC", store.documentRequests.length),
    residentId: input.resident.id,
    residentName: input.resident.fullName,
    documentType: input.documentType,
    purpose: input.purpose,
    status: "submitted",
    submittedAt: timestamp,
    issuingOrganization: process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services",
    updates: [{ id: crypto.randomUUID(), status: "submitted", note: "Request submitted.", createdAt: timestamp }],
  };
  store.documentRequests.unshift(request);
  return request;
}

export function getDocument(reference: string) {
  return store.documentRequests.find((request) => request.reference.toUpperCase() === reference.toUpperCase());
}

export function updateDocumentStatus(request: DocumentRequest, status: DocumentStatus, note: string) {
  const timestamp = now();
  request.status = status;
  request.updates.push({ id: crypto.randomUUID(), status, note, createdAt: timestamp });
  if (status === "ready" || status === "released") request.issueDate = timestamp;
  return request;
}

export function impactSnapshot(): ImpactSnapshot {
  const resolved = store.concerns.filter((concern) => concern.status === "resolved" && concern.resolvedAt);
  const totalResolutionHours = resolved.reduce((sum, concern) => {
    return sum + (new Date(concern.resolvedAt as string).getTime() - new Date(concern.submittedAt).getTime()) / 3_600_000;
  }, 0);
  const concernsByCategory = Object.fromEntries(
    Object.keys(categoryLabels).map((category) => [category, store.concerns.filter((concern) => concern.category === category).length]),
  );
  const completedWithAction = resolved.filter((concern) => Boolean(concern.actionTaken)).length;
  const mappingCounts = Object.fromEntries(Object.keys(sdgMappings).flatMap((category) => sdgMappings[category as ConcernCategory].map((sdg) => [sdg, 0])));
  resolved.forEach((concern) => sdgMappings[concern.category].forEach((sdg) => { mappingCounts[sdg] = (mappingCounts[sdg] ?? 0) + 1; }));
  const count = (category: ConcernCategory) => resolved.filter((concern) => concern.category === category).length;
  return {
    concernsReceived: store.concerns.length,
    concernsResolved: resolved.length,
    resolutionRate: store.concerns.length ? Math.round((resolved.length / store.concerns.length) * 100) : 0,
    averageResolutionHours: resolved.length ? Math.round((totalResolutionHours / resolved.length) * 10) / 10 : null,
    documentsProcessed: store.documentRequests.filter((request) => ["processing", "ready", "released"].includes(request.status)).length,
    concernsByCategory,
    sdg11: [
      { label: "Resolved community concerns", value: resolved.length, detail: "Completed records only" },
      { label: "Infrastructure issues addressed", value: count("roads_infrastructure"), detail: "Resolved road and infrastructure records" },
      { label: "Waste issues addressed", value: count("waste_management"), detail: "Resolved waste records" },
      { label: "Water & sanitation addressed", value: count("water_sanitation"), detail: "Resolved water and sanitation records" },
      { label: "Safety and environment addressed", value: count("public_safety") + count("environment") + count("disaster_emergency"), detail: "Resolved safety, environment, and disaster records" },
    ],
    sdg16: [
      { label: "Resolution rate", value: `${Math.round((resolved.length / Math.max(store.concerns.length, 1)) * 100)}%`, detail: "Resolved concerns divided by submitted concerns" },
      { label: "Average response time", value: "Recorded on timeline", detail: "Per-transition timestamps are retained" },
      { label: "Average resolution time", value: resolved.length ? `${Math.round(totalResolutionHours / resolved.length)}h` : "No resolved records", detail: "From submission to resolution" },
      { label: "Completed public services", value: store.documentRequests.filter((request) => request.status === "released").length, detail: "Released document requests" },
      { label: "Resolved with documented action", value: completedWithAction, detail: "Resolved records with an action_taken value" },
      { label: "Auditability", value: `${store.concerns.reduce((sum, concern) => sum + concern.updates.length, 0)} updates`, detail: "Timestamped concern updates" },
    ],
    generatedAt: now(),
  };
}

export function publicDocumentVerification(reference: string) {
  const request = getDocument(reference);
  if (!request || !["ready", "released"].includes(request.status)) return null;
  return {
    valid: true,
    reference: request.reference,
    documentType: request.documentType,
    issueDate: request.issueDate,
    issuingOrganization: request.issuingOrganization,
  };
}

export const demoCredentials = {
  adminEmail: "admin@one.local",
  adminPassword: "demo-admin",
  residentEmail: "resident@one.local",
  residentPassword: "demo-resident",
};

export const allowedDocumentTypes = documentTypes;
export const displayStatus = statusLabels;
