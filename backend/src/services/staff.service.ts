import crypto from "node:crypto";
import { env } from "../config/env";

/**
 * Private staff dashboard backend: identity comes from Supabase Auth JWTs
 * (the same auth system the project already uses), verified locally against
 * the project's JWKS with node:crypto - no new dependency, no trust in the
 * client. Access is additionally restricted to the STAFF_EMAILS allowlist;
 * an empty allowlist denies everyone (fail closed).
 */

interface Jwk {
  kty: string;
  // RSA
  n?: string;
  e?: string;
  // EC (Supabase production signs with ES256)
  crv?: string;
  x?: string;
  y?: string;
  kid?: string;
  alg?: string;
  use?: string;
}

interface JwtPayload {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  sub?: string;
  email?: string;
}

let jwksCache: { keys: Jwk[]; fetchedAt: number } | null = null;

async function getJwks(forceRefresh = false): Promise<Jwk[]> {
  if (!forceRefresh && jwksCache && Date.now() - jwksCache.fetchedAt < 3_600_000) {
    return jwksCache.keys;
  }
  const res = await fetch(`${env.supabaseUrl.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json`);
  if (!res.ok) throw new Error(`JWKS fetch failed (${res.status})`);
  const body = (await res.json()) as { keys: Jwk[] };
  jwksCache = { keys: body.keys, fetchedAt: Date.now() };
  return body.keys;
}

function b64url(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export interface StaffIdentity {
  email: string;
  sub: string;
}

/** Verify signature + issuer + audience + expiry + staff allowlist. */
export async function verifyStaffToken(token: string): Promise<StaffIdentity | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let header: { alg?: string; kid?: string };
  let payload: JwtPayload;
  try {
    header = JSON.parse(b64url(parts[0]).toString("utf8")) as { alg?: string; kid?: string };
    payload = JSON.parse(b64url(parts[1]).toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
  if (header.alg !== "RS256" && header.alg !== "ES256") return null;
  const expectedIss = `${env.supabaseUrl.replace(/\/$/, "")}/auth/v1`;
  if (payload.iss !== expectedIss) return null;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud || ""];
  if (!aud.includes("authenticated")) return null;
  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;

  const signed = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = b64url(parts[2]);

  const checkAgainst = (keys: Jwk[]): boolean => {
    const jwk = (header.kid ? keys.find((k) => k.kid === header.kid) : undefined) || keys[0];
    if (!jwk) return false;
    if (header.alg === "RS256" && jwk.kty !== "RSA") return false;
    if (header.alg === "ES256" && (jwk.kty !== "EC" || jwk.crv !== "P-256")) return false;
    let publicKey: crypto.KeyObject;
    try {
      publicKey = crypto.createPublicKey({
        format: "jwk",
        key: jwk as unknown as crypto.JsonWebKey,
      });
    } catch {
      return false;
    }
    // JWS carries ECDSA signatures in raw IEEE P1363 (r||s) form, while
    // node:crypto defaults to DER - the encoding must be stated explicitly.
    try {
      return header.alg === "RS256"
        ? crypto.verify("RSA-SHA256", signed, publicKey, signature)
        : crypto.verify("SHA256", signed, { key: publicKey, dsaEncoding: "ieee-p1363" }, signature);
    } catch {
      return false;
    }
  };

  let keys: Jwk[];
  try {
    keys = await getJwks();
  } catch {
    return null;
  }
  if (!checkAgainst(keys)) {
    // The signing key may have rotated since the JWKS was cached; refresh once.
    try {
      keys = await getJwks(true);
    } catch {
      return null;
    }
    if (!checkAgainst(keys)) return null;
  }

  const email = (payload.email || "").toLowerCase();
  if (!email) return null;
  const allowed = env.staffEmails.map((e) => e.toLowerCase());
  if (allowed.length === 0 || !allowed.includes(email)) return null;
  return { email, sub: payload.sub || "" };
}

/* ── Storage helpers (service role; RLS-protected tables) ─────────────── */

const LIST_SELECT =
  "inquiry_id,company,service,status,budget,client_name,email,received_at,source";

function restBase(): string {
  return `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1`;
}

function restHeaders(): Record<string, string> {
  return {
    apikey: env.supabaseServiceRoleKey,
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    "Content-Type": "application/json",
  };
}

export interface InquirySummary {
  inquiry_id: string;
  company: string;
  service: string;
  status: string;
  budget: string;
  client_name: string;
  email: string;
  received_at: string;
  source: string;
}

export interface FollowupNote {
  id: string;
  inquiry_id: string;
  author: string;
  body: string;
  created_at: string;
}

export interface InquiryDetail extends InquirySummary {
  message: string;
  brief_json: unknown;
  conversation_context: unknown;
  notes: FollowupNote[];
}

async function restGet(path: string): Promise<Response> {
  return fetch(`${restBase()}${path}`, { headers: restHeaders() });
}

export async function listInquiries(): Promise<InquirySummary[]> {
  const res = await restGet(
    `/contact_inquiries?select=${LIST_SELECT}&order=received_at.desc&limit=100`
  );
  if (!res.ok) throw new Error(`inquiry list failed (${res.status})`);
  return (await res.json()) as InquirySummary[];
}

export async function getInquiry(inquiryId: string): Promise<InquiryDetail | null> {
  const res = await restGet(
    `/contact_inquiries?inquiry_id=eq.${encodeURIComponent(inquiryId)}&select=${LIST_SELECT},message,brief_json,conversation_context&limit=1`
  );
  if (!res.ok) throw new Error(`inquiry fetch failed (${res.status})`);
  const rows = (await res.json()) as InquiryDetail[];
  const row = rows[0];
  if (!row) return null;
  const notesRes = await restGet(
    `/staff_followup_notes?inquiry_id=eq.${encodeURIComponent(inquiryId)}&select=id,inquiry_id,author,body,created_at&order=created_at.asc`
  );
  const notes = notesRes.ok ? ((await notesRes.json()) as FollowupNote[]) : [];
  return { ...row, notes };
}

export async function addFollowupNote(
  inquiryId: string,
  author: string,
  body: string
): Promise<void> {
  const res = await fetch(`${restBase()}/staff_followup_notes`, {
    method: "POST",
    headers: { ...restHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({ inquiry_id: inquiryId, author, body }),
  });
  if (!res.ok) throw new Error(`note insert failed (${res.status})`);
}

export const INQUIRY_STATUSES = ["new", "contacted", "under_discussion", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export async function setInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
): Promise<void> {
  const res = await fetch(
    `${restBase()}/contact_inquiries?inquiry_id=eq.${encodeURIComponent(inquiryId)}`,
    {
      method: "PATCH",
      headers: { ...restHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ status }),
    }
  );
  if (!res.ok) throw new Error(`status update failed (${res.status})`);
}
