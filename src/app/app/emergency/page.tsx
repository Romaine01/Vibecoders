import Link from "next/link";
import { Flame, HeartPulse, PhoneCall, Shield, Siren, TriangleAlert } from "lucide-react";
import { store } from "@/lib/demo-store";
import {
  emergencyCategories,
  emergencyCategoryLabels,
  type EmergencyCategory,
} from "@/lib/types";

const categoryIcons: Record<EmergencyCategory, typeof PhoneCall> = {
  medical: HeartPulse,
  police: Shield,
  fire: Flame,
  disaster: Siren,
  other: PhoneCall,
};

export default function EmergencyPage() {
  const contacts = store.emergencyContacts;
  const grouped = emergencyCategories
    .map((category) => ({
      category,
      items: contacts.filter((contact) => (contact.category ?? "other") === category),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <main className="page-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">Safety &amp; support</p>
          <h1>Emergency resources</h1>
          <p>
            For immediate danger, contact emergency services first. ONE is not an
            emergency dispatch system — these contacts support direct calls and
            follow-up.
          </p>
        </div>
        <TriangleAlert color="var(--danger)" aria-hidden="true" />
      </div>

      <div className="notice error" role="note" style={{ marginBottom: 18 }}>
        <TriangleAlert size={16} aria-hidden="true" />
        <span>
          <strong>Immediate danger?</strong> Call the emergency number directly from
          your phone — do not wait to submit anything here.
        </span>
      </div>

      {grouped.length ? (
        <div className="category-sections">
          {grouped.map(({ category, items }) => {
            const Icon = categoryIcons[category];
            return (
              <section className="card card-pad" key={category}>
                <div className="card-head">
                  <div>
                    <h2>
                      <Icon
                        size={17}
                        style={{ verticalAlign: "middle", marginRight: 8 }}
                        aria-hidden="true"
                      />
                      {emergencyCategoryLabels[category]}
                    </h2>
                    <p>{items.length} contact{items.length === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <div className="contact-list">
                  {items.map((contact) => (
                    <div className="contact-row" key={contact.id}>
                      <span
                        className="feature-icon"
                        style={{ background: "#fcebea", color: "var(--danger)" }}
                        aria-hidden="true"
                      >
                        <PhoneCall size={17} />
                      </span>
                      <div>
                        <h3>{contact.label}</h3>
                        <p>{contact.description}</p>
                      </div>
                      <a className="contact-number" href={`tel:${contact.number}`}>
                        {contact.number}
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="card card-pad">
          <div className="empty-state">
            <h3>No emergency contacts yet</h3>
            <p>Contacts maintained by the service desk will appear here.</p>
          </div>
        </div>
      )}

      <p className="muted small" style={{ marginTop: 18 }}>
        Looking for something else?{" "}
        <Link className="text-link" href="/app">
          Return home
        </Link>{" "}
        or{" "}
        <Link className="text-link" href="/app/report">
          report a non-emergency concern
        </Link>
        .
      </p>
    </main>
  );
}
