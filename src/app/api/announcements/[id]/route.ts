import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/demo-store";
import { announcementStatuses } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  const announcement = store.announcements.find((item) => item.id === id);
  if (!announcement)
    return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  if (!announcementStatuses.includes(body.status))
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  announcement.status = body.status;
  if (announcement.status === "published") announcement.publishedAt = new Date().toISOString();
  return NextResponse.json({ announcement });
}
