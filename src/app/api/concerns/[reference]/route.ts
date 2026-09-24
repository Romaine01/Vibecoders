import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getConcern } from "@/lib/demo-store";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const user = await requireUser();
    const { reference } = await params;
    const concern = getConcern(reference);
    if (!concern || (user.role === "resident" && concern.residentId !== user.id)) return NextResponse.json({ error: "Concern not found." }, { status: 404 });
    return NextResponse.json({ concern });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}
