import Link from "next/link";
import { ClipboardList, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listConcerns, store } from "@/lib/demo-store";
import { ActivityFeed } from "@/components/activity-feed";

export default async function ActivityPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "resident") return null;

  const concerns = listConcerns(user.id);
  const documents = store.documentRequests.filter(
    (request) => request.residentId === user.id,
  );

  return (
    <main className="page-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">My activity</p>
          <h1>Your service records</h1>
          <p>Track every concern and document request using its reference number and live status.</p>
        </div>
        <div className="page-header-actions">
          <Link className="button primary" href="/app/report">
            <ClipboardList size={16} /> New concern
          </Link>
          <Link className="button secondary" href="/app/documents">
            <FileText size={16} /> Request document
          </Link>
        </div>
      </div>
      <ActivityFeed concerns={concerns} documents={documents} />
    </main>
  );
}
