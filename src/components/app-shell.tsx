"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BarChart3, ClipboardList, Download, FileText, Home, LogOut, Menu, Megaphone, Settings, ShieldAlert, User, X } from "lucide-react";
import type { Profile } from "@/lib/types";
import { Brand } from "@/components/ui";
import { ResidentChatbot } from "@/components/resident-chatbot";

const residentLinks = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/report", label: "Report a concern", icon: ClipboardList },
  { href: "/app/activity", label: "My activity", icon: BarChart3 },
  { href: "/app/documents", label: "Document requests", icon: FileText },
  { href: "/app/announcements", label: "Announcements", icon: Megaphone },
  { href: "/app/emergency", label: "Emergency resources", icon: ShieldAlert },
  { href: "/app/profile", label: "My profile", icon: User },
  { href: "/install", label: "Install ONE", icon: Download },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/concerns", label: "Concerns", icon: ClipboardList },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/impact", label: "Community impact", icon: BarChart3 },
  { href: "/admin/content", label: "Content & resources", icon: Megaphone },
  { href: "/admin/settings", label: "Organization settings", icon: Settings },
];

export function AppShell({ user, admin = false, children }: { user: Profile; admin?: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const links = admin ? adminLinks : residentLinks;
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }
  return <div className="app-shell"><a className="skip-link" href="#main-content">Skip to content</a><aside className={`sidebar ${open ? "open" : ""}`}><div><div className="sidebar-top"><Link href={admin ? "/admin" : "/app"} onClick={() => setOpen(false)}><Brand /></Link><button className="button ghost mobile-nav-trigger" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button></div><p className="workspace-label">{admin ? "Operations workspace" : "Resident workspace"}</p><nav className="side-nav" aria-label="Primary navigation">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`)) ? "active" : ""} aria-current={pathname === href || (href !== "/app" && pathname.startsWith(`${href}/`)) ? "page" : undefined} onClick={() => setOpen(false)}><Icon size={17} />{label}</Link>)}</nav></div><div className="sidebar-footer"><div className="user-mini"><span className="avatar">{user.fullName.slice(0, 1).toUpperCase()}</span><div><strong>{user.fullName}</strong><small>{admin ? "Administrator" : "Resident"}</small></div></div><button className="button ghost full-width" onClick={logout}><LogOut size={15} /> Sign out</button></div></aside><div className="main-content"><div className="topbar"><button onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={18} /></button><Brand compact /><span style={{ width: 36 }} /></div><div id="main-content">{children}</div></div>{!admin && <ResidentChatbot />}</div>;
}
