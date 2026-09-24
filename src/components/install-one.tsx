"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, ExternalLink, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallOneButton({ className = "button secondary" }: { className?: string }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const initialStateTimer = window.setTimeout(() => setInstalled(isStandalone()), 0);
    const onBeforeInstall = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setPromptEvent(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.clearTimeout(initialStateTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    setInstalling(true);
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setInstalling(false);
    setPromptEvent(null);
  }

  if (installed) return <span className="installed-label">ONE is installed</span>;
  if (!promptEvent) return <Link className={className} href="/install"><Download size={16} /> Install ONE</Link>;
  return <button className={className} type="button" onClick={install} disabled={installing}><Download size={16} />{installing ? "Opening install…" : "Install ONE"}</button>;
}

export function InstallExperience() {
  return (
    <div className="install-experience">
      <div className="install-primary"><InstallOneButton className="button primary" /></div>
      <p className="muted small">If your browser does not show an install prompt, use the instructions below.</p>
      <div className="install-instructions">
        <section><Download size={18} /><div><h2>Android / Chromium browsers</h2><p>Use <strong>Install app</strong> from the browser menu or the button above when it appears.</p></div></section>
        <section><ExternalLink size={18} /><div><h2>Desktop Chrome or Edge</h2><p>Select the install icon in the address bar, or choose <strong>Install ONE</strong> from the browser menu.</p></div></section>
        <section><Share size={18} /><div><h2>iPhone or iPad</h2><p>Open ONE in Safari, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong>.</p></div></section>
      </div>
    </div>
  );
}
