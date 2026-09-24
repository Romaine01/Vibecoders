import { NextResponse } from "next/server";
import { createSession, upsertResident } from "@/lib/demo-store";
import { sessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const fullName = String(body.fullName ?? "").trim();
  const password = String(body.password ?? "");
  if (!email.includes("@") || fullName.length < 2 || password.length < 4) {
    return NextResponse.json({ error: "Enter your name, a valid email, and a password of at least 4 characters." }, { status: 400 });
  }
  const profile = upsertResident(email, fullName);
  const response = NextResponse.json({ user: profile }, { status: 201 });
  response.cookies.set(sessionCookieName, createSession(profile), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
