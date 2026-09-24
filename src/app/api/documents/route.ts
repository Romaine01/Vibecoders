import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { allowedDocumentTypes, createDocumentRequest, store } from "@/lib/demo-store";
import { documentSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ requests: user.role === "admin" ? store.documentRequests : store.documentRequests.filter((request) => request.residentId === user.id), documentTypes: allowedDocumentTypes });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser("resident");
    const parsed = documentSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success || !allowedDocumentTypes.includes(parsed.data.documentType)) return NextResponse.json({ error: "Choose a valid document type and purpose." }, { status: 400 });
    return NextResponse.json({ request: createDocumentRequest({ resident: user, ...parsed.data }) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit document request.";
    return NextResponse.json({ error: message === "AUTH_REQUIRED" ? "Sign in required." : message }, { status: 401 });
  }
}
