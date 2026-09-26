import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateAnnouncement } from "@/lib/data-store";
import { announcementStatuses } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!announcementStatuses.includes(body.status))
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  const announcement = await updateAnnouncement(id, body.status);
  if (!announcement)
    return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
  return NextResponse.json({ announcement });
}
