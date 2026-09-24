import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function ResidentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");
  if (user.role !== "resident") redirect("/admin");
  return <AppShell user={user}>{children}</AppShell>;
}
