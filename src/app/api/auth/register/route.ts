import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createResident, getProfileByEmail } from "@/lib/demo-store";
import { sessionCookieName } from "@/lib/auth";
import { createDemoAccount, createDemoSession, demoAccountCookieName, getDemoAccount } from "@/lib/demo-session";
import { registrationSchema } from "@/lib/validation";
import { createSupabaseServerClient, supabaseConfigured } from "@/lib/supabase/server";
import { getSupabaseProfile } from "@/lib/supabase/profile";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Check your details, matching password, and policy agreement." }, { status: 400 });

  const input = { ...parsed.data, email: parsed.data.email.toLowerCase() };
  if (supabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { full_name: `${input.firstName} ${input.lastName}`, phone: input.mobileNumber, address: input.address } },
    });
    if (error || !data.user) {
      const duplicate = error?.message.toLowerCase().includes("already") || error?.message.toLowerCase().includes("registered");
      return NextResponse.json({ error: duplicate ? "An account with this email already exists. Sign in instead." : "Unable to create your account." }, { status: duplicate ? 409 : 400 });
    }
    const profile = data.session ? await getSupabaseProfile(supabase, data.user) : null;
    if (data.session && profile) {
      await supabase.from("profiles").update({ full_name: `${input.firstName} ${input.lastName}`, phone: input.mobileNumber, address: input.address }).eq("id", data.user.id);
      return NextResponse.json({ user: profile }, { status: 201 });
    }
    return NextResponse.json({ requiresEmailConfirmation: true, message: "Account created. Check your email to confirm your account before signing in." }, { status: 202 });
  }
  const cookieStore = await cookies();
  const existingAccount = getDemoAccount(cookieStore.get(demoAccountCookieName)?.value);
  if (getProfileByEmail(input.email) || existingAccount?.profile.email.toLowerCase() === input.email) {
    return NextResponse.json({ error: "An account with this email already exists. Sign in instead." }, { status: 409 });
  }

  const profile = createResident(input);
  const response = NextResponse.json({ user: profile }, { status: 201 });
  const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 };
  response.cookies.set(sessionCookieName, createDemoSession(profile), cookieOptions);
  response.cookies.set(demoAccountCookieName, createDemoAccount(profile, input.password), cookieOptions);
  return response;
}
