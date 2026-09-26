import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function createSupabaseServerClient() {
  if (!supabaseConfigured) throw new Error("Supabase is not configured. The app is running in explicit local demo mode.");
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server Components may not allow mutation. Route handlers can refresh the session. */ }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
