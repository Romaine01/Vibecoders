import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { addAuditLog, addConcernUpdate, addImpactRecords, getConcern } from "@/lib/demo-store";
import { adminActionSchema } from "@/lib/validation";
import type { Attachment, ConcernStatus } from "@/lib/types";

const transitions: Record<string, ConcernStatus> = { receive: "received", assign: "assigned", start: "in_progress", resolve: "resolved", reject: "rejected" };

export async function POST(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const admin = await requireUser("admin");
    const { reference } = await params;
    const concern = getConcern(reference);
    if (!concern) return NextResponse.json({ error: "Concern not found." }, { status: 404 });
    const isJson = request.headers.get("content-type")?.includes("application/json");
    const jsonBody = isJson ? await request.json().catch(() => ({})) : null;
    const formData = isJson ? null : await request.formData();
    const read = (key: string) => isJson ? jsonBody?.[key] : formData?.get(key);
    const parsed = adminActionSchema.safeParse({ action: read("action"), note: read("note") ?? "", assignedTo: read("assignedTo") ?? undefined, actionTaken: read("actionTaken") ?? undefined, resolutionNotes: read("resolutionNotes") ?? undefined });
    if (!parsed.success) return NextResponse.json({ error: "Invalid workflow action." }, { status: 400 });
    const nextStatus = transitions[parsed.data.action];
    const allowed: Record<string, ConcernStatus[]> = { receive: ["submitted"], assign: ["received", "assigned"], start: ["assigned"], resolve: ["in_progress"], reject: ["submitted", "received", "assigned", "in_progress"] };
    if (!allowed[parsed.data.action].includes(concern.status)) return NextResponse.json({ error: `This concern is already ${concern.status.replaceAll("_", " ")}.` }, { status: 409 });
    if (parsed.data.action === "assign" && !parsed.data.assignedTo) return NextResponse.json({ error: "Add the responsible team or person before assigning." }, { status: 400 });
    if (parsed.data.action === "resolve" && (!parsed.data.actionTaken || !parsed.data.resolutionNotes)) return NextResponse.json({ error: "Resolution requires an action taken and resolution notes." }, { status: 400 });
    let completionEvidence: Attachment | undefined;
    const evidence = formData?.get("completionEvidence");
    if (evidence instanceof File && evidence.size > 0) {
      if (!evidence.type.startsWith("image/") || evidence.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Completion evidence must be an image smaller than 5 MB." }, { status: 400 });
      const bytes = Buffer.from(await evidence.arrayBuffer()).toString("base64");
      completionEvidence = { id: crypto.randomUUID(), fileName: evidence.name, mimeType: evidence.type, dataUrl: `data:${evidence.type};base64,${bytes}`, createdAt: new Date().toISOString() };
    }
    const note = parsed.data.note || (parsed.data.action === "assign" ? `Assigned to ${parsed.data.assignedTo}.` : `Status changed to ${nextStatus.replaceAll("_", " ")}.`);
    addConcernUpdate(concern, { status: nextStatus, note, actorName: admin.fullName, assignedTo: parsed.data.assignedTo, actionTaken: parsed.data.actionTaken, resolutionNotes: parsed.data.resolutionNotes, completionEvidence });
    addAuditLog({ actorId: admin.id, action: `concern.${parsed.data.action}`, entityType: "concern", entityId: concern.id, metadata: { reference: concern.reference, status: nextStatus } });
    if (nextStatus === "resolved") addImpactRecords(concern, admin.id);
    return NextResponse.json({ concern });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update concern.";
    return NextResponse.json({ error: message === "AUTH_REQUIRED" ? "Sign in required." : message === "FORBIDDEN" ? "Admin access required." : message }, { status: message === "FORBIDDEN" ? 403 : 401 });
  }
}
