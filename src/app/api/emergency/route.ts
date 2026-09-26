import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createEmergencyContact, listEmergencyContacts } from "@/lib/data-store";
import { emergencyCategories } from "@/lib/types";

export async function GET() {
  const contacts = await listEmergencyContacts();
  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (!body.label || !body.number || !body.description) return NextResponse.json({ error: "Label, number, and description are required." }, { status: 400 });
  const category = emergencyCategories.includes(body.category) ? body.category : "other";
  const contact = await createEmergencyContact({
    label: String(body.label),
    number: String(body.number),
    description: String(body.description),
    category,
  });
  return NextResponse.json({ contact }, { status: 201 });
}
