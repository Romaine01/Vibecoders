"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Announcement, AnnouncementStatus, EmergencyContact } from "@/lib/types";
import {
  announcementStatuses,
  announcementTypes,
  emergencyCategories,
  emergencyCategoryLabels,
} from "@/lib/types";

const statusLabels: Record<AnnouncementStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function ContentManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [type, setType] = useState<string>("announcement");
  const [priority, setPriority] = useState<string>("standard");
  const [status, setStatus] = useState<string>("published");
  const [label, setLabel] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/announcements").then((response) => response.json()),
      fetch("/api/emergency").then((response) => response.json()),
    ])
      .then(([a, e]) => {
        if (a.announcements) setAnnouncements(a.announcements);
        if (e.contacts) setContacts(e.contacts);
      })
      .catch(() => setError("Unable to load content."));
  }, []);

  async function addAnnouncement(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, type, priority, status }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setAnnouncements((current) => [result.announcement, ...current]);
      setTitle("");
      setExcerpt("");
      setMessage("Announcement saved.");
    } else {
      setError(result.error ?? "Unable to save announcement.");
    }
  }

  async function setAnnouncementStatus(id: string, next: AnnouncementStatus) {
    setError("");
    const response = await fetch(`/api/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setAnnouncements((current) =>
        current.map((item) => (item.id === id ? result.announcement : item)),
      );
      setMessage(`Announcement ${statusLabels[next].toLowerCase()}.`);
    } else {
      setError(result.error ?? "Unable to update announcement.");
    }
  }

  async function addContact(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/emergency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, number, description, category }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setContacts((current) => [...current, result.contact]);
      setLabel("");
      setNumber("");
      setDescription("");
      setMessage("Emergency contact added.");
    } else {
      setError(result.error ?? "Unable to add contact.");
    }
  }

  return (
    <div className="grid-2">
      <section className="card card-pad">
        <div className="card-head">
          <div>
            <h2>Announcements</h2>
            <p>Create, draft, publish, or archive a resident-facing notice.</p>
          </div>
        </div>
        {message && (
          <div className="notice success" role="status">
            {message}
          </div>
        )}
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        <form className="form-stack" onSubmit={addAnnouncement}>
          <div className="field">
            <label htmlFor="ann-title">Title</label>
            <input id="ann-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="ann-excerpt">Excerpt</label>
            <textarea
              id="ann-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              required
            />
          </div>
          <div className="choice-grid">
            <div className="field">
              <label htmlFor="ann-type">Type</label>
              <select id="ann-type" value={type} onChange={(event) => setType(event.target.value)}>
                {announcementTypes.map((item) => (
                  <option key={item} value={item}>
                    {item === "service_notice" ? "Service notice" : item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ann-priority">Priority</label>
              <select id="ann-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option value="standard">Normal</option>
                <option value="high">Important</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="ann-status">Status</label>
              <select id="ann-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                {announcementStatuses.map((item) => (
                  <option key={item} value={item}>
                    {statusLabels[item]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="button primary">Save announcement</button>
        </form>

        <div className="announcement-list" style={{ marginTop: 22 }}>
          {announcements.slice(0, 8).map((item) => (
            <div key={item.id} className="announcement-row">
              <span className={`priority-dot ${item.priority === "high" ? "high" : ""}`} aria-hidden="true" />
              <div style={{ flex: 1 }}>
                <div className="announcement-meta">
                  <span className="type-tag">
                    {item.status ? statusLabels[item.status] : "Published"}
                  </span>
                  <small className="muted small">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </small>
                </div>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
              </div>
              <div className="activity-row-end">
                {(item.status ?? "published") !== "published" && (
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => setAnnouncementStatus(item.id, "published")}
                  >
                    Publish
                  </button>
                )}
                {(item.status ?? "published") === "published" && (
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => setAnnouncementStatus(item.id, "archived")}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-head">
          <div>
            <h2>Emergency resources</h2>
            <p>Keep public support contacts clear and current.</p>
          </div>
        </div>
        <form className="form-stack" onSubmit={addContact}>
          <div className="field">
            <label htmlFor="ec-label">Label</label>
            <input id="ec-label" value={label} onChange={(event) => setLabel(event.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="ec-number">Number</label>
            <input
              id="ec-number"
              type="tel"
              inputMode="tel"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="ec-category">Category</label>
            <select
              id="ec-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {emergencyCategories.map((item) => (
                <option key={item} value={item}>
                  {emergencyCategoryLabels[item]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ec-description">Description</label>
            <textarea
              id="ec-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>
          <button className="button primary">Add contact</button>
        </form>
        <div className="contact-list" style={{ marginTop: 22 }}>
          {contacts.map((contact) => (
            <div className="contact-row" key={contact.id}>
              <div>
                <div className="announcement-meta">
                  <span className="type-tag">
                    {emergencyCategoryLabels[contact.category ?? "other"]}
                  </span>
                </div>
                <h3>{contact.label}</h3>
                <p>{contact.description}</p>
              </div>
              <span className="contact-number">{contact.number}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
