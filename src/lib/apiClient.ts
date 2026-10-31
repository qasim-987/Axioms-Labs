/**
 * Axiom Studio — Typed Front-End HTTP Client
 * Communicates strictly via relative `/api/*` paths (proxied by Next.js rewrites
 * to the standalone Axiom Studio Backend Server on port 4000).
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    // Reverse proxies can return HTML errors; never show those to visitors.
    const raw: unknown = await res.json().catch(() => null);
    const body = typeof raw === "object" && raw !== null ? raw : {};
    const success = res.ok && "success" in body && body.success === true;
    const data: ContactSubmissionResponse = {
      success,
      message: "message" in body && typeof body.message === "string" ? body.message : "",
      receivedAt: "receivedAt" in body && typeof body.receivedAt === "string" ? body.receivedAt : "",
      inquiryId: "inquiryId" in body && typeof body.inquiryId === "string" ? body.inquiryId : undefined,
      error: "error" in body && typeof body.error === "string" ? body.error : success ? undefined : "Unable to submit your inquiry. Please try again or email contact@axiomstudio.agency.",
    };
    return { ok: success, status: res.status, data };
  } finally {
    clearTimeout(timeout);
  }
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
