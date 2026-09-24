import Link from "next/link";
import { ArrowLeft, FileCheck2, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDocument } from "@/lib/demo-store";
import { documentStatusLabels } from "@/lib/types";

function documentStatusClass(status: string) {
  if (status === "released") return "resolved";
  if (status === "rejected") return "rejected";
  return status;
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const [user, { reference }] = await Promise.all([getCurrentUser(), params]);
  const request = getDocument(reference);
  if (!user || user.role !== "resident" || !request || request.residentId !== user.id) notFound();

  return (
    <main className="page-main">
      <Link className="back-link" href="/app/activity"><ArrowLeft size={16} /> Back to activity</Link>
      <div className="detail-layout">
        <section className="card card-pad">
          <div className="detail-title"><div><p className="eyebrow">Document request</p><h1>{request.documentType}</h1><div className="detail-meta"><span>{request.reference}</span><span>Submitted {new Date(request.submittedAt).toLocaleString()}</span></div></div><span className={`status-badge ${documentStatusClass(request.status)}`}>{documentStatusLabels[request.status]}</span></div>
          <section className="detail-section"><h2>Purpose</h2><p className="detail-copy">{request.purpose}</p></section>
          <section className="detail-section"><h2>Request timeline</h2><div className="timeline">{request.updates.map((update, index) => <div className={`timeline-item ${index === request.updates.length - 1 ? "current" : ""}`} key={update.id}><span className="timeline-dot" /><div className="timeline-content"><strong>{documentStatusLabels[update.status]}</strong><p>{update.note}</p><small>{new Date(update.createdAt).toLocaleString()}</small></div></div>)}</div></section>
        </section>
        <aside className="card card-pad detail-aside"><FileText size={22} color="var(--teal)" /><h2>Request details</h2><dl className="review-block"><div className="review-row"><dt>Reference</dt><dd>{request.reference}</dd></div><div className="review-row"><dt>Issuing organization</dt><dd>{request.issuingOrganization}</dd></div>{request.issueDate && <div className="review-row"><dt>Issue date</dt><dd>{new Date(request.issueDate).toLocaleDateString()}</dd></div>}</dl>{request.status === "released" && <Link className="button secondary full-width" href={`/verify/${request.reference}`} target="_blank"><FileCheck2 size={16} /> Verify document</Link>}</aside>
      </div>
    </main>
  );
}
