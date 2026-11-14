import { env } from "../config/env";
import type { AssistantMessage } from "../schemas/assistant.schema";
import { STUDIO_LOCATIONS, STUDIO_SERVICES } from "./catalog.service";

/**
 * Portfolio assistant grounding + Google Gemini transport.
 *
 * Design rules:
 *  - The model sees ONLY the facts below (live catalog, hubs, public URLs) plus the
 *    visible transcript. No database, no secrets, no browsing.
 *  - Honesty policy is enforced in the system prompt: never promise rankings or
 *    guarantees, label targets as targets, quote nothing that is not published.
 *  - The API key lives only in backend env (GEMINI_API_KEY); the browser never sees it.
 */

const CONCEPT_AND_CLIENT_WORK = [
  "Kuopio Bites — LIVE CLIENT PRODUCT, food & beverage industry: production website for a restaurant in Kuopio, Finland (kuopiobites.fi) with menu deep-links and delivery-platform links",
  "FinFlow — CONCEPT PROJECT (not a client delivery), fintech / SaaS industry: multi-theme design-system & workspace UI/UX (/work/finflow-design-system)",
  "Atlas — CONCEPT PROJECT (not a client delivery), customer-support automation: autonomous support & lead-qualification AI agent (/work/atlas-ai-agent)",
  "Aura — CONCEPT PROJECT (not a client delivery), brand & motion / interactive web: interactive brand flagship (/work/aura-web-experience)",
];

function buildGrounding(): string {
  const services = STUDIO_SERVICES.map(
    (s) => `- ${s.title} (${s.badge}): ${s.summary} Stack: ${s.stack.join(", ")}. Page: /services/${s.slug}`
  ).join("\n");
  const hubs = STUDIO_LOCATIONS.map((l) => `- ${l.city}, ${l.country} (${l.timezone}): ${l.role}`).join("\n");
  return [
    "FACTS ABOUT AXIOMS LAB (use only these; if something is not here, say you are not sure and point to /contact):",
    services,
    "HUBS:",
    hubs,
    "SELECTED WORK:",
    CONCEPT_AND_CLIENT_WORK.map((w) => `- ${w}`).join("\n"),
    "OTHER FACTS: contact email info@axiomslab.com; project briefs via /contact with a reply within 24 hours (Mon-Sat); site sections: /services, /work, /company, /blog, /contact.",
  ].join("\n");
}

const SYSTEM_PROMPT = `You are the Axioms Lab portfolio assistant, a concise helper embedded on axiomslab.com.

Rules:
1. Answer ONLY about Axioms Lab: its services, selected work, process, hubs, and how to start a project. For anything else, decline in one friendly sentence and steer back to the portfolio.
1b. You are an AI assistant, not a human. Never imply you are a person; if asked, say you are Axioms Lab's AI assistant.
1c. Structure every reply as: answer the visitor's question first, then ask at most ONE relevant follow-up question that moves the conversation forward. Never stack multiple questions.
2. Ground every claim in the FACTS block. Never invent prices, dates, client names, metrics, or outcomes. Performance numbers you mention must be called "targets" or "lab results", never guarantees.
3. Never promise search rankings, traffic, or business results.
3b. All prices and delivery dates are unconfirmed: never quote a price, estimate, or delivery date yourself. Refer those to the team via /contact (reply within 24 hours, Mon-Sat).
4. Keep replies to 2-4 short sentences of plain text (no markdown, no bullet lists) unless the user asks for a list.
5. When the visitor describes a project or asks for a quote, say the fastest path is the project brief form at /contact (reply within 24 hours, Mon-Sat) and offer to summarise what they told you so they can paste it there.
6. If the FACTS block does not cover a question, say you are not sure rather than guessing.`;

interface GeminiPart {
  text?: string;
}
interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

export type AssistantFailureKind = "config" | "quota" | "upstream" | "timeout";

export class AssistantUnavailableError extends Error {
  kind: AssistantFailureKind;
  constructor(kind: AssistantFailureKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

function toGeminiContents(messages: AssistantMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/**
 * Channel-neutral assistant contract: a transcript goes in, one reply text comes
 * out. No HTTP framework types touch this function, so any channel — the web
 * widget route today, a WhatsApp bridge tomorrow — calls getAssistantReply()
 * with the same {role, content} message shape and handles AssistantUnavailableError.
 */
/**
 * Model candidates in order. Gemini retires model generations over time (the
 * 2.5 line is gone as of late 2026); if the configured model 404s we retry the
 * next free-tier candidate so a retirement never silently kills the widget.
 */
const MODEL_FALLBACKS = ["gemini-3.8-flash", "gemini-4-hydrogen"];

export async function getAssistantReply(messages: AssistantMessage[]): Promise<string> {
  if (!env.geminiApiKey) {
    throw new AssistantUnavailableError("config", "GEMINI_API_KEY is not configured");
  }

  const candidates = [
    env.geminiModel,
    ...MODEL_FALLBACKS.filter((m) => m !== env.geminiModel),
  ];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  /**
   * Gemini 3.8 migration notes (official docs, Nov 2026):
   *  - temperature/top_p/top_k are deprecated for Gemini 3.6+ and ignored with
   *    deprecation warning headers -> removed from generationConfig entirely.
   *  - HYPOTHESIS (docs-plausible, runtime evidence pending): max_output_tokens
   *    counts THINKING tokens on thinking models, so a small cap could truncate
   *    reasoning and yield empty replies; raised to 2048 as a precaution. The
   *    smoke test and runtime logs are the evidence that confirms or retires this.
   *  - stateless multi-turn with thinking models may reject history that lacks
   *    thought signatures (400); on 400 we retry once with only the newest user
   *    message so a signature policy change degrades to single-turn, not outage.
   */
  const post = async (model: string, contents: GeminiContent[]): Promise<Response> => {
    try {
      return await fetch(
        `${env.geminiBaseUrl}/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.geminiApiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildGrounding()}` }] },
            contents,
            generationConfig: { maxOutputTokens: 2048 },
          }),
        }
      );
    } catch (e) {
      // AbortError = our 30s guard fired; anything else is a transport failure.
      if (e instanceof Error && e.name === "AbortError") {
        throw new AssistantUnavailableError("timeout", "Gemini request timed out");
      }
      throw new AssistantUnavailableError(
        "upstream",
        `Gemini unreachable: ${e instanceof Error ? `${e.name}: ${e.message}` : "network error"}`
      );
    }
  };

  try {
    let lastError = "Gemini request failed";
    for (let i = 0; i < candidates.length; i++) {
      let contents = toGeminiContents(messages);
      let res = await post(candidates[i], contents);

      if (res.status === 400 && contents.length > 1) {
        // Narrowed retry: ONLY confirmed history/signature rejections fall back
        // to single-turn (the visitor's newest question is always preserved).
        // Any other 400 is a real request bug and must surface verbatim.
        const badBody = (await res.json().catch(() => null)) as GeminiResponse | null;
        const badMsg = badBody?.error?.message || "";
        if (/signature|thought|history/i.test(badMsg)) {
          console.warn(
            JSON.stringify({
              event: "ASSISTANT_HISTORY_REJECTED",
              model: candidates[i],
              geminiMessage: badMsg,
              timestamp: new Date().toISOString(),
            })
          );
          contents = toGeminiContents(messages.slice(-1));
          res = await post(candidates[i], contents);
        } else {
          throw new AssistantUnavailableError(
            "upstream",
            badMsg || "Gemini HTTP 400"
          );
        }
      }

      if (res.status === 404 && i < candidates.length - 1) {
        lastError = `model ${candidates[i]} unavailable, fallback tried`;
        continue;
      }
      if (res.status === 429) {
        throw new AssistantUnavailableError("quota", "Gemini quota exceeded (429)");
      }
      if (!res.ok) {
        const errBody = (await res.json().catch(() => null)) as GeminiResponse | null;
        throw new AssistantUnavailableError(
          "upstream",
          errBody?.error?.message || `Gemini HTTP ${res.status}`
        );
      }

      let body: GeminiResponse;
      try {
        body = (await res.json()) as GeminiResponse;
      } catch {
        throw new AssistantUnavailableError("upstream", "Malformed Gemini response body");
      }
      const text = (body.candidates?.[0]?.content?.parts || [])
        .map((p) => p.text || "")
        .join("")
        .trim();
      if (!text) {
        throw new AssistantUnavailableError("upstream", "Empty Gemini response");
      }
      return text;
    }
    throw new AssistantUnavailableError("upstream", lastError);
  } finally {
    clearTimeout(timer);
  }
}
