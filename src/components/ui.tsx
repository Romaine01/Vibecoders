import Image from "next/image";
import Link from "next/link";
import type { Concern, ImpactMetric } from "@/lib/types";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  FileText,
  MapPin,
  Megaphone,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { categoryLabels, documentStatusLabels, statusLabels } from "@/lib/types";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`brand-lockup ${compact ? "compact" : ""}`}
      aria-label="ONE Community Services"
    >
      <Image
        className="brand-logo"
        src="/brand/system-logo.png"
        alt=""
        width={1278}
        height={1230}
        sizes={compact ? "28px" : "40px"}
        priority
      />
      <span className="brand-wordmark">
        <strong>ONE</strong>
        {!compact && <small>Community services</small>}
      </span>
    </span>
  );
}

export function StatusBadge({ status, urgent = false }: { status: Concern["status"]; urgent?: boolean }) {
  return <span className={`status-badge ${urgent ? "urgent" : status}`}>{urgent ? "Urgent" : statusLabels[status]}</span>;
}

export function DocumentStatusBadge({ status }: { status: import("@/lib/types").DocumentStatus }) {
  return <span className={`status-badge doc-${status}`}>{documentStatusLabels[status]}</span>;
}

export function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof BarChart3; label: string; value: string | number; detail: string }) {
  return <div className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={15} /></span></div><strong className="metric-value">{value}</strong><small className="metric-detail">{detail}</small></div>;
}

export function ActionCard({ href, icon: Icon, title, description, label = "Open" }: { href: string; icon: typeof ClipboardList; title: string; description: string; label?: string }) {
  return <Link className="action-card" href={href}><span className="feature-icon"><Icon size={18} /></span><h3>{title}</h3><p>{description}</p><span className="text-link small" style={{ display: "inline-flex", marginTop: 14, alignItems: "center", gap: 4 }}>{label}<ArrowUpRight size={13} /></span></Link>;
}

export function ActivityRow({ concern }: { concern: Concern }) {
  return <Link className="activity-row" href={`/app/concerns/${concern.reference}`}><div className="activity-row-main"><strong>{concern.title}</strong><small>{concern.reference} · {categoryLabels[concern.category]} · {new Date(concern.updatedAt).toLocaleDateString()}</small></div><div className="activity-row-end"><StatusBadge status={concern.status} urgent={concern.urgency === "urgent"} /><ArrowUpRight size={16} color="#718399" /></div></Link>;
}

export function AnnouncementRow({
  title,
  excerpt,
  priority,
  publishedAt,
  type,
}: {
  title: string;
  excerpt: string;
  priority: "high" | "standard";
  publishedAt: string;
  type?: import("@/lib/types").AnnouncementType;
}) {
  const isEmergency = type === "emergency" || priority === "high";
  return (
    <div className={`announcement-row ${isEmergency ? "is-important" : ""}`}>
      <span className={`priority-dot ${isEmergency ? "high" : ""}`} aria-hidden="true" />
      <div>
        <div className="announcement-meta">
          {type && <span className="type-tag">{type === "service_notice" ? "Service notice" : type.charAt(0).toUpperCase() + type.slice(1)}</span>}
          <small className="muted small">{new Date(publishedAt).toLocaleDateString()}</small>
        </div>
        <h3>{title}</h3>
        <p>{excerpt}</p>
      </div>
    </div>
  );
}

export function SdgCard({ number, name, metrics }: { number: "11" | "16"; name: string; metrics: ImpactMetric[] }) {
  return <div className="sdg-card"><div className="sdg-card-header"><span className={`sdg-number sdg-${number}`}>{number}</span><div><h3>SDG {number}</h3><p>{name}</p></div></div><div className="impact-list">{metrics.map((metric) => <div className="impact-line" key={metric.label}><span>{metric.label}<br /><small>{metric.detail}</small></span><strong>{metric.value}</strong></div>)}</div></div>;
}

export const actionIconMap = { report: ClipboardList, documents: FileText, announcements: Megaphone, emergency: Siren, impact: BarChart3, safety: ShieldCheck, location: MapPin };
