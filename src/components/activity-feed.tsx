"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Concern, DocumentRequest } from "@/lib/types";
import { categoryLabels, documentStatusLabels, statusLabels } from "@/lib/types";
import { DocumentStatusBadge, StatusBadge } from "@/components/ui";

type Filter = "all" | "concerns" | "documents" | "active" | "completed";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "concerns", label: "Concerns" },
  { id: "documents", label: "Documents" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

interface ActivityItem {
  key: string;
  kind: "concern" | "document";
  reference: string;
  title: string;
  subtitle: string;
  statusLabel: string;
  badge: React.ReactNode;
  date: string;
  href: string;
  active: boolean;
  completed: boolean;
}

function toItems(concerns: Concern[], documents: DocumentRequest[]): ActivityItem[] {
  const concernItems: ActivityItem[] = concerns.map((concern) => ({
    key: `concern-${concern.id}`,
    kind: "concern",
    reference: concern.reference,
    title: concern.title,
    subtitle: `${categoryLabels[concern.category]} · Concern`,
    statusLabel: statusLabels[concern.status],
    badge: <StatusBadge status={concern.status} urgent={concern.urgency === "urgent"} />,
    date: concern.submittedAt,
    href: `/app/concerns/${concern.reference}`,
    active: !["resolved", "rejected"].includes(concern.status),
    completed: concern.status === "resolved",
  }));
  const documentItems: ActivityItem[] = documents.map((request) => ({
    key: `document-${request.id}`,
    kind: "document",
    reference: request.reference,
    title: request.documentType,
    subtitle: `Purpose: ${request.purpose} · Document`,
    statusLabel: documentStatusLabels[request.status],
    badge: <DocumentStatusBadge status={request.status} />,
    date: request.submittedAt,
    href: `/app/documents/${request.reference}`,
    active: !["released", "rejected"].includes(request.status),
    completed: request.status === "released",
  }));
  return [...concernItems, ...documentItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function ActivityFeed({
  concerns,
  documents,
}: {
  concerns: Concern[];
  documents: DocumentRequest[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const items = toItems(concerns, documents);
  const visible = items.filter((item) => {
    if (filter === "concerns") return item.kind === "concern";
    if (filter === "documents") return item.kind === "document";
    if (filter === "active") return item.active;
    if (filter === "completed") return item.completed;
    return true;
  });

  return (
    <div className="card card-pad">
      <div className="filter-chips" role="group" aria-label="Filter activity">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip ${filter === item.id ? "active" : ""}`}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="activity-list">
          {visible.map((item) => (
            <Link className="activity-row" href={item.href} key={item.key}>
              <div className="activity-row-main">
                <strong>{item.title}</strong>
                <small>
                  {item.reference} · {item.subtitle} ·{" "}
                  {new Date(item.date).toLocaleDateString()}
                </small>
              </div>
              <div className="activity-row-end">
                {item.badge}
                <ArrowUpRight size={16} color="#718399" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>{items.length ? "Nothing matches this filter" : "No activity yet"}</h3>
          <p>
            {items.length
              ? "Choose another filter to see your records."
              : "Your submitted concerns and document requests will appear here."}
          </p>
          {!items.length && (
            <>
              <Link className="button secondary" href="/app/report">
                Report a concern
              </Link>{" "}
              <Link className="button secondary" href="/app/documents">
                Request a document
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
