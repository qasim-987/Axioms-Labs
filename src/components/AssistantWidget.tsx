"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Send, X } from "lucide-react";
import {
  AssistantChatMessage,
  BriefDraft,
  chatWithAssistant,
  submitProjectBrief,
} from "@/lib/apiClient";

const GREETING =
  "Hi! I'm an AI assistant for Axioms Lab. Ask me about our services, selected work, or how to start a project - for prices and dates I'll point you to our team.";
const FALLBACK =
  "The assistant is unavailable right now. The project brief form at /contact always works.";
const SUBMITTED_NOTE =
  "Your project brief is submitted. The team will reply within 24 hours (Mon-Sat) - thank you!";

function newBriefKey(): string {
  try {
    const stored = window.sessionStorage.getItem("axl_brief_key");
    if (stored) return stored;
    const key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.sessionStorage.setItem("axl_brief_key", key);
    return key;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

/**
 * Floating portfolio assistant. The visible transcript is echoed to
 * POST /api/assistant/chat (Express -> Groq, grounded in the live catalog) and
 * one reply comes back. The assistant also maintains a structured project
 * brief: the draft survives in widget state and is re-sent every turn, so
 * details stay remembered even after older messages leave the transcript.
 * When the draft is substantive, an editable brief card appears; submission
 * only happens after the visitor explicitly confirms it.
 */
export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [brief, setBrief] = useState<BriefDraft>({});
  const [briefKey, setBriefKey] = useState("");
  const [showBrief, setShowBrief] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sendingBrief, setSendingBrief] = useState(false);
  const [briefError, setBriefError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBriefKey(newBriefKey());
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open, showBrief]);

  const briefReady =
    !submitted &&
    Boolean(brief.business && brief.service && (brief.requirements || brief.timeline));

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next: AssistantChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await chatWithAssistant({ messages: next.slice(-12), brief });
      if (res.brief) {
        setBrief((prev) => ({ ...prev, ...res.brief }));
        const merged = { ...brief, ...res.brief };
        if (
          merged.business &&
          merged.service &&
          (merged.requirements || merged.timeline)
        ) {
          setShowBrief(true);
        }
      }
      setMessages([
        ...next,
        {
          role: "assistant",
          content: res.success && res.reply ? res.reply : res.error || FALLBACK,
        },
      ]);
    } catch {
      setMessages([...next, { role: "assistant", content: FALLBACK }]);
    } finally {
      setBusy(false);
    }
  }

  function setSlot(slot: keyof BriefDraft, value: string) {
    setBrief((prev) => ({ ...prev, [slot]: value }));
  }

  const canConfirm =
    Boolean(
      brief.business &&
        brief.service &&
        brief.requirements &&
        brief.requirements.trim().length >= 10 &&
        brief.timeline &&
        brief.contactName &&
        brief.email &&
        /.+@.+\..+/.test(brief.email)
    ) && !sendingBrief;

  async function confirmBrief() {
    if (!canConfirm || !briefKey) return;
    setSendingBrief(true);
    setBriefError("");
    try {
      const res = await submitProjectBrief({
        idempotencyKey: briefKey,
        business: brief.business || "",
        service: brief.service || "",
        requirements: brief.requirements || "",
        timeline: brief.timeline || "",
        budget: brief.budget || "",
        contactName: brief.contactName || "",
        email: brief.email || "",
      });
      if (res.success) {
        setSubmitted(true);
        setShowBrief(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: SUBMITTED_NOTE },
        ]);
      } else {
        // stored:true means the row exists; retrying with the same key resumes
        // delivery without creating a duplicate.
        setBriefError(res.error || FALLBACK);
      }
    } catch {
      setBriefError(FALLBACK);
    } finally {
      setSendingBrief(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-[#212226]/15 bg-white px-2.5 py-1.5 text-sm text-[#121317] focus:border-[#3186FF] focus:outline-none";
  const labelClass = "mb-1 block text-[11px] font-semibold text-[#6A6A71]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close the Axioms Lab assistant" : "Chat with the Axioms Lab assistant"}
        aria-expanded={open}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#121317] text-white shadow-lg transition-colors hover:bg-[#3186FF] focus:outline-none focus:ring-2 focus:ring-[#3186FF] motion-reduce:transition-none"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <section
          aria-label="Axioms Lab assistant chat"
          className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-5 z-[60] flex h-[min(70vh,32rem)] w-[min(calc(100vw-2.5rem),24rem)] flex-col overflow-hidden rounded-2xl border border-[#212226]/10 bg-white shadow-2xl"
        >
          <header className="bg-[#121317] px-4 py-3 text-white">
            <p className="text-sm font-semibold">Axioms Lab Assistant</p>
            <p className="font-mono text-[11px] text-white/60">
              AI assistant — grounded in our live service catalog
            </p>
          </header>

          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((m, i) => (
              <p
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-[#3186FF] px-3 py-2 text-sm leading-relaxed text-white"
                    : "w-fit max-w-[85%] rounded-2xl rounded-bl-sm border border-[#212226]/10 bg-[#F8F9FC] px-3 py-2 text-sm leading-relaxed text-[#121317]"
                }
              >
                {m.content}
              </p>
            ))}
            {busy && (
              <p className="w-fit rounded-2xl rounded-bl-sm border border-[#212226]/10 bg-[#F8F9FC] px-3 py-2 font-mono text-xs text-[#6A6A71]">
                thinking…
              </p>
            )}

            {showBrief && briefReady && (
              <div
                aria-label="Editable project brief"
                className="rounded-xl border border-[#3186FF]/30 bg-[#F4F8FF] p-3"
              >
                <p className="mb-2 text-xs font-semibold text-[#121317]">
                  Your project brief so far — edit anything, then confirm:
                </p>
                <div className="space-y-2">
                  <div>
                    <label className={labelClass} htmlFor="brief-business">Business</label>
                    <input
                      id="brief-business"
                      className={fieldClass}
                      value={brief.business || ""}
                      maxLength={200}
                      onChange={(e) => setSlot("business", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="brief-service">Requested service</label>
                    <input
                      id="brief-service"
                      className={fieldClass}
                      value={brief.service || ""}
                      maxLength={200}
                      onChange={(e) => setSlot("service", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="brief-requirements">Requirements</label>
                    <textarea
                      id="brief-requirements"
                      className={`${fieldClass} min-h-[4.5rem] resize-y`}
                      value={brief.requirements || ""}
                      maxLength={4000}
                      onChange={(e) => setSlot("requirements", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass} htmlFor="brief-timeline">Timeline</label>
                      <input
                        id="brief-timeline"
                        className={fieldClass}
                        value={brief.timeline || ""}
                        maxLength={200}
                        onChange={(e) => setSlot("timeline", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="brief-budget">Budget (optional)</label>
                      <input
                        id="brief-budget"
                        className={fieldClass}
                        value={brief.budget || ""}
                        maxLength={200}
                        onChange={(e) => setSlot("budget", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass} htmlFor="brief-name">Your name</label>
                      <input
                        id="brief-name"
                        className={fieldClass}
                        value={brief.contactName || ""}
                        maxLength={120}
                        onChange={(e) => setSlot("contactName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="brief-email">Email</label>
                      <input
                        id="brief-email"
                        type="email"
                        className={fieldClass}
                        value={brief.email || ""}
                        maxLength={200}
                        onChange={(e) => setSlot("email", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {briefError && (
                  <p role="alert" className="mt-2 text-[11px] font-semibold text-[#B42318]">
                    {briefError}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={confirmBrief}
                    disabled={!canConfirm}
                    className="flex items-center gap-1.5 rounded-lg bg-[#0061FD] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3186FF] disabled:opacity-40 motion-reduce:transition-none"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {sendingBrief ? "Submitting…" : "Confirm & submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBrief(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#6A6A71] hover:text-[#121317]"
                  >
                    Keep chatting
                  </button>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-[#6A6A71]">
                  Nothing is sent until you confirm. You can keep chatting and
                  return to this card any time.
                </p>
              </div>
            )}

            {submitted && (
              <p className="flex items-center gap-1.5 rounded-xl border border-[#12B76A]/30 bg-[#F0FBF5] px-3 py-2 text-xs font-semibold text-[#027A48]">
                <CheckCircle2 className="h-4 w-4" /> Brief submitted — thank you!
              </p>
            )}
          </div>

          <form onSubmit={send} className="border-t border-[#212226]/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1500}
                placeholder="Ask about services, work, pricing approach…"
                aria-label="Message the Axioms Lab assistant"
                className="min-w-0 flex-1 rounded-xl border border-[#212226]/15 bg-[#F8F9FC] px-3 py-2 text-base text-[#121317] placeholder:text-[#6A6A71] focus:border-[#3186FF] focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#121317] text-white transition-colors hover:bg-[#3186FF] disabled:opacity-40 motion-reduce:transition-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[#6A6A71]">
              Need a quote? Describe your project here or use{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#3186FF] underline underline-offset-2"
              >
                the project brief form
              </Link>{" "}
              — reply within 24 hours (Mon–Sat).
            </p>
          </form>
        </section>
      )}
    </>
  );
}
