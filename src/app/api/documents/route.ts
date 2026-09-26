import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { allowedDocumentTypes, createDocumentRequest, listDocuments } from "@/lib/data-store";
import { documentSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser();
    const requests = await listDocuments(user.role === "resident" ? user.id : undefined);
    return NextResponse.json({ requests, documentTypes: allowedDocumentTypes });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser("resident");
    const parsed = documentSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success || !allowedDocumentTypes.includes(parsed.data.documentType)) return NextResponse.json({ error: "Choose a valid document type and purpose." }, { status: 400 });
    const newRequest = await createDocumentRequest({ resident: user, ...parsed.data });
    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit document request.";
    return NextResponse.json({ error: message === "AUTH_REQUIRED" ? "Sign in required." : message }, { status: 401 });
  }
}
