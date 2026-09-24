import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDocument } from "@/lib/demo-store";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const user = await requireUser();
    const { reference } = await params;
    const document = getDocument(reference);
    if (!document || (user.role === "resident" && document.residentId !== user.id)) return NextResponse.json({ error: "Document request not found." }, { status: 404 });
    return NextResponse.json({ document });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}
