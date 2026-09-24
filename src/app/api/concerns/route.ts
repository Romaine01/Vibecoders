import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createConcern, listConcerns } from "@/lib/demo-store";
import { concernSchema } from "@/lib/validation";
import type { Attachment } from "@/lib/types";

async function attachmentsFromForm(formData: FormData, field: string) {
  const attachments: Attachment[] = [];
  const values = formData.getAll(field);
  for (const value of values) {
    if (!(value instanceof File) || value.size === 0) continue;
    if (!value.type.startsWith("image/") || value.size > 5 * 1024 * 1024) throw new Error("Evidence must be an image smaller than 5 MB.");
    const bytes = Buffer.from(await value.arrayBuffer()).toString("base64");
    attachments.push({ id: crypto.randomUUID(), fileName: value.name, mimeType: value.type, dataUrl: `data:${value.type};base64,${bytes}`, createdAt: new Date().toISOString() });
  }
  return attachments;
}

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ concerns: listConcerns(user.role === "resident" ? user.id : undefined) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message === "FORBIDDEN" ? "Forbidden" : "Sign in required." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser("resident");
    const formData = await request.formData();
    const parsed = concernSchema.safeParse({
      category: formData.get("category"),
      title: formData.get("title"),
      description: formData.get("description"),
      locationText: formData.get("locationText"),
      latitude: formData.get("latitude") || undefined,
      longitude: formData.get("longitude") || undefined,
      urgency: formData.get("urgency") ?? "normal",
    });
    if (!parsed.success) return NextResponse.json({ error: "Check the required concern details.", issues: parsed.error.flatten() }, { status: 400 });
    const attachments = await attachmentsFromForm(formData, "evidence");
    const concern = createConcern({ resident: user, ...parsed.data, attachments });
    return NextResponse.json({ concern }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit concern.";
    const status = message === "AUTH_REQUIRED" || message === "FORBIDDEN" ? 401 : 400;
    return NextResponse.json({ error: message === "AUTH_REQUIRED" ? "Sign in required." : message }, { status });
  }
}
