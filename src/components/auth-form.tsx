"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { Brand } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "register" | "admin" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(mode === "admin" ? "admin@one.local" : "");
  const [password, setPassword] = useState(mode === "admin" ? "demo-admin" : "");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, fullName, role: mode === "admin" ? "admin" : "resident" }) });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setError(data.error ?? "Unable to continue."); return; }
    const next = searchParams.get("next") || (mode === "admin" ? "/admin" : "/app"); router.push(next); router.refresh();
  }
  return <main className="auth-page"><div className="auth-card"><Brand /><h1>{mode === "register" ? "Create your resident account" : mode === "admin" ? "Operations sign in" : "Welcome back"}</h1><p>{mode === "register" ? "Set up a private space to report concerns, request documents, and follow outcomes." : mode === "admin" ? "Review community needs, coordinate action, and record measurable outcomes." : "Pick up where you left off with your community services."}</p>{mode !== "admin" && <div className="auth-toggle"><Link className={mode === "login" ? "active" : ""} href="/login">Sign in</Link><Link className={mode === "register" ? "active" : ""} href="/register">Register</Link></div>}{error && <div className="notice error" role="alert"><LockKeyhole size={16} />{error}</div>}<form className="form-stack" onSubmit={submit}>{mode === "register" && <div className="field"><label htmlFor="fullName">Full name</label><div style={{ position: "relative" }}><UserRound size={16} style={{ position: "absolute", left: 12, top: 12, color: "#8493a4" }} /><input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" style={{ paddingLeft: 36 }} required /></div></div>}<div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" minLength={4} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 4 characters" required /></div><button className="button primary full-width" disabled={loading}>{loading ? "Opening workspace…" : mode === "register" ? "Create account" : "Continue"}<ArrowRight size={16} /></button></form>{mode === "admin" && <div className="demo-hint"><strong>Local demo access</strong><br />admin@one.local · demo-admin<br />Production mode should replace this with Supabase Auth and server-side role validation.</div>}{mode !== "admin" && <p className="auth-foot">{mode === "register" ? "Already have an account? " : "Need an account? "}<Link href={mode === "register" ? "/login" : "/register"}>{mode === "register" ? "Sign in" : "Register"}</Link></p>}{mode === "admin" && <p className="auth-foot"><Link href="/">← Back to ONE</Link></p>}</div></main>;
}
