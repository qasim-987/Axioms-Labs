import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Staff dashboard client. Identity lives in Supabase Auth (the project's
 * existing auth system); every data call still goes through the backend,
 * which re-verifies the JWT server-side. The anon key is public by design -
 * authorization is enforced by the backend allowlist, not by this key.
 */

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "axl-staff" },
    });
  }
  return client;
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
  return { ok: true };
}

export async function staffLogout(): Promise<void> {
  const sb = getSupabase();
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
    // Token expired or revoked: drop the local session so the login returns.
    await sb.auth.signOut();
  }
  const body = (await res.json().catch(() => null)) as T | null;
  return { status: res.status, body };
}
