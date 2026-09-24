import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { impactSnapshot, store } from "@/lib/demo-store";

export async function GET() {
  try {
    await requireUser("admin");
    return NextResponse.json({ impact: impactSnapshot(), auditLogs: store.auditLogs.slice(0, 30), impactRecords: store.impactRecords.slice(0, 30) });
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
}
