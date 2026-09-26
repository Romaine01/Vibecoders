import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { addAuditLog, getDocument, updateDocumentStatus } from "@/lib/data-store";
import type { DocumentStatus } from "@/lib/types";

const allowed: Record<string, DocumentStatus[]> = {
  under_review: ["submitted"],
  processing: ["under_review"],
  ready: ["processing"],
  released: ["ready"],
  rejected: ["submitted", "under_review", "processing"],
};

export async function POST(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const admin = await requireUser("admin");
    const { reference } = await params;
    const document = await getDocument(reference);
    if (!document) return NextResponse.json({ error: "Document request not found." }, { status: 404 });
    const body = await request.json().catch(() => ({}));
    const status = String(body.status) as DocumentStatus;
    const note = String(body.note ?? "Status updated.");
    if (!allowed[status]?.includes(document.status)) return NextResponse.json({ error: "Invalid document status transition." }, { status: 409 });
    const updatedDocument = await updateDocumentStatus(document, status, note, admin.id);
    await addAuditLog({ actorId: admin.id, action: `document.${status}`, entityType: "document_request", entityId: document.id, metadata: { reference } });
    return NextResponse.json({ document: updatedDocument });
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
}
