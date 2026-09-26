import { Settings } from "lucide-react";
import { getProfilesStats } from "@/lib/data-store";

export default async function AdminSettingsPage() {
  const stats = await getProfilesStats();
  return <main className="page-main"><div className="page-header"><div><p className="eyebrow">Organization settings</p><h1>Workspace configuration</h1><p>Review the active organization context used by resident-facing workflows.</p></div><Settings color="var(--teal)" /></div><div className="card card-pad form-card"><div className="form-stack"><div className="field"><label htmlFor="orgName">Organization name</label><input id="orgName" defaultValue={process.env.NEXT_PUBLIC_ORGANIZATION_NAME ?? "ONE Community Services"} readOnly /></div><div className="field"><label htmlFor="region">Region label</label><input id="region" defaultValue={process.env.NEXT_PUBLIC_ORGANIZATION_REGION ?? "Your community"} readOnly /></div><div className="notice"><Settings size={16} />This local build keeps organization settings read-only until the Supabase-backed organization mutation is enabled.</div><p className="muted small">Resident profiles: {stats.residents} · Admin profiles: {stats.admins}</p></div></div></main>;
}
