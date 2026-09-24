import { cookies } from "next/headers";
import { deleteSession, getSession } from "@/lib/demo-store";
import type { Profile, UserRole } from "@/lib/types";

export const sessionCookieName = "one_session";

export async function getCurrentUser(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value;
  return getSession(sessionId) ?? null;
}

export async function requireUser(role?: UserRole) {
  const user = await getCurrentUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  if (role && user.role !== role) throw new Error("FORBIDDEN");
  return user;
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookieName)?.value;
  deleteSession(sessionId);
  cookieStore.delete(sessionCookieName);
}
