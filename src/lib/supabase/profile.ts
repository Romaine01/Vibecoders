import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/lib/types";

export function mapSupabaseProfile(row: Record<string, unknown>, user?: User): Profile {
  const metadata = user?.user_metadata ?? {};
  const fullName = String(row.full_name ?? metadata.full_name ?? user?.email?.split("@")[0] ?? "Resident");
  const role = row.role === "admin" ? "admin" : "resident";
  return {
    id: String(row.id ?? user?.id ?? ""),
    email: String(row.email ?? user?.email ?? ""),
    fullName,
    firstName: fullName.split(" ")[0],
    lastName: fullName.split(" ").slice(1).join(" "),
    phone: row.phone ? String(row.phone) : undefined,
    address: row.address ? String(row.address) : undefined,
    role: role as UserRole,
    organizationName: String(process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services"),
  };
}

export async function getSupabaseProfile(client: SupabaseClient, user: User): Promise<Profile | null> {
  const { data, error } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error || !data) return null;
  return mapSupabaseProfile(data, user);
}
