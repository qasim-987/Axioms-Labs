"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  getSupabase,
  staffFetch,
  staffLogin,
  staffLogout,
  staffSessionActive,
  staffSessionPolicyViolation,
  staffTouchSession,
  type SessionExpiryReason,
} from "@/lib/staffClient";

interface InquirySummary {
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

interface FollowupNote {
  id: string;
  author: string;
  body: string;
  created_at: string;
}

interface InquiryDetail extends InquirySummary {
  message: string;
  brief_json: Record<string, string> | null;
  conversation_context: { role: string; content: string }[] | null;
  notes: FollowupNote[];
}

const STATUSES = ["new", "contacted", "under_discussion", "closed"] as const;
const STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  under_discussion: "Under discussion",
  closed: "Closed",
};

const inputClass =
  "w-full rounded-lg border border-[#212226]/15 bg-white px-3 py-2 text-sm text-[#121317] focus:border-[#0061FD] focus:outline-none";

export default function StaffDashboard() {
  const [configured, setConfigured] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [note, setNote] = useState("");
  const [actionError, setActionError] = useState("");
  const [sessionNotice, setSessionNotice] = useState<SessionExpiryReason>(null);
  const [forbidden, setForbidden] = useState(false);

  /** End the session locally + server-side and return to the login screen. */
  const expireSession = useCallback(async (reason: SessionExpiryReason) => {
    await staffLogout();
    setSessionNotice(reason);
    setAuthed(false);
    setInquiries([]);
    setDetail(null);
    setSelectedId("");
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!getSupabase()) {
        if (alive) setConfigured(false);
        return;
      }
      const active = await staffSessionActive();
      if (alive) {
        // A restored session must still satisfy the idle/absolute policy.
        const violation = active ? staffSessionPolicyViolation() : null;
        if (active && violation) {
          await staffLogout();
          setSessionNotice(violation);
          setAuthed(false);
        } else {
          setAuthed(active);
        }
        setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const loadList = useCallback(async () => {
    const { status, body } = await staffFetch<{ inquiries: InquirySummary[] }>(
      "/staff/inquiries"
    );
    if (status === 200 && body) {
      setInquiries(body.inquiries || []);
    } else if (status === 401) {
      setAuthed(false);
    } else if (status === 403) {
      setForbidden(true);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    const { status, body } = await staffFetch<{ inquiry: InquiryDetail }>(
      `/staff/inquiries/${encodeURIComponent(id)}`
    );
    if (status === 200 && body) setDetail(body.inquiry);
  }, []);

  useEffect(() => {
    if (authed) void loadList();
  }, [authed, loadList]);

  /**
   * Client-side session policy: inactivity and absolute ceilings. The server
   * still caps token lifetime and revokes on logout; this only makes the UX
   * end promptly instead of waiting for the next failed call.
   */
  useEffect(() => {
    if (!authed) return;
    let lastTouch = Date.now();
    const touch = () => {
      const now = Date.now();
      if (now - lastTouch > 15_000) {
        lastTouch = now;
        staffTouchSession();
      }
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "wheel"];
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const timer = window.setInterval(() => {
      const violation = staffSessionPolicyViolation();
      if (violation) void expireSession(violation);
    }, 30_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      window.clearInterval(timer);
    };
  }, [authed, expireSession]);

  useEffect(() => {
    if (authed && selectedId) void loadDetail(selectedId);
  }, [authed, selectedId, loadDetail]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setLoginError("");
    setSessionNotice(null);
    setForbidden(false);
    const res = await staffLogin(email.trim(), password);
    setBusy(false);
    if (res.ok) {
      setPassword("");
      setAuthed(true);
    } else {
      setLoginError(res.error || "Sign-in failed.");
    }
  }

  async function onStatus(status: string) {
    if (!selectedId) return;
    setActionError("");
    const { status: code } = await staffFetch(`/staff/inquiries/${encodeURIComponent(selectedId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (code === 200) {
      await Promise.all([loadList(), loadDetail(selectedId)]);
    } else {
      setActionError("Status update failed. Please try again.");
    }
  }

  async function onNote(e: FormEvent) {
    e.preventDefault();
    if (!selectedId || !note.trim()) return;
    setActionError("");
    const { status } = await staffFetch(`/staff/inquiries/${encodeURIComponent(selectedId)}/notes`, {
      method: "POST",
      body: JSON.stringify({ body: note.trim() }),
    });
    if (status === 200) {
      setNote("");
      await loadDetail(selectedId);
    } else {
      setActionError("Note could not be saved. Please try again.");
    }
  }

  async function onLogout() {
    await staffLogout();
    setAuthed(false);
    setInquiries([]);
    setDetail(null);
    setSelectedId("");
  }

  if (checking) {
    return <main className="mx-auto max-w-md px-5 py-24 text-sm text-[#6A6A71]">Checking staff session…</main>;
  }

  if (!configured) {
    return (
      <main className="mx-auto max-w-md px-5 py-24">
        <h1 className="text-lg font-semibold text-[#121317]">Staff dashboard</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6A6A71]">
          Staff auth is not configured for this deployment. Set
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for the web
          project, then redeploy.
        </p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-5 py-24">
        <div className="rounded-2xl border border-[#212226]/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <img
              src="/brand/axl-monogram-512.png"
              alt=""
              aria-hidden="true"
              className="h-10 w-10 rounded-lg bg-[#121317] p-1.5"
              width={40}
              height={40}
            />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#121317]">Staff sign-in</h1>
              <p className="text-xs text-[#6A6A71]">Private inquiry dashboard — Axioms Lab</p>
            </div>
          </div>
          {sessionNotice && (
            <p
              role="status"
              className="mb-3 rounded-lg border border-[#B42318]/30 bg-[#FEF3F2] px-3 py-2 text-xs font-semibold text-[#B42318]"
            >
              {sessionNotice === "idle"
                ? "You were signed out after 30 minutes of inactivity."
                : "You were signed out after reaching the 12-hour session limit."}
            </p>
          )}
          <form onSubmit={onLogin} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6A6A71]" htmlFor="staff-email">Work email</label>
              <input
                id="staff-email"
                type="email"
                required
                autoComplete="username"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6A6A71]" htmlFor="staff-password">Password</label>
              <input
                id="staff-password"
                type="password"
                required
                autoComplete="current-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {loginError && (
              <p role="alert" className="text-xs font-semibold text-[#B42318]">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="min-h-[2.75rem] w-full rounded-lg bg-[#0061FD] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3186FF] disabled:opacity-40 motion-reduce:transition-none"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-[11px] leading-relaxed text-[#6A6A71]">
            Accounts are created by the studio owner in Supabase Auth; public
            signup is disabled.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/brand/axl-monogram-512.png"
            alt=""
            aria-hidden="true"
            className="h-10 w-10 rounded-lg bg-[#121317] p-1.5"
            width={40}
            height={40}
          />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[#121317]">Inquiry dashboard</h1>
            <p className="text-xs text-[#6A6A71]">Confirmed briefs, follow-up notes and status</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="min-h-[2.75rem] rounded-lg border border-[#212226]/15 px-4 py-2 text-xs font-semibold text-[#6A6A71] hover:text-[#121317]"
        >
          Sign out
        </button>
      </header>

      {forbidden && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-[#B42318]/30 bg-[#FEF3F2] px-3 py-2 text-xs font-semibold text-[#B42318]"
        >
          This account is signed in but is not on the staff allowlist. Ask the
          studio owner to add its email to STAFF_EMAILS, then sign out and in again.
        </p>
      )}
      {actionError && (
        <p role="alert" className="mb-4 rounded-lg border border-[#B42318]/30 bg-[#FEF3F2] px-3 py-2 text-xs font-semibold text-[#B42318]">
          {actionError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <section aria-label="Inquiries" className="space-y-2">
          {inquiries.length === 0 && (
            <p className="rounded-xl border border-[#212226]/10 bg-white px-3 py-6 text-center text-xs text-[#6A6A71]">
              No inquiries yet.
            </p>
          )}
          {inquiries.map((inq) => (
            <button
              key={inq.inquiry_id}
              type="button"
              onClick={() => setSelectedId(inq.inquiry_id)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors motion-reduce:transition-none ${
                selectedId === inq.inquiry_id
                  ? "border-[#0061FD] bg-[#F4F8FF]"
                  : "border-[#212226]/10 bg-white hover:border-[#0061FD]/40"
              }`}
            >
              <p className="flex items-center justify-between gap-2 text-sm font-semibold text-[#121317]">
                <span className="min-w-0 truncate">{inq.company || inq.client_name}</span>
                <span className="shrink-0 rounded-full bg-[#121317]/5 px-2 py-0.5 text-[10px] font-semibold text-[#6A6A71]">
                  {STATUS_LABEL[inq.status] || inq.status}
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-[#6A6A71]">
                {inq.service} · {new Date(inq.received_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </section>

        <section aria-label="Inquiry detail" className="min-w-0">
          {!detail ? (
            <p className="rounded-xl border border-[#212226]/10 bg-white px-3 py-10 text-center text-xs text-[#6A6A71]">
              Select an inquiry to view the brief, notes and status.
            </p>
          ) : (
            <div className="space-y-4 rounded-2xl border border-[#212226]/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-[#121317]">
                    {detail.company || detail.client_name}
                  </h2>
                  <p className="mt-0.5 break-words text-xs text-[#6A6A71] [overflow-wrap:anywhere]">
                    {detail.client_name} · {detail.email}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6A6A71]">
                    {detail.service} · budget: {detail.budget} · ref {detail.inquiry_id}
                  </p>
                </div>
                <label className="text-xs font-semibold text-[#6A6A71]">
                  Status
                  <select
                    className="mt-1 block min-h-[2.75rem] rounded-lg border border-[#212226]/15 bg-white px-3 py-2 text-sm font-normal text-[#121317] focus:border-[#0061FD] focus:outline-none"
                    value={detail.status}
                    onChange={(e) => void onStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6A6A71]">Project brief</h3>
                <dl className="space-y-1.5 text-sm text-[#121317]">
                  {(detail.brief_json
                    ? (Object.entries(detail.brief_json) as [string, string][])
                    : []
                  )
                    .filter(([key]) => key !== "idempotencyKey")
                    .map(([key, value]) => (
                      <div key={key} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
                        <dt className="text-xs font-semibold text-[#6A6A71]">{key}</dt>
                        <dd className="min-w-0 break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
                          {String(value || "—")}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>

              {detail.conversation_context && detail.conversation_context.length > 0 && (
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6A6A71]">
                    Shared conversation context (visitor consented)
                  </h3>
                  <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg bg-[#F8F9FC] p-3">
                    {detail.conversation_context.map((m, i) => (
                      <p key={i} className="min-w-0 break-words text-xs leading-relaxed text-[#121317] [overflow-wrap:anywhere]">
                        <span className="font-semibold text-[#6A6A71]">{m.role}:</span> {m.content}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6A6A71]">Follow-up notes</h3>
                {detail.notes.length === 0 && (
                  <p className="text-xs text-[#6A6A71]">No notes yet.</p>
                )}
                <ul className="space-y-2">
                  {detail.notes.map((n) => (
                    <li key={n.id} className="rounded-lg border border-[#212226]/10 bg-[#F8F9FC] px-3 py-2">
                      <p className="min-w-0 break-words whitespace-pre-wrap text-sm text-[#121317] [overflow-wrap:anywhere]">{n.body}</p>
                      <p className="mt-1 text-[10px] text-[#6A6A71]">
                        {n.author} · {new Date(n.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
                <form onSubmit={onNote} className="mt-3 space-y-2">
                  <textarea
                    className={`${inputClass} min-h-[4.5rem] resize-y`}
                    placeholder="Add a follow-up note…"
                    maxLength={2000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    aria-label="New follow-up note"
                  />
                  <button
                    type="submit"
                    disabled={!note.trim()}
                    className="min-h-[2.75rem] rounded-lg bg-[#121317] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0061FD] disabled:opacity-40 motion-reduce:transition-none"
                  >
                    Save note
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
