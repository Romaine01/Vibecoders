import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Profile } from "@/lib/types";

const DEMO_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const fallbackSecret = "one-demo-session-secret-change-in-production";
export const demoAccountCookieName = "one_demo_account";

function getSessionSecret() {
  return process.env.ONE_SESSION_SECRET ?? fallbackSecret;
}

function encodePayload(payload: object) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function createSignedToken(value: object) {
  const payload = encodePayload(value);
  return `${payload}.${signPayload(payload)}`;
}

function readSignedToken(token: string | undefined): Record<string, unknown> | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const decoded: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) return null;
    const value = decoded as Record<string, unknown>;
    if (typeof value.expiresAt !== "number" || value.expiresAt <= Date.now() / 1000) return null;
    return value;
  } catch {
    return null;
  }
}

function validRegisteredProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const profile = value as Record<string, unknown>;
  return profile.role === "resident" &&
    typeof profile.id === "string" && profile.id.startsWith("resident-") &&
    typeof profile.email === "string" && typeof profile.fullName === "string" &&
    typeof profile.organizationName === "string";
}

export function createDemoSession(profile: Profile) {
  return createSignedToken({
    profileId: profile.id,
    profile: profile.id.startsWith("resident-") ? profile : undefined,
    expiresAt: Math.floor(Date.now() / 1000) + DEMO_SESSION_MAX_AGE,
  });
}

export function getDemoSession(token: string | undefined) {
  const value = readSignedToken(token);
  if (!value || typeof value.profileId !== "string") return null;
  if (value.profile !== undefined && (!validRegisteredProfile(value.profile) || value.profile.id !== value.profileId)) return null;
  return { profileId: value.profileId, profile: value.profile as Profile | undefined };
}

// Demo-only account data stays in this browser so registration can be presented on serverless hosting.
export function createDemoAccount(profile: Profile, password: string) {
  const salt = randomBytes(16).toString("base64url");
  const passwordHash = scryptSync(password, salt, 32).toString("base64url");
  return createSignedToken({ profile, salt, passwordHash, expiresAt: Math.floor(Date.now() / 1000) + DEMO_SESSION_MAX_AGE });
}

export function getDemoAccount(token: string | undefined) {
  const value = readSignedToken(token);
  if (!value || !validRegisteredProfile(value.profile) || typeof value.salt !== "string" || typeof value.passwordHash !== "string") return null;
  return { profile: value.profile, salt: value.salt, passwordHash: value.passwordHash };
}

export function authenticateDemoAccount(token: string | undefined, email: string, password: string) {
  const account = getDemoAccount(token);
  if (!account || account.profile.email.toLowerCase() !== email) return null;
  const actual = scryptSync(password, account.salt, 32);
  const expected = Buffer.from(account.passwordHash, "base64url");
  return expected.length === actual.length && timingSafeEqual(actual, expected) ? account.profile : null;
}
