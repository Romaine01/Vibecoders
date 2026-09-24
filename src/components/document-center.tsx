"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Check, FileText, X } from "lucide-react";
import type { DocumentRequest, Profile } from "@/lib/types";
import { documentStatusLabels, documentTypes } from "@/lib/types";
import { documentTypeDetail } from "@/lib/document-catalog";
import { DocumentStatusBadge } from "@/components/ui";

const steps = ["Select", "Purpose", "Review", "Submitted"];

export function DocumentCenter() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step, setStep] = useState(0);
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedReference, setSubmittedReference] = useState("");

  const typeOptions = types.length ? types : documentTypes;
  const detail = documentTypeDetail(documentType);

  // Data loading is an external synchronization; the state update is intentionally async.
  useEffect(() => {
    Promise.all([
      fetch("/api/documents", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/auth/me", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([documents, me]) => {
      if (documents.requests) setRequests(documents.requests);
      if (Array.isArray(documents.documentTypes) && documents.documentTypes.length) {
        setTypes(documents.documentTypes);
        setDocumentType((current) => current || documents.documentTypes[0]);
      }
      if (me.user) setProfile(me.user);
    });
  }, []);

  function next() {
    setError("");
    if (step === 1 && purpose.trim().length < 5) {
      setError("Describe the purpose in at least 5 characters.");
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 2));
  }

  function back() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentType, purpose }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to submit document request.");
      return;
    }
    setRequests((current) => [result.request, ...current]);
    setSubmittedReference(result.request.reference);
    setStep(steps.length - 1);
    setMessage(`Request ${result.request.reference} submitted.`);
  }

  function reset() {
    setStep(0);
    setPurpose("");
    setSubmittedReference("");
    setMessage("");
    setError("");
  }

  return (
    <div className="grid-2">
      <section className="card card-pad">
        <div className="card-head">
          <div>
            <h2>New document request</h2>
            <p>Choose the document, state the purpose, review, and submit.</p>
          </div>
          <FileText size={18} color="var(--teal)" aria-hidden="true" />
        </div>

        {error && (
          <div className="notice error" role="alert">
            <X size={16} />
            {error}
          </div>
        )}
        {message && !submittedReference && (
          <div className="notice success" role="status">
            <Check size={16} />
            {message}
          </div>
        )}

        {submittedReference ? (
          <div className="success-banner">
            <Check size={20} color="#13795b" aria-hidden="true" />
            <h2>Request submitted</h2>
            <p className="muted">
              Keep this reference. You can follow every status change from My
              activity.
            </p>
            <span className="reference-code">{submittedReference}</span>
            <div className="hero-actions">
              <Link className="button primary" href={`/app/documents/${submittedReference}`}>
                Track this request
              </Link>
              <button className="button secondary" type="button" onClick={reset}>
                Request another
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="stepper" aria-label="Document request steps">
              {steps.slice(0, 3).map((label, index) => (
                <div key={label} style={{ display: "contents" }}>
                  <div
                    className={`step ${index === step ? "active" : index < step ? "done" : ""}`}
                    aria-current={index === step ? "step" : undefined}
                  >
                    <span className="step-number">
                      {index < step ? <Check size={13} /> : index + 1}
                    </span>
                    <span>{label}</span>
                  </div>
                  {index < 2 && <span className="step-line" aria-hidden="true" />}
                </div>
              ))}
            </div>

            <form className="form-stack" onSubmit={submit}>
              {step === 0 && (
                <>
                  <div className="field">
                    <label htmlFor="documentType">Document type</label>
                    <select
                      id="documentType"
                      value={documentType}
                      onChange={(event) => setDocumentType(event.target.value)}
                    >
                      {typeOptions.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="notice">
                    <FileText size={16} aria-hidden="true" />
                    <span>
                      <strong>{detail.description}</strong>
                      <br />
                      Requirements: {detail.requirements.join(" · ")}
                      <br />
                      {detail.processing}
                    </span>
                  </div>
                  <div className="form-actions">
                    <span />
                    <button className="button primary" type="button" onClick={next}>
                      Continue
                    </button>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <h3>What is this for?</h3>
                    <p className="muted small">
                      Staff confirm details during review — a clear purpose
                      speeds things up.
                    </p>
                  </div>
                  <div className="field">
                    <label htmlFor="purpose">Purpose</label>
                    <textarea
                      id="purpose"
                      value={purpose}
                      onChange={(event) => setPurpose(event.target.value)}
                      placeholder="e.g. Employment requirement for a job application"
                      required
                    />
                    <small>{purpose.trim().length}/500 characters</small>
                  </div>
                  <div className="form-actions">
                    <button className="button secondary" type="button" onClick={back}>
                      Back
                    </button>
                    <button className="button primary" type="button" onClick={next}>
                      Review
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <h3>Review your request</h3>
                    <p className="muted small">Confirm everything is correct before submitting.</p>
                  </div>
                  <dl className="review-block">
                    <div className="review-row">
                      <dt>Document type</dt>
                      <dd>{documentType}</dd>
                    </div>
                    <div className="review-row">
                      <dt>Purpose</dt>
                      <dd>{purpose}</dd>
                    </div>
                    <div className="review-row">
                      <dt>Applicant</dt>
                      <dd>{profile?.fullName ?? "—"}</dd>
                    </div>
                    <div className="review-row">
                      <dt>Address</dt>
                      <dd>{profile?.address || "Not set — add it in My profile"}</dd>
                    </div>
                    <div className="review-row">
                      <dt>Requirements</dt>
                      <dd>{detail.requirements.join(", ")}</dd>
                    </div>
                  </dl>
                  <div className="form-actions">
                    <button className="button secondary" type="button" onClick={back}>
                      Back
                    </button>
                    <button className="button primary" type="submit" disabled={loading}>
                      {loading ? "Submitting…" : "Submit request"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </>
        )}
      </section>

      <section className="card card-pad">
        <div className="card-head">
          <div>
            <h2>My requests</h2>
            <p>Open a request to see its full status history.</p>
          </div>
        </div>
        {requests.length ? (
          <div className="activity-list">
            {requests.map((request) => (
              <Link className="activity-row" key={request.id} href={`/app/documents/${request.reference}`}>
                <div className="activity-row-main">
                  <strong>{request.documentType}</strong>
                  <small>
                    {request.reference} · {new Date(request.submittedAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="activity-row-end">
                  <DocumentStatusBadge status={request.status} />
                  <ArrowUpRight size={16} color="#718399" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No requests yet</h3>
            <p>Your document requests and status changes will appear here.</p>
          </div>
        )}
        <p className="muted small" style={{ marginTop: 14 }}>
          Statuses: {Object.values(documentStatusLabels).join(" · ")}
        </p>
      </section>
    </div>
  );
}
