import { createSupabaseServerClient, supabaseConfigured } from "@/lib/supabase/server";
import * as demoStore from "@/lib/demo-store";
import type {
  Announcement,
  Attachment,
  Concern,
  ConcernCategory,
  ConcernStatus,
  ConcernUpdate,
  ConcernUrgency,
  DocumentRequest,
  DocumentStatus,
  EmergencyContact,
  ImpactSnapshot,
  Profile,
} from "@/lib/types";
import { requireUser } from "@/lib/auth";
import { categoryLabels, sdgMappings, statusLabels } from "@/lib/types";

export { store, allowedDocumentTypes, displayStatus } from "@/lib/demo-store";

function now() {
  return new Date().toISOString();
}

function nextReference(prefix: "CON" | "DOC", collectionLength: number) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(collectionLength + 1).padStart(4, "0")}`;
}

// ---------------------------------------------------------------------------
// Helpers to map Supabase database rows (snake_case) to domain models (camelCase)
// ---------------------------------------------------------------------------

interface DbProfileRow {
  full_name?: string;
}

interface DbConcernRow {
  id: string;
  reference: string;
  resident_id: string;
  category: string;
  title: string;
  description: string;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  urgency: string;
  status: string;
  assigned_to: string | null;
  action_taken: string | null;
  resolution_notes: string | null;
  submitted_at: string;
  updated_at: string;
  resolved_at: string | null;
  profiles?: DbProfileRow | null;
  concern_updates?: DbConcernUpdateRow[];
  concern_attachments?: DbConcernAttachmentRow[];
}

interface DbConcernUpdateRow {
  id: string;
  status: string;
  note: string;
  actor_id: string | null;
  created_at: string;
  profiles?: DbProfileRow | null;
}

interface DbConcernAttachmentRow {
  id: string;
  file_name: string;
  mime_type: string;
  storage_path: string;
  created_at: string;
}

interface DbDocRequestRow {
  id: string;
  reference: string;
  resident_id: string;
  document_type_id: string | null;
  purpose: string;
  status: string;
  issue_date: string | null;
  issuing_organization: string | null;
  submitted_at: string;
  document_types?: { name?: string } | null;
  profiles?: DbProfileRow | null;
  document_updates?: Array<{
    id: string;
    status: string;
    note: string;
    created_at: string;
  }>;
}

function mapConcernRow(row: DbConcernRow): Concern {
  const updates: ConcernUpdate[] = (row.concern_updates ?? [])
    .map((u) => ({
      id: u.id,
      status: u.status as ConcernStatus,
      note: u.note,
      actorName: u.profiles?.full_name ?? "Operations desk",
      createdAt: u.created_at,
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const attachments: Attachment[] = (row.concern_attachments ?? []).map((a) => {
    let dataUrl: string | undefined;
    if (a.storage_path && a.storage_path.startsWith("data:")) {
      dataUrl = a.storage_path;
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL && a.storage_path) {
      dataUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/concern-evidence/${a.storage_path}`;
    }
    return {
      id: a.id,
      fileName: a.file_name,
      mimeType: a.mime_type,
      dataUrl,
      createdAt: a.created_at,
    };
  });

  return {
    id: row.id,
    reference: row.reference,
    residentId: row.resident_id,
    residentName: row.profiles?.full_name ?? "Resident",
    category: row.category as ConcernCategory,
    title: row.title,
    description: row.description,
    locationText: row.location_text,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    urgency: row.urgency as ConcernUrgency,
    status: row.status as ConcernStatus,
    assignedTo: row.assigned_to ?? undefined,
    actionTaken: row.action_taken ?? undefined,
    resolutionNotes: row.resolution_notes ?? undefined,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at ?? undefined,
    attachments,
    updates,
  };
}

function mapDocumentRow(row: DbDocRequestRow): DocumentRequest {
  const updates = (row.document_updates ?? [])
    .map((u) => ({
      id: u.id,
      status: u.status as DocumentStatus,
      note: u.note,
      createdAt: u.created_at,
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    id: row.id,
    reference: row.reference,
    residentId: row.resident_id,
    residentName: row.profiles?.full_name ?? "Resident",
    documentType: row.document_types?.name ?? "Document Request",
    purpose: row.purpose,
    status: row.status as DocumentStatus,
    submittedAt: row.submitted_at,
    issueDate: row.issue_date ?? undefined,
    issuingOrganization: row.issuing_organization ?? (process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services"),
    updates,
  };
}

// ---------------------------------------------------------------------------
// Concerns Operations
// ---------------------------------------------------------------------------

export async function listConcerns(residentId?: string): Promise<Concern[]> {
  if (!supabaseConfigured) {
    return demoStore.listConcerns(residentId);
  }

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("concerns")
      .select(`
        *,
        profiles!concerns_resident_id_fkey(full_name),
        concern_updates(*, profiles(full_name)),
        concern_attachments(*)
      `)
      .order("submitted_at", { ascending: false });

    if (residentId) {
      query = query.eq("resident_id", residentId);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn("Supabase listConcerns error, falling back to demo store:", error?.message);
      return demoStore.listConcerns(residentId);
    }

    return (data as unknown as DbConcernRow[]).map(mapConcernRow);
  } catch (err) {
    console.warn("listConcerns exception, falling back:", err);
    return demoStore.listConcerns(residentId);
  }
}

export async function getConcern(reference: string): Promise<Concern | null> {
  if (!supabaseConfigured) {
    return demoStore.getConcern(reference) ?? null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("concerns")
      .select(`
        *,
        profiles!concerns_resident_id_fkey(full_name),
        concern_updates(*, profiles(full_name)),
        concern_attachments(*)
      `)
      .ilike("reference", reference)
      .maybeSingle();

    if (error || !data) {
      return demoStore.getConcern(reference) ?? null;
    }

    return mapConcernRow(data as unknown as DbConcernRow);
  } catch (err) {
    console.warn("getConcern exception, falling back:", err);
    return demoStore.getConcern(reference) ?? null;
  }
}

export async function createConcern(input: {
  resident: Profile;
  category: ConcernCategory;
  title: string;
  description: string;
  locationText: string;
  latitude?: number;
  longitude?: number;
  urgency: ConcernUrgency;
  attachments: Attachment[];
}): Promise<Concern> {
  if (!supabaseConfigured) {
    return demoStore.createConcern(input);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase.from("concerns").select("*", { count: "exact", head: true });
    const reference = nextReference("CON", count ?? 0);
    const timestamp = now();

    const { data: concernRow, error: concernError } = await supabase
      .from("concerns")
      .insert({
        reference,
        resident_id: input.resident.id,
        category: input.category,
        title: input.title,
        description: input.description,
        location_text: input.locationText,
        latitude: input.latitude,
        longitude: input.longitude,
        urgency: input.urgency,
        status: "submitted",
        submitted_at: timestamp,
        updated_at: timestamp,
      })
      .select()
      .single();

    if (concernError || !concernRow) {
      console.warn("Supabase createConcern error, falling back:", concernError?.message);
      return demoStore.createConcern(input);
    }

    // Insert initial status update
    await supabase.from("concern_updates").insert({
      concern_id: concernRow.id,
      status: "submitted",
      note: "Concern submitted and queued for review.",
      actor_id: input.resident.id,
      created_at: timestamp,
    });

    // Save attachments
    if (input.attachments && input.attachments.length > 0) {
      const attachmentInserts = input.attachments.map((att) => ({
        concern_id: concernRow.id,
        file_name: att.fileName,
        mime_type: att.mimeType,
        storage_path: att.dataUrl ?? `evidence/${att.fileName}`,
        created_at: att.createdAt || timestamp,
      }));
      await supabase.from("concern_attachments").insert(attachmentInserts);
    }

    return (await getConcern(reference)) ?? demoStore.createConcern(input);
  } catch (err) {
    console.warn("createConcern exception, falling back:", err);
    return demoStore.createConcern(input);
  }
}

export async function addConcernUpdate(
  concern: Concern,
  input: {
    status: ConcernStatus;
    note: string;
    actorName: string;
    actorId?: string;
    assignedTo?: string;
    actionTaken?: string;
    resolutionNotes?: string;
    completionEvidence?: Attachment;
  },
): Promise<ConcernUpdate> {
  if (!supabaseConfigured) {
    return demoStore.addConcernUpdate(concern, input);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const timestamp = now();

    const updateFields: Record<string, unknown> = {
      status: input.status,
      updated_at: timestamp,
    };
    if (input.assignedTo !== undefined) updateFields.assigned_to = input.assignedTo;
    if (input.actionTaken !== undefined) updateFields.action_taken = input.actionTaken;
    if (input.resolutionNotes !== undefined) updateFields.resolution_notes = input.resolutionNotes;
    if (input.status === "resolved") updateFields.resolved_at = timestamp;

    await supabase.from("concerns").update(updateFields).eq("id", concern.id);

    const { data: updateRow, error: updateError } = await supabase
      .from("concern_updates")
      .insert({
        concern_id: concern.id,
        status: input.status,
        note: input.note || `Status changed to ${statusLabels[input.status]}`,
        actor_id: input.actorId ?? null,
        created_at: timestamp,
      })
      .select()
      .single();

    if (input.completionEvidence) {
      await supabase.from("concern_attachments").insert({
        concern_id: concern.id,
        file_name: input.completionEvidence.fileName,
        mime_type: input.completionEvidence.mimeType,
        storage_path: input.completionEvidence.dataUrl ?? `completion/${input.completionEvidence.fileName}`,
        created_at: timestamp,
      });
    }

    if (updateError || !updateRow) {
      return demoStore.addConcernUpdate(concern, input);
    }

    return {
      id: updateRow.id,
      status: updateRow.status as ConcernStatus,
      note: updateRow.note,
      actorName: input.actorName,
      createdAt: updateRow.created_at,
    };
  } catch (err) {
    console.warn("addConcernUpdate exception, falling back:", err);
    return demoStore.addConcernUpdate(concern, input);
  }
}

export async function addImpactRecords(concern: Concern, recordedBy: string): Promise<void> {
  if (!supabaseConfigured) {
demoStore.addImpactRecords(concern, recordedBy);
  return;
}

const profile = await requireUser();

try {
    const supabase = await createSupabaseServerClient();
    const sdgCodes = sdgMappings[concern.category] ?? [];

    for (const sdgCode of sdgCodes) {
      await supabase.from("impact_records").insert({
        concern_id: concern.id,
        sdg_code: sdgCode,
        outcome: concern.actionTaken ?? "Completed action recorded",
        recorded_by: profile.id,
        created_at: now(),
      });
    }
  } catch (err) {
    console.warn("addImpactRecords exception, falling back:", err);
    demoStore.addImpactRecords(concern, recordedBy);
  }
}

export async function addAuditLog(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!supabaseConfigured) {
    demoStore.addAuditLog(input);
    return;
  }

  const profile = await requireUser();

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("audit_logs").insert({
      actor_id: profile.id,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      metadata: input.metadata ?? {},
      created_at: now(),
    });
  } catch (err) {
    console.warn("addAuditLog exception, falling back:", err);
    demoStore.addAuditLog(input);
  }
}

// ---------------------------------------------------------------------------
// Document Request Operations
// ---------------------------------------------------------------------------

export async function listDocuments(residentId?: string): Promise<DocumentRequest[]> {
  if (!supabaseConfigured) {
    return residentId
      ? demoStore.store.documentRequests.filter((r) => r.residentId === residentId)
      : demoStore.store.documentRequests;
  }

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("document_requests")
      .select(`
        *,
        document_types(name),
        profiles!document_requests_resident_id_fkey(full_name),
        document_updates(*)
      `)
      .order("submitted_at", { ascending: false });

    if (residentId) {
      query = query.eq("resident_id", residentId);
    }

    const { data, error } = await query;
    if (error || !data) {
      return residentId
        ? demoStore.store.documentRequests.filter((r) => r.residentId === residentId)
        : demoStore.store.documentRequests;
    }

    return (data as unknown as DbDocRequestRow[]).map(mapDocumentRow);
  } catch (err) {
    console.warn("listDocuments exception, falling back:", err);
    return residentId
      ? demoStore.store.documentRequests.filter((r) => r.residentId === residentId)
      : demoStore.store.documentRequests;
  }
}

export async function getDocument(reference: string): Promise<DocumentRequest | null> {
  if (!supabaseConfigured) {
    return demoStore.getDocument(reference) ?? null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("document_requests")
      .select(`
        *,
        document_types(name),
        profiles!document_requests_resident_id_fkey(full_name),
        document_updates(*)
      `)
      .ilike("reference", reference)
      .maybeSingle();

    if (error || !data) {
      return demoStore.getDocument(reference) ?? null;
    }

    return mapDocumentRow(data as unknown as DbDocRequestRow);
  } catch (err) {
    console.warn("getDocument exception, falling back:", err);
    return demoStore.getDocument(reference) ?? null;
  }
}

export async function createDocumentRequest(input: {
  resident: Profile;
  documentType: string;
  purpose: string;
}): Promise<DocumentRequest> {
  if (!supabaseConfigured) {
    return demoStore.createDocumentRequest(input);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase.from("document_requests").select("*", { count: "exact", head: true });
    const reference = nextReference("DOC", count ?? 0);
    const timestamp = now();

    // Look up document_type_id
    const { data: docType } = await supabase
      .from("document_types")
      .select("id")
      .ilike("name", input.documentType)
      .maybeSingle();

    const { data: requestRow, error: insertError } = await supabase
      .from("document_requests")
      .insert({
        reference,
        resident_id: input.resident.id,
        document_type_id: docType?.id ?? null,
        purpose: input.purpose,
        status: "submitted",
        issuing_organization: process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services",
        submitted_at: timestamp,
      })
      .select()
      .single();

    if (insertError || !requestRow) {
      console.warn("Supabase createDocumentRequest error, falling back:", insertError?.message);
      return demoStore.createDocumentRequest(input);
    }

    await supabase.from("document_updates").insert({
      request_id: requestRow.id,
      status: "submitted",
      note: "Request submitted.",
      actor_id: input.resident.id,
      created_at: timestamp,
    });

    return (await getDocument(reference)) ?? demoStore.createDocumentRequest(input);
  } catch (err) {
    console.warn("createDocumentRequest exception, falling back:", err);
    return demoStore.createDocumentRequest(input);
  }
}

export async function updateDocumentStatus(
  request: DocumentRequest,
  status: DocumentStatus,
  note: string,
  actorId?: string,
): Promise<DocumentRequest> {
  if (!supabaseConfigured) {
    return demoStore.updateDocumentStatus(request, status, note);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const timestamp = now();
    const updates: Record<string, unknown> = { status };
    if (status === "ready" || status === "released") {
      updates.issue_date = timestamp;
    }

    await supabase.from("document_requests").update(updates).eq("id", request.id);

    await supabase.from("document_updates").insert({
      request_id: request.id,
      status,
      note,
      actor_id: actorId ?? null,
      created_at: timestamp,
    });

    return (await getDocument(request.reference)) ?? demoStore.updateDocumentStatus(request, status, note);
  } catch (err) {
    console.warn("updateDocumentStatus exception, falling back:", err);
    return demoStore.updateDocumentStatus(request, status, note);
  }
}

export async function publicDocumentVerification(reference: string) {
  if (!supabaseConfigured) {
    return demoStore.publicDocumentVerification(reference);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("document_requests")
      .select(`
        reference,
        issue_date,
        issuing_organization,
        status,
        document_types(name)
      `)
      .ilike("reference", reference)
      .in("status", ["ready", "released"])
      .maybeSingle();

    if (error || !data) {
      return demoStore.publicDocumentVerification(reference);
    }

    return {
      valid: true,
      reference: data.reference,
      documentType: (data.document_types as { name?: string } | null)?.name ?? "Official Document",
      issueDate: data.issue_date ?? undefined,
      issuingOrganization: data.issuing_organization ?? (process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services"),
    };
  } catch (err) {
    console.warn("publicDocumentVerification exception, falling back:", err);
    return demoStore.publicDocumentVerification(reference);
  }
}

// ---------------------------------------------------------------------------
// Announcements Operations
// ---------------------------------------------------------------------------

export async function listAnnouncements(): Promise<Announcement[]> {
  if (!supabaseConfigured) {
    return demoStore.store.announcements;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("published_at", { ascending: false });

    if (error || !data) {
      return demoStore.store.announcements;
    }

    return data.map((a) => ({
      id: a.id,
      priority: a.priority ?? "standard",
      title: a.title,
      excerpt: a.excerpt,
      publishedAt: a.published_at,
      type: a.type ?? "announcement",
      status: a.status ?? "published",
    }));
  } catch (err) {
    console.warn("listAnnouncements exception, falling back:", err);
    return demoStore.store.announcements;
  }
}

export async function createAnnouncement(input: {
  priority: string;
  title: string;
  excerpt: string;
  type?: string;
  status?: string;
}): Promise<Announcement> {
  if (!supabaseConfigured) {
    const announcement: Announcement = {
      id: `announcement-${crypto.randomUUID()}`,
      priority: input.priority as "standard" | "high",
      title: input.title,
      excerpt: input.excerpt,
      publishedAt: now(),
      type: (input.type ?? "announcement") as Announcement["type"],
      status: (input.status ?? "published") as Announcement["status"],
    };
    demoStore.store.announcements.unshift(announcement);
    return announcement;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const timestamp = now();
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        priority: input.priority,
        title: input.title,
        excerpt: input.excerpt,
        type: input.type ?? "announcement",
        status: input.status ?? "published",
        published_at: timestamp,
      })
      .select()
      .single();

    if (error || !data) {
      return (await listAnnouncements())[0];
    }

    return {
      id: data.id,
      priority: data.priority,
      title: data.title,
      excerpt: data.excerpt,
      publishedAt: data.published_at,
      type: data.type,
      status: data.status,
    };
  } catch (err) {
    console.warn("createAnnouncement exception, falling back:", err);
    const fallback: Announcement = {
      id: `announcement-${crypto.randomUUID()}`,
      priority: input.priority as "standard" | "high",
      title: input.title,
      excerpt: input.excerpt,
      publishedAt: now(),
    };
    demoStore.store.announcements.unshift(fallback);
    return fallback;
  }
}

export async function updateAnnouncement(id: string, status: string): Promise<Announcement | null> {
  if (!supabaseConfigured) {
    const announcement = demoStore.store.announcements.find((item) => item.id === id);
    if (!announcement) return null;
    announcement.status = status as Announcement["status"];
    if (announcement.status === "published") announcement.publishedAt = now();
    return announcement;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const updates: Record<string, unknown> = { status };
    if (status === "published") updates.published_at = now();
    const { data, error } = await supabase.from("announcements").update(updates).eq("id", id).select().single();
    if (error || !data) return null;
    return {
      id: data.id,
      priority: data.priority,
      title: data.title,
      excerpt: data.excerpt,
      publishedAt: data.published_at,
      type: data.type,
      status: data.status,
    };
  } catch {
    return null;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  if (!supabaseConfigured) {
    const idx = demoStore.store.announcements.findIndex((a) => a.id === id);
    if (idx >= 0) {
      demoStore.store.announcements.splice(idx, 1);
      return true;
    }
    return false;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Emergency Contacts Operations
// ---------------------------------------------------------------------------

export async function listEmergencyContacts(): Promise<EmergencyContact[]> {
  if (!supabaseConfigured) {
    return demoStore.store.emergencyContacts;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("active", true)
      .order("label", { ascending: true });

    if (error || !data) {
      return demoStore.store.emergencyContacts;
    }

    return data.map((c) => ({
      id: c.id,
      label: c.label,
      number: c.number,
      description: c.description,
      category: c.category ?? "other",
    }));
  } catch (err) {
    console.warn("listEmergencyContacts exception, falling back:", err);
    return demoStore.store.emergencyContacts;
  }
}

export async function createEmergencyContact(input: {
  label: string;
  number: string;
  description: string;
  category?: string;
}): Promise<EmergencyContact> {
  if (!supabaseConfigured) {
    const contact: EmergencyContact = {
      id: `emergency-${crypto.randomUUID()}`,
      label: input.label,
      number: input.number,
      description: input.description,
      category: (input.category ?? "other") as EmergencyContact["category"],
    };
    demoStore.store.emergencyContacts.push(contact);
    return contact;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("emergency_contacts")
      .insert({
        label: input.label,
        number: input.number,
        description: input.description,
        category: input.category ?? "other",
        active: true,
      })
      .select()
      .single();

    if (error || !data) {
      return (await listEmergencyContacts())[0];
    }

    return {
      id: data.id,
      label: data.label,
      number: data.number,
      description: data.description,
      category: data.category,
    };
  } catch (err) {
    console.warn("createEmergencyContact exception, falling back:", err);
    const fallback: EmergencyContact = {
      id: `emergency-${crypto.randomUUID()}`,
      label: input.label,
      number: input.number,
      description: input.description,
    };
    demoStore.store.emergencyContacts.push(fallback);
    return fallback;
  }
}

export async function deleteEmergencyContact(id: string): Promise<boolean> {
  if (!supabaseConfigured) {
    const idx = demoStore.store.emergencyContacts.findIndex((c) => c.id === id);
    if (idx >= 0) {
      demoStore.store.emergencyContacts.splice(idx, 1);
      return true;
    }
    return false;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Impact & Audit Operations
// ---------------------------------------------------------------------------

export async function listAuditLogs() {
  if (!supabaseConfigured) {
    return demoStore.store.auditLogs;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) {
      return demoStore.store.auditLogs;
    }

    return data.map((log) => ({
      id: log.id,
      actorId: log.actor_id ?? "",
      action: log.action,
      entityType: log.entity_type,
      entityId: String(log.entity_id ?? ""),
      metadata: (log.metadata ?? {}) as Record<string, unknown>,
      createdAt: log.created_at,
    }));
  } catch {
    return demoStore.store.auditLogs;
  }
}

export async function impactSnapshot(): Promise<ImpactSnapshot> {
  const [concerns, documents] = await Promise.all([listConcerns(), listDocuments()]);

  const resolved = concerns.filter((c) => c.status === "resolved" && c.resolvedAt);
  const totalResolutionHours = resolved.reduce((sum, c) => {
    return sum + (new Date(c.resolvedAt as string).getTime() - new Date(c.submittedAt).getTime()) / 3_600_000;
  }, 0);

  const concernsByCategory = Object.fromEntries(
    Object.keys(categoryLabels).map((cat) => [cat, concerns.filter((c) => c.category === cat).length]),
  );

  const completedWithAction = resolved.filter((c) => Boolean(c.actionTaken)).length;
  const count = (category: ConcernCategory) => resolved.filter((c) => c.category === category).length;

  return {
    concernsReceived: concerns.length,
    concernsResolved: resolved.length,
    resolutionRate: concerns.length ? Math.round((resolved.length / concerns.length) * 100) : 0,
    averageResolutionHours: resolved.length ? Math.round((totalResolutionHours / resolved.length) * 10) / 10 : null,
    documentsProcessed: documents.filter((req) => ["processing", "ready", "released"].includes(req.status)).length,
    concernsByCategory,
    sdg11: [
      { label: "Resolved community concerns", value: resolved.length, detail: "Completed records only" },
      { label: "Infrastructure issues addressed", value: count("roads_infrastructure"), detail: "Resolved road and infrastructure records" },
      { label: "Waste issues addressed", value: count("waste_management"), detail: "Resolved waste records" },
      { label: "Water & sanitation addressed", value: count("water_sanitation"), detail: "Resolved water and sanitation records" },
      {
        label: "Safety and environment addressed",
        value: count("public_safety") + count("environment") + count("disaster_emergency"),
        detail: "Resolved safety, environment, and disaster records",
      },
    ],
    sdg16: [
      { label: "Resolution rate", value: `${Math.round((resolved.length / Math.max(concerns.length, 1)) * 100)}%`, detail: "Resolved concerns divided by submitted concerns" },
      { label: "Average response time", value: "Recorded on timeline", detail: "Per-transition timestamps are retained" },
      { label: "Average resolution time", value: resolved.length ? `${Math.round(totalResolutionHours / resolved.length)}h` : "No resolved records", detail: "From submission to resolution" },
      { label: "Completed public services", value: documents.filter((req) => req.status === "released").length, detail: "Released document requests" },
      { label: "Resolved with documented action", value: completedWithAction, detail: "Resolved records with an action_taken value" },
      { label: "Auditability", value: `${concerns.reduce((sum, c) => sum + c.updates.length, 0)} updates`, detail: "Timestamped concern updates" },
    ],
    generatedAt: now(),
  };
}

export async function getProfilesStats(): Promise<{ residents: number; admins: number }> {
  if (!supabaseConfigured) {
    return {
      residents: demoStore.store.profiles.filter((p) => p.role === "resident").length,
      admins: demoStore.store.profiles.filter((p) => p.role === "admin").length,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { count: residentCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "resident");
    const { count: adminCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin");
    return {
      residents: residentCount ?? 0,
      admins: adminCount ?? 0,
    };
  } catch {
    return {
      residents: demoStore.store.profiles.filter((p) => p.role === "resident").length,
      admins: demoStore.store.profiles.filter((p) => p.role === "admin").length,
    };
  }
}
