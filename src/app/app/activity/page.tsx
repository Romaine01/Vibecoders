import Link from "next/link";
import { ArrowUpRight, ClipboardList, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listConcerns, store } from "@/lib/demo-store";
import { documentStatusLabels } from "@/lib/types";
import { ActivityRow } from "@/components/ui";

function documentStatusClass(status: string) {
  if (status === "released") return "resolved";
  if (status === "rejected") return "rejected";
  return status;
}

export default async function ActivityPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "resident") return null;

  const concerns = listConcerns(user.id);
  const documents = store.documentRequests.filter((request) => request.residentId === user.id);

  return (
    <main className="page-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">My activity</p>
          <h1>Your service records</h1>
          <p>Track every concern and document request using its reference number and live status.</p>
        </div>
        <div className="page-header-actions"><Link className="button primary" href="/app/report"><ClipboardList size={16} /> New concern</Link><Link className="button secondary" href="/app/documents"><FileText size={16} /> Request document</Link></div>
      </div>

      <div className="activity-sections">
        <section className="card card-pad">
          <div className="card-head"><div><h2>Concerns</h2><p>Your submitted reports and their service timelines.</p></div><ClipboardList size={18} color="var(--teal)" /></div>
          {concerns.length ? <div className="activity-list">{concerns.map((concern) => <ActivityRow key={concern.id} concern={concern} />)}</div> : <div className="empty-state"><h3>No concerns yet</h3><p>Report a concern to create a trackable service record.</p><Link className="button secondary" href="/app/report">Report a concern</Link></div>}
        </section>

        <section className="card card-pad">
          <div className="card-head"><div><h2>Document requests</h2><p>Requests are visible only to your resident account and authorized staff.</p></div><FileText size={18} color="var(--teal)" /></div>
          {documents.length ? (
            <div className="activity-list">
              {documents.map((request) => (
                <Link className="activity-row" href={`/app/documents/${request.reference}`} key={request.id}>
                  <div className="activity-row-main"><strong>{request.documentType}</strong><small>{request.reference} · Document request · {new Date(request.submittedAt).toLocaleDateString()}</small></div>
                  <div className="activity-row-end"><span className={`status-badge ${documentStatusClass(request.status)}`}>{documentStatusLabels[request.status]}</span><span className="row-detail-link">View details <ArrowUpRight size={15} /></span></div>
                </Link>
              ))}
            </div>
          ) : <div className="empty-state"><h3>No document requests yet</h3><p>Request a document to create a trackable service record.</p><Link className="button secondary" href="/app/documents">Request a document</Link></div>}
        </section>
      </div>
    </main>
  );
}
