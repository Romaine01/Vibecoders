import { NextResponse } from "next/server";
import { createSession, demoCredentials, getProfileByEmail, upsertResident } from "@/lib/demo-store";
import { sessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = body.role === "admin" ? "admin" : "resident";

  if (!email || password.length < 4) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  if (role === "admin" && (email !== demoCredentials.adminEmail || password !== demoCredentials.adminPassword)) {
    return NextResponse.json({ error: "Admin credentials are not valid." }, { status: 401 });
  }
  if (role === "resident" && email === demoCredentials.adminEmail) {
    return NextResponse.json({ error: "Use the admin sign-in for this account." }, { status: 403 });
  }

  const profile = role === "admin"
    ? getProfileByEmail(email)
    : upsertResident(email, String(body.fullName ?? email.split("@")[0]).trim() || "Community resident");
  if (!profile || profile.role !== role) return NextResponse.json({ error: "This account is not available in the selected workspace." }, { status: 403 });

  const response = NextResponse.json({ user: profile });
  response.cookies.set(sessionCookieName, createSession(profile), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
