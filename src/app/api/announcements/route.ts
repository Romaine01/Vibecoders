import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAnnouncement, listAnnouncements } from "@/lib/data-store";
import { announcementStatuses, announcementTypes } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");
  const allAnnouncements = await listAnnouncements();
  const announcements =
    scope === "published"
      ? allAnnouncements.filter((item) => !item.status || item.status === "published")
      : allAnnouncements;
  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (!body.title || !body.excerpt)
    return NextResponse.json({ error: "Title and excerpt are required." }, { status: 400 });
  const type = announcementTypes.includes(body.type) ? body.type : "announcement";
  const status = announcementStatuses.includes(body.status) ? body.status : "published";
  const announcement = await createAnnouncement({
    priority: body.priority === "high" ? "high" : "standard",
    title: String(body.title),
    excerpt: String(body.excerpt),
    type,
    status,
  });
  return NextResponse.json({ announcement }, { status: 201 });
}
