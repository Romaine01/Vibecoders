"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import type { DocumentRequest } from "@/lib/types";
import { documentStatusLabels } from "@/lib/types";
import { documentTypeDetail } from "@/lib/document-catalog";
import { DocumentStatusBadge } from "@/components/ui";

export function DocumentDetail({ reference }: { reference: string }) {
  const [document, setDocument] = useState<DocumentRequest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/documents/${reference}`, { cache: "no-store" })
      .then((response) => response.json().then((result) => ({ response, result })))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (!response.ok) {
          setError(result.error ?? "Document request not found.");
        } else {
          setDocument(result.document);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load this request. Check your connection and try again.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reference]);

  useEffect(() => {
    if (!document || document.status !== "released") return;
    const url = `${window.location.origin}/verify/${document.reference}`;
    QRCode.toDataURL(url, { margin: 1, width: 220 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [document]);

  if (loading) {
    return (
      <div className="card card-pad" aria-busy="true">
        <p className="muted">Loading document request…</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="card card-pad">
        <div className="notice error" role="alert">
          {error || "Document request not found."}
        </div>
        <p style={{ marginTop: 14 }}>
          <Link className="text-link small" href="/app/documents">
            <ArrowLeft size={14} style={{ verticalAlign: "middle" }} /> Back to documents
          </Link>
        </p>
      </div>
    );
  }

  const detail = documentTypeDetail(document.documentType);
  const isRejected = document.status === "rejected";
  const isReleased = document.status === "released";

  return (
    <div className="detail-layout">
      <div className="card card-pad">
        <div className="detail-title">
          <div>
            <p className="eyebrow">{document.reference}</p>
            <h2>{document.documentType}</h2>
            <div className="detail-meta">
              <span>Submitted {new Date(document.submittedAt).toLocaleString()}</span>
              <span>Applicant: {document.residentName}</span>
            </div>
          </div>
          <DocumentStatusBadge status={document.status} />
        </div>

        <div className="detail-section">
          <h3>Purpose</h3>
          <p className="muted" style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {document.purpose}
          </p>
        </div>

        <div className="detail-section">
          <h3>Requirements</h3>
          <p className="muted small">{detail.requirements.join(" · ")}</p>
        </div>

        {(document.issueDate || isReleased) && (
          <div className={`detail-section ${isReleased ? "success-banner" : ""}`}>
            {isReleased && <CheckCircle2 size={20} color="#13795b" aria-hidden="true" />}
            <h3>{isReleased ? "Released" : "Ready for release"}</h3>
            <p className="muted">
              {document.issueDate
                ? `Issued ${new Date(document.issueDate).toLocaleDateString()}`
                : "Awaiting release information."}
              {document.issuingOrganization ? ` · ${document.issuingOrganization}` : ""}
            </p>
          </div>
        )}

        <div className="detail-section">
          <h3>Status history</h3>
          <div className="timeline">
            {document.updates.map((update, index) => (
              <div
                className={`timeline-item ${index === document.updates.length - 1 ? "current" : ""}`}
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

        {isRejected && (
          <div className="notice error" role="alert">
            This request was rejected. Contact the service desk if you need to
            submit a new one.
          </div>
        )}
      </div>

      <div className="card card-pad">
        <div className="card-head">
          <div>
            <h3>Verification</h3>
            <p>Anyone can verify a released document with this reference.</p>
          </div>
          <ShieldCheck size={18} color="var(--teal)" aria-hidden="true" />
        </div>
        <div className="verify-mini">
          <span className="reference-code">{document.reference}</span>
          {qrDataUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- QR data URL is generated locally and must render without an optimizer. */}
              <img
                className="qr-image"
                src={qrDataUrl}
                alt={`QR code linking to verification for ${document.reference}`}
                width={160}
                height={160}
              />
              <p className="muted small" style={{ textAlign: "center" }}>
                Scan to open the public verification page.
              </p>
            </>
          ) : (
            <p className="muted small" style={{ textAlign: "center" }}>
              <QrCode size={14} style={{ verticalAlign: "middle" }} aria-hidden="true" /> A QR
              code appears here once the document is released.
            </p>
          )}
          <Link className="button secondary full-width" href={`/verify/${document.reference}`}>
            Open verification page
          </Link>
        </div>
        <div className="detail-section">
          <h3>What happens next</h3>
          <p className="muted small">
            {document.status === "submitted" &&
              "The service desk reviews your application, then moves it to processing."}
            {document.status === "under_review" &&
              "Your application is being verified. Processing follows review."}
            {document.status === "processing" &&
              "The document is being prepared. You will see it here when it is ready."}
            {document.status === "ready" &&
              "The document is ready. It can be released and verified publicly."}
            {document.status === "released" &&
              "The document has been released. Use the QR code or reference for verification."}
            {document.status === "rejected" &&
              "This request was not approved. Review the status history for details."}
          </p>
        </div>
        <p style={{ marginTop: 16 }}>
          <Link className="text-link small" href="/app/documents">
            <FileText size={14} style={{ verticalAlign: "middle" }} aria-hidden="true" /> All
            document requests
          </Link>
        </p>
      </div>
    </div>
  );
}
