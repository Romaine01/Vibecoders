import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/demo-store";

export async function GET() {
  return NextResponse.json({ announcements: store.announcements });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (!body.title || !body.excerpt) return NextResponse.json({ error: "Title and excerpt are required." }, { status: 400 });
  const announcement = { id: crypto.randomUUID(), priority: body.priority === "high" ? "high" as const : "standard" as const, title: String(body.title), excerpt: String(body.excerpt), publishedAt: new Date().toISOString() };
  store.announcements.unshift(announcement);
  return NextResponse.json({ announcement }, { status: 201 });
}
