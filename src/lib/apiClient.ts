/**
 * Axioms Lab — Typed Front-End HTTP Client
 * Communicates strictly via relative `/api/*` paths (proxied by Next.js rewrites
 * to the standalone Axioms Lab Backend Server on port 4000).
 */

export interface ContactSubmissionInput {
  firstName: string;
  lastName?: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  source?: string;
  botField?: string;
  websiteUrl?: string;
  formLoadedAt?: number;
  phone?: string;
  countryCode?: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  inquiryId?: string;
  message: string;
  receivedAt: string;
  deliveryChannels?: string[];
  error?: string;
}

export interface BackendHealthStatus {
  status: "operational" | "offline";
  service?: string;
  version?: string;
  uptimeSeconds?: number;
  latencyMs?: number;
}

export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  const started = performance.now();
  try {
    const res = await fetch("/api/health", {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return { status: "offline" };
    const data = await res.json();
    return {
      status: "operational",
      service: data.service,
      version: data.version,
      uptimeSeconds: data.uptimeSeconds,
      latencyMs: Math.max(1, Math.round(performance.now() - started)),
    };
  } catch {
    return { status: "offline" };
  }
}

export async function submitContactInquiry(
  payload: ContactSubmissionInput
): Promise<{ ok: boolean; status: number; data: ContactSubmissionResponse }> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Rollout compatibility: existing backend deployments accept the historical
    // design label; updated backends normalize it to UI/UX Web Design.
    body: JSON.stringify({ ...payload, service: payload.service === "UI/UX Web Design" ? "UI/UX Design" : payload.service }),
  });

  const data = (await res.json()) as ContactSubmissionResponse;
  return { ok: res.ok, status: res.status, data };
}

export interface EmotionApiResponse {
  positive: number;
  urgency: number;
  skepticism: number;
  neutral: number;
  dominantTone: string;
  inferenceLatencyMs: number;
  model: string;
}

export async function analyzeEmotionViaApi(
  text: string
): Promise<EmotionApiResponse | null> {
  try {
    const res = await fetch("/api/labs/emotion-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    return (await res.json()) as EmotionApiResponse;
  } catch {
    return null;
  }
}

export interface VectorSearchHit {
  id: string;
  title: string;
  category: "Security" | "Infrastructure" | "Agents" | "Compliance";
  snippet: string;
  keywords: string[];
  similarity: number;
}

export interface VectorSearchApiResponse {
  latencyMs: number;
  totalIndexedChunks: number;
  results: VectorSearchHit[];
}

export async function searchVectorsViaApi(
  query: string,
  category: string
): Promise<VectorSearchApiResponse | null> {
  try {
    const res = await fetch("/api/labs/vector-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, category }),
    });
    if (!res.ok) return null;
    return (await res.json()) as VectorSearchApiResponse;
  } catch {
    return null;
  }
}

export async function synthesizeOutreachViaApi(params: {
  company: string;
  industry: string;
  intentScore: number;
  signals: string[];
}): Promise<{ subject: string; draft: string; generatedAt: string } | null> {
  try {
    const res = await fetch("/api/labs/intent-outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface ThreatArcTelemetry {
  id: string;
  sourceCity: string;
  sourceLat: number;
  sourceLng: number;
  targetCity: string;
  targetLat: number;
  targetLng: number;
  technique: string;
  severity: "Critical" | "AI-Assisted" | "Agent-Level";
  status: "Blocked" | "Contained" | "Quarantined";
  latencyMs: number;
}

export interface ThreatTelemetryApiResponse {
  timestamp: string;
  engine: string;
  pqcCipher: string;
  last24hBlocked: number;
  meanMitigationMs: number;
  activeArcs: ThreatArcTelemetry[];
}

export async function fetchThreatTelemetryViaApi(): Promise<ThreatTelemetryApiResponse | null> {
  try {
    const res = await fetch("/api/labs/threat-telemetry", {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as ThreatTelemetryApiResponse;
  } catch {
    return null;
  }
}

/* ── Portfolio Assistant ─────────────────────────────────────────────── */

export interface AssistantChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Structured project-brief slots collected conversationally by the assistant. */
export interface BriefDraft {
  business?: string;
  service?: string;
  requirements?: string;
  timeline?: string;
  /** Optional by product decision. */
  budget?: string;
  contactName?: string;
  email?: string;
}

export interface AssistantChatInput {
  messages: AssistantChatMessage[];
  brief?: BriefDraft;
}

export interface AssistantChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
  brief?: BriefDraft;
}

export interface ProjectBriefSubmission extends BriefDraft {
  idempotencyKey: string;
  business: string;
  service: string;
  requirements: string;
  timeline: string;
  contactName: string;
  email: string;
}

export interface BriefSubmitResponse {
  success: boolean;
  status?: "delivered" | "already_delivered";
  code?: string;
  stored?: boolean;
  inquiryId?: string;
  error?: string;
}

/** Stateless chat turn: the visible transcript goes up, one reply comes back. */
export async function chatWithAssistant(
  input: AssistantChatInput
): Promise<AssistantChatResponse> {
  const res = await fetch("/api/assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await res.json()) as AssistantChatResponse;
}

/**
 * Confirmed project-brief submission. The idempotency key makes retries safe:
 * the backend resumes the same stored row instead of duplicating it.
 */
export async function submitProjectBrief(
  input: ProjectBriefSubmission
): Promise<BriefSubmitResponse> {
  const res = await fetch("/api/assistant/brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await res.json()) as BriefSubmitResponse;
}
