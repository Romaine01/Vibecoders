"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type PolicyKind = "privacy" | "terms";

const content: Record<PolicyKind, { title: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      { heading: "What ONE collects", body: "ONE collects the account details, service requests, locations, and supporting evidence you provide so the appropriate community service workflow can respond." },
      { heading: "How information is used", body: "Information is used to authenticate your account, route your request, communicate updates, and maintain an accountable service record. Resident records are not published publicly." },
      { heading: "Access and retention", body: "Resident records are limited to the account holder and authorized operations staff. Production deployments must apply the supplied Supabase row-level security policies and private evidence storage." },
      { heading: "Local development", body: "This local demo keeps data only in memory while the server is running. Do not use real personal information in the demo environment." },
    ],
  },
  terms: {
    title: "Terms and Conditions",
    sections: [
      { heading: "Using ONE", body: "Use ONE to submit accurate community service concerns and document requests. A submission creates a service record; it is not a guarantee of immediate action or approval." },
      { heading: "Emergency situations", body: "ONE is not an emergency dispatch service. If someone is in immediate danger, contact local emergency services first." },
      { heading: "Your responsibilities", body: "Provide truthful information, avoid harmful or unlawful content, and submit only evidence you are authorized to share. Misuse may lead to account restrictions." },
      { heading: "Service updates", body: "Authorized staff may update request status and document actions taken. These updates are retained to support transparency and accountable follow-up." },
    ],
  },
};

function PolicyDialog({ kind, open, onClose }: { kind: PolicyKind; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const policy = content[kind];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="policy-dialog"
      aria-labelledby={`${kind}-policy-title`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="policy-dialog-head">
        <h2 id={`${kind}-policy-title`}>{policy.title}</h2>
        <button className="icon-button" type="button" onClick={onClose} aria-label={`Close ${policy.title}`}><X size={18} /></button>
      </div>
      <div className="policy-dialog-content">
        {policy.sections.map((section) => <section key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></section>)}
      </div>
      <div className="policy-dialog-foot"><button className="button primary" type="button" onClick={onClose}>I understand</button></div>
    </dialog>
  );
}

export function PolicyLinks({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState<PolicyKind | null>(null);
  return (
    <span className={`policy-links ${className}`}>
      <button className="policy-link" type="button" onClick={() => setOpen("terms")}>Terms and Conditions</button>
      <span aria-hidden="true">·</span>
      <button className="policy-link" type="button" onClick={() => setOpen("privacy")}>Privacy Policy</button>
      <PolicyDialog kind="terms" open={open === "terms"} onClose={() => setOpen(null)} />
      <PolicyDialog kind="privacy" open={open === "privacy"} onClose={() => setOpen(null)} />
    </span>
  );
}
