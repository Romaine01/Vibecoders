import { createHmac, timingSafeEqual } from "node:crypto";
import type { Profile } from "@/lib/types";

const DEMO_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const fallbackSecret = "one-demo-session-secret-change-in-production";

function getSessionSecret() {
  return process.env.ONE_SESSION_SECRET ?? fallbackSecret;
}

function encodePayload(payload: { profileId: string; expiresAt: number }) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createDemoSession(profile: Profile) {
  const payload = encodePayload({
    profileId: profile.id,
    expiresAt: Math.floor(Date.now() / 1000) + DEMO_SESSION_MAX_AGE,
  });
  return `${payload}.${signPayload(payload)}`;
}

export function getDemoSession(token: string | undefined) {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { profileId?: unknown; expiresAt?: unknown };
    if (typeof decoded.profileId !== "string" || typeof decoded.expiresAt !== "number" || decoded.expiresAt <= Date.now() / 1000) return null;
    return decoded.profileId;
  } catch {
    return null;
  }
}
