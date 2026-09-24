import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/demo-store";

export async function GET() {
  return NextResponse.json({ contacts: store.emergencyContacts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (!body.label || !body.number || !body.description) return NextResponse.json({ error: "Label, number, and description are required." }, { status: 400 });
  const contact = { id: crypto.randomUUID(), label: String(body.label), number: String(body.number), description: String(body.description) };
  store.emergencyContacts.push(contact);
  return NextResponse.json({ contact }, { status: 201 });
}
