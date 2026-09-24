"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ChevronDown, Send, X } from "lucide-react";

type Answer = { text: string; href?: string; label?: string };

const answers: Array<{ match: string[]; answer: Answer }> = [
  { match: ["report", "concern", "issue", "problem"], answer: { text: "Open Report a concern, choose a category, describe what happened, add a landmark or map pin, and submit. Photos are optional.", href: "/app/report", label: "Report a concern" } },
  { match: ["track document", "document status", "document request status"], answer: { text: "Open My activity or Document requests to see the document reference and its processing status.", href: "/app/documents", label: "Track documents" } },
  { match: ["track", "status", "follow"], answer: { text: "Open My activity to filter concerns and see each status update and timeline.", href: "/app/activity", label: "View my activity" } },
  { match: ["document", "clearance", "certificate"], answer: { text: "Open Document requests, choose a document, add its purpose, review the details, and submit.", href: "/app/documents", label: "Request a document" } },
  { match: ["announcement", "notice", "advisory"], answer: { text: "Community notices and service advisories are available from Announcements.", href: "/app/announcements", label: "View announcements" } },
  { match: ["emergency", "urgent", "police", "fire", "medical"], answer: { text: "For urgent situations, contact the appropriate local service immediately, then use Emergency resources for the available contact list.", href: "/app/emergency", label: "Open emergency resources" } },
  { match: ["install", "pwa", "phone", "app"], answer: { text: "ONE can be installed from a supported browser. If no native prompt appears, follow the device instructions on the install page.", href: "/install", label: "Install ONE" } },
  { match: ["profile", "address", "phone", "update"], answer: { text: "Open My profile to update your name, phone number, and address.", href: "/app/profile", label: "Open my profile" } },
  { match: ["submitted", "received", "assigned", "progress", "resolved"], answer: { text: "Concern statuses show whether a report was submitted, received, assigned, in progress, resolved, or rejected. Open the record from My activity for its timeline." } },
];

function answerFor(question: string): Answer {
  const words = question.toLowerCase();
  return answers.find((item) => item.match.some((term) => words.includes(term)))?.answer ?? {
    text: "I can help with concerns, documents, announcements, emergency resources, profile updates, statuses, and installing ONE. What would you like to do?",
  };
}

export function ResidentChatbot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer>({ text: "Hi! I can help you find a ONE service. Ask me how to report a concern or request a document." });

  function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    setAnswer(answerFor(question));
    setQuestion("");
  }

  return <div className="chatbot" aria-live="polite">
    {open && <section className="chatbot-panel" aria-label="ONE help assistant">
      <div className="chatbot-head"><div><strong>ONE help</strong><small>Service guidance</small></div><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close help assistant"><X size={17} /></button></div>
      <div className="chatbot-message"><p>{answer.text}</p>{answer.href && <Link className="text-link small" href={answer.href} onClick={() => setOpen(false)}>{answer.label} →</Link>}</div>
      <form className="chatbot-form" onSubmit={ask}><label className="sr-only" htmlFor="chat-question">Ask ONE a question</label><input id="chat-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask how to get help…" /><button type="submit" aria-label="Send question"><Send size={16} /></button></form>
    </section>}
    <button type="button" className="chatbot-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close ONE help assistant" : "Open ONE help assistant"}>{open ? <ChevronDown size={18} /> : <Image src="/brand/system-logo.png" alt="" width={1278} height={1230} />}</button>
  </div>;
}
