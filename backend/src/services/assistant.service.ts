import { env } from "../config/env";
import type { AssistantMessage } from "../schemas/assistant.schema";
import { STUDIO_LOCATIONS, STUDIO_SERVICES } from "./catalog.service";

/**
 * Portfolio assistant grounding + Groq transport.
 *
 * Design rules:
 *  - The model sees ONLY the facts below (live catalog, hubs, public URLs) plus the
 *    visible transcript. No database, no secrets, no browsing.
 *  - Honesty policy is enforced in the system prompt: never promise rankings or
 *    guarantees, label targets as targets, quote nothing that is not published.
 *  - The API key lives only in backend env (GROQ_API_KEY); the browser never sees it.
 *
 * Provider history: the assistant launched on Google Gemini (free tier). Production
 * logs showed repeated blind 503s whose root cause stayed unconfirmed even after two
 * hardening passes, so the owner switched the provider to Groq (OpenAI-compatible
 * chat completions, fast inference, free tier with per-model rate limits).
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

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
interface GroqChatResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string; type?: string; code?: string };
}

export type AssistantFailureKind = "config" | "quota" | "timeout" | "upstream";

export class AssistantUnavailableError extends Error {
  kind: AssistantFailureKind;
  constructor(kind: AssistantFailureKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

function toGroqMessages(messages: AssistantMessage[]): GroqMessage[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));
}

/**
 * Free-tier Groq catalog (verified against Groq's published free model list,
 * Oct 2026): all three below are free with per-model rate limits.
 *  - llama-3.3-70b-versatile: best quality, 30 rpm / 1,000 req-day
 *  - llama-3.1-8b-instant:    fastest + most generous, 30 rpm / 14,400 req-day
 *  - openai/gpt-oss-20b:      different model family, diversifies the chain
 * Groq adjusts the free catalog without notice, so a 404 simply advances the
 * chain instead of failing the visitor's turn.
 */
const MODEL_FALLBACKS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-20b",
];

/**
 * Channel-neutral assistant contract: a transcript goes in, one reply text
 * comes out. The web widget route uses it today; a WhatsApp bridge can call
 * the same {role, content} shape tomorrow.
 */
export async function getAssistantReply(messages: AssistantMessage[]): Promise<string> {
  if (!env.groqApiKey) {
    throw new AssistantUnavailableError("config", "GROQ_API_KEY is not configured");
  }

  const candidates = [
    env.groqModel,
    ...MODEL_FALLBACKS.filter((m) => m !== env.groqModel),
  ];

  /**
   * Every attempt owns its 45s abort budget so retries and model failover get
   * fresh timers. The original shared 20s timer produced blind AbortErrors,
   * confirmed by the 20.02s request->failure delta in production logs.
   * max_tokens keeps replies short (the widget UX wants 2-4 sentences) and
   * temperature stays mild so grounding facts are not paraphrased away.
   */
  const post = async (model: string, chat: GroqMessage[]): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      return await fetch(`${env.groqBaseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.groqApiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: chat,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });
    } catch (err) {
      if (controller.signal.aborted) {
        throw new AssistantUnavailableError(
          "timeout",
          "Groq request timed out after 45 seconds"
        );
      }
      // Keep transport diagnostics useful without logging the request or key.
      const failure = err as { name?: string; cause?: { code?: string } };
      const transportCode = failure?.cause?.code || failure?.name || "unknown";
      throw new AssistantUnavailableError(
        "upstream",
        `Groq transport failed (${transportCode})`
      );
    } finally {
      clearTimeout(timer);
    }
  };

  let lastError = "Groq request failed";
  let quotaSeen = false;
  for (let i = 0; i < candidates.length; i++) {
    let chat: GroqMessage[] = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\n${buildGrounding()}` },
      ...toGroqMessages(messages),
    ];
    let res: Response;
    try {
      res = await post(candidates[i], chat);
    } catch (e) {
      if (
        e instanceof AssistantUnavailableError &&
        e.kind === "timeout" &&
        messages.length > 1
      ) {
        // A slow multi-turn call gets one fresh-timer retry with only the
        // latest user message before we give up on this model.
        console.warn(
          JSON.stringify({
            event: "ASSISTANT_TIMEOUT_RETRY_SINGLE_TURN",
            model: candidates[i],
            timestamp: new Date().toISOString(),
          })
        );
        chat = [chat[0], ...toGroqMessages(messages.slice(-1))];
        try {
          res = await post(candidates[i], chat);
        } catch (e2) {
          if (e2 instanceof AssistantUnavailableError && e2.kind === "timeout") {
            console.warn(
              JSON.stringify({
                event: "ASSISTANT_MODEL_FAILOVER",
                from: candidates[i],
                reason: "timeout",
                timestamp: new Date().toISOString(),
              })
            );
            lastError = e2.message;
            continue;
          }
          throw e2;
        }
      } else {
        throw e;
      }
    }

    if (res.status === 401 || res.status === 403) {
      // A rejected key fails every model, so fail fast with a config kind.
      throw new AssistantUnavailableError(
        "config",
        `Groq API key rejected (HTTP ${res.status})`
      );
    }
    if (res.status === 404) {
      console.warn(
        JSON.stringify({
          event: "ASSISTANT_MODEL_FAILOVER",
          from: candidates[i],
          reason: "model_not_found",
          timestamp: new Date().toISOString(),
        })
      );
      lastError = `model ${candidates[i]} unavailable, fallback tried`;
      continue;
    }
    if (res.status === 429) {
      // Groq rate limits are per model: another free model may still answer.
      quotaSeen = true;
      console.warn(
        JSON.stringify({
          event: "ASSISTANT_MODEL_FAILOVER",
          from: candidates[i],
          reason: "rate_limited",
          timestamp: new Date().toISOString(),
        })
      );
      lastError = `model ${candidates[i]} rate limited (429)`;
      continue;
    }
    if (!res.ok) {
      const errBody = (await res.json().catch(() => null)) as GroqChatResponse | null;
      throw new AssistantUnavailableError(
        "upstream",
        errBody?.error?.message || `Groq HTTP ${res.status}`
      );
    }

    let body: GroqChatResponse;
    try {
      body = (await res.json()) as GroqChatResponse;
    } catch {
      throw new AssistantUnavailableError("upstream", "Malformed Groq response body");
    }
    const text = (body.choices?.[0]?.message?.content || "").trim();
    if (!text) {
      throw new AssistantUnavailableError("upstream", "Empty Groq response");
    }
    return text;
  }
  if (quotaSeen) {
    throw new AssistantUnavailableError("quota", "Groq quota exceeded (429)");
  }
  throw new AssistantUnavailableError("upstream", lastError);
}
