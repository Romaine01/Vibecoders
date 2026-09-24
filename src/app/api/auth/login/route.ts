import { NextResponse } from "next/server";
import { authenticateResident, demoCredentials, getProfileByEmail } from "@/lib/demo-store";
import { sessionCookieName } from "@/lib/auth";
import { createDemoSession } from "@/lib/demo-session";
import { createSupabaseServerClient, supabaseConfigured } from "@/lib/supabase/server";
import { getSupabaseProfile } from "@/lib/supabase/profile";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = body.role === "admin" ? "admin" : "resident";

  if (!email || password.length < 4) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  if (supabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    const profile = await getSupabaseProfile(supabase, data.user);
    if (!profile) return NextResponse.json({ error: "Your account profile is not ready. Contact the service desk." }, { status: 403 });
    if (profile.role !== role) return NextResponse.json({ error: "This account is not available in the selected workspace." }, { status: 403 });
    return NextResponse.json({ user: profile });
  }
  if (role === "admin" && (email !== demoCredentials.adminEmail || password !== demoCredentials.adminPassword)) {
    return NextResponse.json({ error: "Admin credentials are not valid." }, { status: 401 });
  }
  if (role === "resident" && email === demoCredentials.adminEmail) {
    return NextResponse.json({ error: "Use the admin sign-in for this account." }, { status: 403 });
  }

  const profile = role === "admin"
    ? getProfileByEmail(email)
    : authenticateResident(email, password);
  if (role === "resident" && !profile) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  if (!profile || profile.role !== role) return NextResponse.json({ error: "This account is not available in the selected workspace." }, { status: 403 });

  const response = NextResponse.json({ user: profile });
  response.cookies.set(sessionCookieName, createDemoSession(profile), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
