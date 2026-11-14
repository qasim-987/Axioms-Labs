"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, X } from "lucide-react";
import {
  AssistantChatMessage,
  chatWithAssistant,
} from "@/lib/apiClient";

const GREETING =
  "Hi! I'm the Axioms Lab assistant. Ask me about our services, selected work, or how to start a project.";
const FALLBACK =
  "The assistant is unavailable right now. The project brief form at /contact always works.";

/**
 * Floating portfolio assistant. Stateless chat: the visible transcript is sent to
 * POST /api/assistant/chat (Express -> Gemini, grounded in the live catalog) and one
 * reply comes back. The API key never reaches the browser.
 */
export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

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
      const res = await chatWithAssistant({ messages: next.slice(-12) });
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close the Axioms Lab assistant" : "Chat with the Axioms Lab assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#121317] text-white shadow-lg transition-colors hover:bg-[#3186FF] focus:outline-none focus:ring-2 focus:ring-[#3186FF] motion-reduce:transition-none"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <section
          aria-label="Axioms Lab assistant chat"
          className="fixed bottom-24 right-5 z-[60] flex h-[min(70vh,32rem)] w-[min(calc(100vw-2.5rem),24rem)] flex-col overflow-hidden rounded-2xl border border-[#212226]/10 bg-white shadow-2xl"
        >
          <header className="bg-[#121317] px-4 py-3 text-white">
            <p className="text-sm font-semibold">Axioms Lab Assistant</p>
            <p className="font-mono text-[11px] text-white/60">
              Answers from our live service catalog
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
          </div>

          <form onSubmit={send} className="border-t border-[#212226]/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1500}
                placeholder="Ask about services, work, pricing approach…"
                aria-label="Message the Axioms Lab assistant"
                className="min-w-0 flex-1 rounded-xl border border-[#212226]/15 bg-[#F8F9FC] px-3 py-2 text-sm text-[#121317] placeholder:text-[#6A6A71] focus:border-[#3186FF] focus:outline-none"
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
              Need a quote?{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#3186FF] underline underline-offset-2"
              >
                Start a project brief
              </Link>{" "}
              — reply within 24 hours (Mon–Sat).
            </p>
          </form>
        </section>
      )}
    </>
  );
}
