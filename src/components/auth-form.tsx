"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { PolicyLinks } from "@/components/policy-dialog";
import { Brand } from "@/components/ui";

type AuthMode = "login" | "register" | "admin";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistration = mode === "register";
  const isAdmin = mode === "admin";
  const [email, setEmail] = useState(isAdmin ? "admin@one.local" : "");
  const [password, setPassword] = useState(isAdmin ? "demo-admin" : "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const endpoint = isRegistration ? "/api/auth/register" : "/api/auth/login";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (isRegistration && !acceptedPolicies) {
      setError("Please read and accept the Terms and Conditions and Privacy Policy to create an account.");
      return;
    }
    if (isRegistration && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const payload = isRegistration
      ? { firstName, middleName, lastName, email, mobileNumber, address, password, confirmPassword, acceptedPolicies }
      : { email, password, role: isAdmin ? "admin" : "resident" };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Unable to continue. Please try again.");
      return;
    }

    const next = searchParams.get("next") || (isAdmin ? "/admin" : "/app");
    router.push(next);
    router.refresh();
  }

  const passwordInputType = showPassword ? "text" : "password";

  return (
    <main className="auth-page">
      <section className={`auth-card ${isRegistration ? "auth-card-wide" : ""}`} aria-labelledby="auth-heading">
        <Brand />
        <div className="auth-heading">
          <h1 id="auth-heading">
            {isRegistration ? "Create your account" : isAdmin ? "Operations sign in" : "Sign in to ONE"}
          </h1>
          <p>
            {isRegistration
              ? "Create a private resident workspace to report concerns, request documents, and track updates."
              : isAdmin
                ? "Review community needs and record accountable service actions."
                : "Continue to your resident workspace and service records."}
          </p>
        </div>

        {!isAdmin && (
          <div className="auth-toggle" aria-label="Authentication pages">
            <Link className={!isRegistration ? "active" : ""} href="/login">Sign in</Link>
            <Link className={isRegistration ? "active" : ""} href="/register">Register</Link>
          </div>
        )}

        {error && <div className="notice error" role="alert"><LockKeyhole size={16} />{error}</div>}

        <form className="form-stack" onSubmit={submit}>
          {isRegistration && (
            <>
              <div className="form-grid form-grid-three">
                <div className="field">
                  <label htmlFor="firstName">First name</label>
                  <input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required />
                </div>
                <div className="field">
                  <label htmlFor="middleName">Middle name <span className="muted">(optional)</span></label>
                  <input id="middleName" value={middleName} onChange={(event) => setMiddleName(event.target.value)} autoComplete="additional-name" />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Last name</label>
                  <input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" required />
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="mobileNumber">Mobile number</label>
                  <input id="mobileNumber" type="tel" inputMode="tel" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} autoComplete="tel" placeholder="e.g. +63 917 000 0000" required />
                </div>
                <div className="field">
                  <label htmlFor="address">Address</label>
                  <input id="address" value={address} onChange={(event) => setAddress(event.target.value)} autoComplete="street-address" placeholder="Street, barangay, municipality" required />
                </div>
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input id="password" type={passwordInputType} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegistration ? "new-password" : "current-password"} minLength={isRegistration ? 8 : 4} placeholder={isRegistration ? "At least 8 characters" : "Enter your password"} required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {isRegistration && (
            <>
              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type={passwordInputType} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} placeholder="Re-enter your password" required />
              </div>
              <div className="consent-check">
                <input id="acceptedPolicies" type="checkbox" checked={acceptedPolicies} onChange={(event) => setAcceptedPolicies(event.target.checked)} />
                <span><label htmlFor="acceptedPolicies">I have read and agree to the </label><PolicyLinks />.</span>
              </div>
            </>
          )}

          <button className="button primary full-width" disabled={loading}>
            {loading ? (isRegistration ? "Creating account…" : "Signing in…") : (isRegistration ? "Create account" : "Sign in")}
            <ArrowRight size={16} />
          </button>
        </form>

        {isAdmin ? (
          <div className="demo-hint"><strong>Local demo access</strong><br />admin@one.local · demo-admin<br /><span>Production must use Supabase Auth and server-side role validation.</span></div>
        ) : (
          <>
            {!isRegistration && <div className="demo-hint"><strong>Local testing account</strong><br />resident@one.local · demo-resident</div>}
            <p className="auth-foot">
              {isRegistration ? "Already have an account? " : "Need an account? "}
              <Link href={isRegistration ? "/login" : "/register"}>{isRegistration ? "Sign in" : "Register"}</Link>
            </p>
            <p className="auth-legal"><PolicyLinks /></p>
          </>
        )}
        {isAdmin && <p className="auth-foot"><Link href="/">← Back to ONE</Link></p>}
      </section>
    </main>
  );
}
