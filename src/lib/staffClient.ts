import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Staff dashboard client. Identity lives in Supabase Auth (the project's
 * existing auth system); every data call still goes through the backend,
 * which re-verifies the JWT server-side. The anon key is public by design -
 * authorization is enforced by the backend allowlist, not by this key.
 *
 * Session policy (staff-grade, client-enforced on top of server expiry):
 *  - the session lives in sessionStorage, so closing the browser/tab ends it
 *    (a reload or F5 keeps it);
 *  - 30 minutes of inactivity ends it;
 *  - 12 hours is the absolute ceiling, however active the tab is;
 *  - the server additionally caps access tokens (jwt_exp) and revokes the
 *    refresh token on sign-out.
 */

export const STAFF_IDLE_LIMIT_MS = 30 * 60 * 1000;
export const STAFF_ABSOLUTE_LIMIT_MS = 12 * 60 * 60 * 1000;

const ISSUED_AT_KEY = "axl_staff_issued_at";
const LAST_ACTIVE_KEY = "axl_staff_last_active";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: {
        // sessionStorage-backed: survives reloads, dies with the tab/browser.
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "axl-staff",
        storage: window.sessionStorage,
      },
    });
  }
  return client;
}

function markSessionStart(): void {
  const now = String(Date.now());
  window.sessionStorage.setItem(ISSUED_AT_KEY, now);
  window.sessionStorage.setItem(LAST_ACTIVE_KEY, now);
}

function clearSessionPolicy(): void {
  window.sessionStorage.removeItem(ISSUED_AT_KEY);
  window.sessionStorage.removeItem(LAST_ACTIVE_KEY);
}

/** Touch the activity clock; called by the dashboard on user activity. */
export function staffTouchSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
}

export type SessionExpiryReason = "idle" | "absolute" | null;

/**
 * Returns why the local session must end right now, or null when it may
 * continue. Also repairs missing policy stamps on a freshly restored session.
 */
export function staffSessionPolicyViolation(): SessionExpiryReason {
  if (typeof window === "undefined") return null;
  const issued = Number(window.sessionStorage.getItem(ISSUED_AT_KEY) || 0);
  const last = Number(window.sessionStorage.getItem(LAST_ACTIVE_KEY) || 0);
  const now = Date.now();
  if (!issued || !last) {
    // Restored session without stamps (e.g. storage edge case): start counting now.
    markSessionStart();
    return null;
  }
  if (now - issued > STAFF_ABSOLUTE_LIMIT_MS) return "absolute";
  if (now - last > STAFF_IDLE_LIMIT_MS) return "idle";
  return null;
}

export async function staffSessionActive(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { data } = await sb.auth.getSession();
  return Boolean(data.session);
}

export async function staffLogin(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Staff auth is not configured for this deployment." };
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  markSessionStart();
  return { ok: true };
}

/** Secure logout: revokes the refresh token server-side (global scope). */
export async function staffLogout(): Promise<void> {
  const sb = getSupabase();
  clearSessionPolicy();
  if (sb) await sb.auth.signOut();
}

/** Authenticated call to the backend staff API through the Next rewrite. */
export async function staffFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ status: number; body: T | null }> {
  const sb = getSupabase();
  if (!sb) return { status: 0, body: null };
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { status: 401, body: null };
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  if (res.status === 401) {
    // Token expired or revoked server-side: drop the local session so the
    // login screen returns. Global scope also revokes the refresh token.
    clearSessionPolicy();
    await sb.auth.signOut();
  }
  // 403 (account not on the allowlist) is deliberately NOT auto-signed-out:
  // the UI shows the reason and the user signs out consciously.
  const body = (await res.json().catch(() => null)) as T | null;
  return { status: res.status, body };
}
