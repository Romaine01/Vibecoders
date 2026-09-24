import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { store } from "@/lib/demo-store";
import { profileSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser("resident");
    return NextResponse.json({ profile: user });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser("resident");
    const parsed = profileSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid name, phone, and address." },
        { status: 400 },
      );
    }
    const profile = store.profiles.find((item) => item.id === user.id);
    if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    profile.fullName = parsed.data.fullName;
    profile.phone = parsed.data.phone || undefined;
    profile.address = parsed.data.address || undefined;
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
}
