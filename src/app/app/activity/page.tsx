import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listConcerns } from "@/lib/demo-store";
import { ActivityRow } from "@/components/ui";

export default async function ActivityPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "resident") return null;

  const concerns = listConcerns(user.id);

  return (
    <main className="page-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">My activity</p>
          <h1>Your service records</h1>
          <p>Every report has a reference, status, and timestamped timeline.</p>
        </div>
        <Link className="button primary" href="/app/report">
          <ClipboardList size={16} /> New concern
        </Link>
      </div>
      <div className="card card-pad">
        {concerns.length ? (
          <div className="activity-list">
            {concerns.map((concern) => <ActivityRow key={concern.id} concern={concern} />)}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No activity yet</h3>
            <p>Your submitted concerns will appear here.</p>
            <Link className="button secondary" href="/app/report">Report a concern</Link>
          </div>
        )}
      </div>
    </main>
  );
}
