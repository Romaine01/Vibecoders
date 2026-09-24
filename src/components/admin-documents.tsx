"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import type { DocumentRequest, DocumentStatus } from "@/lib/types";
import { documentStatusLabels, documentStatuses } from "@/lib/types";
import { nextDocumentStatuses } from "@/lib/document-catalog";
import { DocumentStatusBadge } from "@/components/ui";

const filterLabels: { id: "all" | DocumentStatus; label: string }[] = [
  { id: "all", label: "All" },
  ...documentStatuses.map((status) => ({
    id: status as "all" | DocumentStatus,
    label: documentStatusLabels[status],
  })),
];

export function AdminDocuments() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DocumentStatus>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/documents", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        if (result.requests) setRequests(result.requests);
        else setError(result.error ?? "Unable to load requests.");
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load requests.");
        setLoading(false);
      });
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter !== "all" && request.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        request.reference.toLowerCase().includes(needle) ||
        request.residentName.toLowerCase().includes(needle) ||
        request.documentType.toLowerCase().includes(needle) ||
        request.purpose.toLowerCase().includes(needle)
      );
    });
  }, [requests, query, statusFilter]);

  const detail = requests.find((request) => request.reference === selected) ?? null;

  async function update(status: DocumentStatus, event?: FormEvent) {
    event?.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    setMessage("");
    const trimmed = note.trim();
    const body = {
      status,
      note: trimmed || `Request moved to ${documentStatusLabels[status]}.`,
    };
    try {
      const response = await fetch(`/api/documents/${selected}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "Unable to update status.");
      } else {
        setRequests((current) =>
          current.map((request) => (request.reference === selected ? result.document : request)),
        );
        setMessage(`${selected} is now ${documentStatusLabels[status]}.`);
        setNote("");
      }
    } catch {
      setError("Unable to update status.");
    }
    setBusy(false);
  }

  return (
    <div className="grid-2">
      <section className="card card-pad">
        <div className="card-head">
          <div>
            <h2>Document requests</h2>
            <p>Search, filter, and open a request to process it.</p>
          </div>
        </div>

        <div className="admin-doc-controls">
          <div className="field">
            <label htmlFor="doc-search">Search</label>
            <div className="search-box">
              <Search size={15} aria-hidden="true" />
              <input
                id="doc-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Reference, resident, type, or purpose"
              />
            </div>
          </div>
        </div>

        <div className="filter-chips" role="group" aria-label="Filter by status">
          {filterLabels.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip ${statusFilter === item.id ? "active" : ""}`}
              aria-pressed={statusFilter === item.id}
              onClick={() => setStatusFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && !detail && (
          <div className="notice error" role="alert">
            <X size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="empty-state" aria-busy="true">
            <p>Loading document requests…</p>
          </div>
        ) : visible.length ? (
          <div className="activity-list">
            {visible.map((request) => (
              <button
                type="button"
                className={`activity-row select-row ${selected === request.reference ? "selected" : ""}`}
                key={request.id}
                onClick={() => {
                  setSelected(request.reference);
                  setNote("");
                  setMessage("");
                  setError("");
                }}
                aria-pressed={selected === request.reference}
              >
                <div className="activity-row-main">
                  <strong>{request.documentType}</strong>
                  <small>
                    {request.reference} · {request.residentName} ·{" "}
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="activity-row-end">
                  <DocumentStatusBadge status={request.status} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No matching requests</h3>
            <p>Adjust the search or status filter to see more.</p>
          </div>
        )}
      </section>

      <section className="card card-pad">
        <div className="card-head">
          <div>
            <h2>Request detail</h2>
            <p>Review the application, add a note, and move the status.</p>
          </div>
        </div>

        {!detail ? (
          <div className="empty-state">
            <h3>Select a request</h3>
            <p>Choose a document request from the list to review and process it.</p>
          </div>
        ) : (
          <>
            {message && (
              <div className="notice success" role="status">
                <Check size={16} />
                {message}
              </div>
            )}
            {error && (
              <div className="notice error" role="alert">
                <X size={16} />
                {error}
              </div>
            )}

            <div className="detail-title" style={{ marginBottom: 8 }}>
              <div>
                <p className="eyebrow">{detail.reference}</p>
                <h3>{detail.documentType}</h3>
              </div>
              <DocumentStatusBadge status={detail.status} />
            </div>
            <dl className="review-block" style={{ marginBottom: 18 }}>
              <div className="review-row">
                <dt>Resident</dt>
                <dd>{detail.residentName}</dd>
              </div>
              <div className="review-row">
                <dt>Purpose</dt>
                <dd>{detail.purpose}</dd>
              </div>
              <div className="review-row">
                <dt>Submitted</dt>
                <dd>{new Date(detail.submittedAt).toLocaleString()}</dd>
              </div>
              {detail.issueDate && (
                <div className="review-row">
                  <dt>Issue date</dt>
                  <dd>{new Date(detail.issueDate).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>

            <div className="detail-section">
              <h3>Status history</h3>
              <div className="timeline">
                {detail.updates.map((update, index) => (
                  <div
                    className={`timeline-item ${index === detail.updates.length - 1 ? "current" : ""}`}
                    key={update.id}
                  >
                    <span className="timeline-dot" aria-hidden="true" />
                    <div className="timeline-content">
                      <strong>{documentStatusLabels[update.status]}</strong>
                      <p>{update.note}</p>
                      <small>{new Date(update.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form className="action-form" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="admin-note">Note for this transition</label>
              <textarea
                id="admin-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note shown in the status history"
                maxLength={500}
              />
            </form>

            <div className="admin-action-stack" style={{ marginTop: 12 }}>
              {nextDocumentStatuses(detail.status).map((status) => (
                <button
                  key={status}
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => update(status)}
                >
                  Move to {documentStatusLabels[status]}
                </button>
              ))}
              {["submitted", "under_review", "processing"].includes(detail.status) && (
                <button
                  type="button"
                  className="button danger"
                  disabled={busy}
                  onClick={() => update("rejected")}
                >
                  Reject request
                </button>
              )}
              {nextDocumentStatuses(detail.status).length === 0 &&
                detail.status !== "rejected" && (
                  <p className="muted small">
                    This request is {documentStatusLabels[detail.status].toLowerCase()} — no
                    further transitions.
                  </p>
                )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
