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
  "Kuopio Bites — live production website for a restaurant in Kuopio, Finland (kuopiobites.fi), listed under /work with honest 'live product' labels",
  "FinFlow — multi-theme SaaS UI/UX design-system concept (/work/finflow-design-system)",
  "Atlas — autonomous support & lead-qualification AI agent concept (/work/atlas-ai-agent)",
  "Aura — interactive brand & motion flagship concept (/work/aura-web-experience)",
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
2. Ground every claim in the FACTS block. Never invent prices, dates, client names, metrics, or outcomes. Performance numbers you mention must be called "targets" or "lab results", never guarantees.
3. Never promise search rankings, traffic, or business results.
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

export class AssistantUnavailableError extends Error {}

function toGeminiContents(messages: AssistantMessage[]): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

/** One stateless Gemini generateContent call with a hard timeout. */
export async function chatWithGemini(messages: AssistantMessage[]): Promise<string> {
  if (!env.geminiApiKey) {
    throw new AssistantUnavailableError("GEMINI_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.geminiApiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n${buildGrounding()}` }] },
          contents: toGeminiContents(messages),
          generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
        }),
      }
    );

    if (res.status === 429) {
      throw new AssistantUnavailableError("Gemini quota exceeded (429)");
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as GeminiResponse | null;
      throw new AssistantUnavailableError(body?.error?.message || `Gemini HTTP ${res.status}`);
    }

    const body = (await res.json()) as GeminiResponse;
    const text = (body.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();
    if (!text) {
      throw new AssistantUnavailableError("Empty Gemini response");
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}
