"use client";

import { FormEvent, useState } from "react";
import { Check, UserRound, X } from "lucide-react";
import type { Profile } from "@/lib/types";

export function ProfilePanel({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone ?? profile.mobileNumber ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, address }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(result.error ?? "Unable to save your profile.");
      return;
    }
    setMessage("Profile saved.");
  }

  return (
    <div className="grid-2">
      <section className="card card-pad">
        <div className="card-head">
          <div>
            <h2>Account</h2>
            <p>Your sign-in details for this workspace.</p>
          </div>
          <span className="feature-icon" aria-hidden="true">
            <UserRound size={18} />
          </span>
        </div>
        <dl className="verification-details">
          <div>
            <dt>Name</dt>
            <dd>{profile.fullName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{profile.role === "admin" ? "Administrator" : "Resident"}</dd>
          </div>
          <div>
            <dt>Organization</dt>
            <dd>{profile.organizationName}</dd>
          </div>
        </dl>
      </section>
      <section className="card card-pad">
        <div className="card-head">
          <div>
            <h2>Resident details</h2>
            <p>Saved once, used to prefill document applications.</p>
          </div>
        </div>
        {error && (
          <div className="notice error" role="alert">
            <X size={16} />
            {error}
          </div>
        )}
        {message && (
          <div className="notice success" role="status">
            <Check size={16} />
            {message}
          </div>
        )}
        <form className="form-stack" onSubmit={save}>
          <div className="field">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="profile-phone">Mobile number</label>
            <input
              id="profile-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="field">
            <label htmlFor="profile-address">Address</label>
            <textarea
              id="profile-address"
              autoComplete="street-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="House, street, and area within the community"
            />
            <small>Used for certificate and clearance applications.</small>
          </div>
          <button className="button primary" disabled={loading}>
            {loading ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
}
