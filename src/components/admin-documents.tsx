"use client";

import { useEffect, useState } from "react";
import type { DocumentRequest } from "@/lib/types";
import { documentStatusLabels } from "@/lib/types";

export function AdminDocuments() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]); const [error, setError] = useState("");
  async function load() { const response = await fetch("/api/documents", { cache: "no-store" }); const result = await response.json(); if (response.ok) setRequests(result.requests); else setError(result.error); }
  // Data loading is an external synchronization; the state update is intentionally async.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);
  async function update(reference: string, status: string) { const response = await fetch(`/api/documents/${reference}/actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, note: `Request moved to ${documentStatusLabels[status as keyof typeof documentStatusLabels]}.` }) }); const result = await response.json(); if (!response.ok) setError(result.error); else setRequests((current) => current.map((request) => request.reference === reference ? result.document : request)); }
  return <section className="card card-pad">{error && <div className="notice error">{error}</div>}{requests.length ? <div className="activity-list">{requests.map((request) => { const next = request.status === "submitted" ? "under_review" : request.status === "under_review" ? "processing" : request.status === "processing" ? "ready" : request.status === "ready" ? "released" : ""; return <div className="activity-row" key={request.id}><div className="activity-row-main"><strong>{request.documentType}</strong><small>{request.reference} · {request.residentName} · {request.purpose}</small></div><div className="activity-row-end"><span className={`status-badge ${request.status === "rejected" ? "rejected" : request.status === "released" ? "resolved" : "received"}`}>{documentStatusLabels[request.status]}</span>{next && <button className="button secondary" onClick={() => update(request.reference, next)}>Move to {documentStatusLabels[next]}</button>}</div></div>; })}</div> : <div className="empty-state"><h3>No document requests</h3><p>Resident requests will appear here once submitted.</p></div>}</section>;
}
