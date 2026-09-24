import { NextResponse } from "next/server";
import { createSession, createResident, getProfileByEmail } from "@/lib/demo-store";
import { sessionCookieName } from "@/lib/auth";
import { registrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Check your details, matching password, and policy agreement." }, { status: 400 });

  const input = { ...parsed.data, email: parsed.data.email.toLowerCase() };
  if (getProfileByEmail(input.email)) return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });

  const profile = createResident(input);
  const response = NextResponse.json({ user: profile }, { status: 201 });
  response.cookies.set(sessionCookieName, createSession(profile), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
