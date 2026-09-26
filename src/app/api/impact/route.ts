import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { impactSnapshot, listAuditLogs, store } from "@/lib/data-store";

export async function GET() {
  try {
    await requireUser("admin");
    const [snapshot, auditLogs] = await Promise.all([impactSnapshot(), listAuditLogs()]);
    return NextResponse.json({ impact: snapshot, auditLogs: auditLogs.slice(0, 30), impactRecords: store.impactRecords.slice(0, 30) });
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
}
