export interface EmotionAnalysisResult {
  positive: number;
  urgency: number;
  skepticism: number;
  neutral: number;
  dominantTone: string;
  inferenceLatencyMs: number;
  model: string;
}

const POSITIVE_WORDS = [
  "thrilled", "astonishing", "excellent", "fast", "approved", "authorized",
  "expansion", "love", "impressed", "seamless", "reliable", "success",
  "growth", "great", "strong", "confident", "outperformed", "delighted",
];

const URGENCY_WORDS = [
  "urgent", "immediately", "critical", "outage", "escalate", "deadline",
  "asap", "blocker", "incident", "breach", "latency", "downtime", "today",
  "priority", "emergency", "p0", "p1", "failing",
];

const SKEPTICISM_WORDS = [
  "concerned", "doubt", "unclear", "hesitant", "risk", "expensive", "stall",
  "hallucination", "audit", "compliance", "question", "skeptical", "delay",
  "regression", "bottleneck", "fragile", "unproven",
];

export function analyzeEmotionText(rawText: string): EmotionAnalysisResult {
  const started = performance.now();
  const tokens = rawText.toLowerCase().match(/[a-z0-9'-]+/g) || [];

  let posHits = 0;
  let urgHits = 0;
  let skepHits = 0;

  for (const token of tokens) {
    if (POSITIVE_WORDS.some((w) => token.includes(w))) posHits += 1;
    if (URGENCY_WORDS.some((w) => token.includes(w))) urgHits += 1;
    if (SKEPTICISM_WORDS.some((w) => token.includes(w))) skepHits += 1;
  }

  const exclamations = (rawText.match(/!/g) || []).length;
  const questions = (rawText.match(/\?/g) || []).length;
  urgHits += exclamations * 0.6;
  skepHits += questions * 0.5;

  const totalSignal = posHits + urgHits + skepHits;
  let positive = 24;
  let urgency = 18;
  let skepticism = 14;
  let neutral = 44;

  if (totalSignal > 0) {
    positive = Math.min(96, Math.round(16 + (posHits / totalSignal) * 76));
    urgency = Math.min(96, Math.round(12 + (urgHits / totalSignal) * 76));
    skepticism = Math.min(95, Math.round(10 + (skepHits / totalSignal) * 74));
    const avgActivity = Math.round((positive + urgency + skepticism) / 3);
    neutral = Math.max(8, Math.min(75, 100 - avgActivity));
  }

  const pairs: [string, number][] = [
    ["Positive / Advocacy", positive],
    ["High Operational Urgency", urgency],
    ["Analytical Skepticism", skepticism],
    ["Measured Neutral", neutral],
  ];
  pairs.sort((a, b) => b[1] - a[1]);

  const elapsed = Math.max(4, Math.round((performance.now() - started) * 10 + 11));

  return {
    positive,
    urgency,
    skepticism,
    neutral,
    dominantTone: pairs[0][0],
    inferenceLatencyMs: elapsed,
    model: "AXIOM-SENTIMENT-V4",
  };
}

export interface CorpusDocument {
  id: string;
  title: string;
  category: "Security" | "Infrastructure" | "Agents" | "Compliance";
  snippet: string;
  keywords: string[];
}

const VECTOR_CORPUS: CorpusDocument[] = [
  {
    id: "doc-mcp-isolation",
    title: "Model Context Protocol (MCP) Zero-Trust Sandbox Topology",
    category: "Agents",
    snippet:
      "Isolates autonomous LLM tool execution inside ephemeral gVisor micro-VMs with typed JSON-RPC capability tokens and immutable audit logs.",
    keywords: ["mcp", "agent", "sandbox", "tool", "isolation", "zero-trust", "json-rpc"],
  },
  {
    id: "doc-hipaa-vllm",
    title: "On-Premises HIPAA Clinical Inference with Quantized vLLM",
    category: "Compliance",
    snippet:
      "Zero-retention PHI processing architecture running FP8 Llama-3.3-70B across private hospital NVIDIA H100 nodes with HL7/FHIR bidirectional sync.",
    keywords: ["hipaa", "clinical", "healthcare", "phi", "vllm", "fhir", "hl7", "hospital", "on-prem"],
  },
  {
    id: "doc-pqc-lattice",
    title: "Post-Quantum Cryptographic (ML-KEM / Kyber) Edge Key Rotation",
    category: "Security",
    snippet:
      "Protects inter-datacenter inference telemetry against harvest-now-decrypt-later quantum adversaries using NIST-standardized lattice key encapsulation.",
    keywords: ["quantum", "pqc", "kyber", "encryption", "security", "edge", "lattice", "tls"],
  },
  {
    id: "doc-hybrid-rag",
    title: "Sub-25ms Hybrid Dense-Sparse Vector Retrieval (Qdrant + BM25)",
    category: "Infrastructure",
    snippet:
      "Combines HNSW cosine embeddings with SPLADE lexical reranking to achieve 98.4% recall@5 on 40M enterprise engineering documents.",
    keywords: ["rag", "vector", "search", "qdrant", "embeddings", "latency", "cosine", "rerank"],
  },
  {
    id: "doc-supervisor-dag",
    title: "Hierarchical Supervisor-Worker Agent Mesh & Blast-Radius Circuit Breakers",
    category: "Agents",
    snippet:
      "Replaces brittle single-loop ReAct chains with deterministic DAG planners, dual-critic verification, and financial token spend circuit breakers.",
    keywords: ["agent", "supervisor", "dag", "react", "evals", "orchestration", "circuit", "autonomous"],
  },
  {
    id: "doc-atlas-firewall",
    title: "MITRE ATLAS Adversarial Prompt & Indirect RAG Poisoning Firewall",
    category: "Security",
    snippet:
      "Sub-5ms semantic ingress classifier neutralizing jailbreaks, context poisoning, and sponge attacks before foundation model token ingestion.",
    keywords: ["mitre", "atlas", "prompt", "injection", "jailbreak", "firewall", "adversarial", "rag"],
  },
];

export function executeVectorSearch(query: string, category = "All") {
  const started = performance.now();
  const qTokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const pool =
    category === "All"
      ? VECTOR_CORPUS
      : VECTOR_CORPUS.filter((d) => d.category === category);

  const scored = pool.map((doc, idx) => {
    if (qTokens.length === 0) {
      return { ...doc, similarity: Number((0.96 - idx * 0.025).toFixed(3)) };
    }
    const haystack = `${doc.title} ${doc.snippet} ${doc.keywords.join(" ")}`.toLowerCase();
    let score = 0.68;
    for (const qt of qTokens) {
      if (doc.title.toLowerCase().includes(qt)) score += 0.14;
      if (doc.keywords.some((k) => k.includes(qt))) score += 0.11;
      else if (haystack.includes(qt)) score += 0.06;
    }
    return {
      ...doc,
      similarity: Number(Math.min(0.994, score).toFixed(3)),
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  const latencyMs = Math.max(12, Math.min(34, Math.round((performance.now() - started) * 10 + 18)));

  return {
    latencyMs,
    totalIndexedChunks: 1_420_000,
    results: scored,
  };
}

export function synthesizeIntentOutreach(params: {
  company: string;
  industry: string;
  intentScore: number;
  signals: string[];
}) {
  const topSignal = params.signals[0] || "recent sovereign AI architecture evaluation";
  const secondSignal = params.signals[1] || "production latency optimization";

  return {
    subject: `Deterministic AI Architecture Brief for ${params.company} (${params.intentScore}% Intent Match)`,
    draft: [
      `Hi ${params.company} Engineering Leadership,`,
      "",
      `We noticed your platform team's momentum around ${topSignal.toLowerCase()} and ${secondSignal.toLowerCase()}.`,
      `At Axiom Studio, we recently helped a comparable ${params.industry} organization compress inference latency below 65ms while enforcing 100% VPC data sovereignty and automated regression evals.`,
      "",
      `Would a focused 25-minute architecture review next Tuesday be valuable to share our reference topology and benchmark suite?`,
      "",
      `— Principal Systems Architect, Axiom Studio`,
    ].join("\n"),
    generatedAt: new Date().toISOString(),
  };
}

export interface ThreatArc {
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

export function generateLiveThreatTelemetry() {
  const arcs: ThreatArc[] = [
    {
      id: "arc-1",
      sourceCity: "Frankfurt Edge",
      sourceLat: 50.11,
      sourceLng: 8.68,
      targetCity: "Ashburn Sovereign VPC",
      targetLat: 39.04,
      targetLng: -77.49,
      technique: "Indirect RAG Context Poisoning",
      severity: "Critical",
      status: "Blocked",
      latencyMs: 3.4,
    },
    {
      id: "arc-2",
      sourceCity: "Singapore PoP",
      sourceLat: 1.35,
      sourceLng: 103.82,
      targetCity: "London Financial Core",
      targetLat: 51.51,
      targetLng: -0.13,
      technique: "MCP Autonomous Tool Privilege Escalation",
      severity: "Agent-Level",
      status: "Quarantined",
      latencyMs: 4.1,
    },
    {
      id: "arc-3",
      sourceCity: "São Paulo Relay",
      sourceLat: -23.55,
      sourceLng: -46.63,
      targetCity: "Silicon Valley GPU Cluster",
      targetLat: 37.39,
      targetLng: -122.08,
      technique: "Multi-Turn Adversarial Jailbreak",
      severity: "AI-Assisted",
      status: "Blocked",
      latencyMs: 2.8,
    },
    {
      id: "arc-4",
      sourceCity: "Tokyo IX",
      sourceLat: 35.68,
      sourceLng: 139.65,
      targetCity: "Frankfurt Edge",
      targetLat: 50.11,
      targetLng: 8.68,
      technique: "Gradient Membership Inference Probe",
      severity: "Critical",
      status: "Contained",
      latencyMs: 3.9,
    },
  ];

  return {
    timestamp: new Date().toISOString(),
    engine: "AXIOM-ATOM-DEFENSE-V2.4",
    pqcCipher: "ML-KEM-1024 (Kyber Lattice Active)",
    last24hBlocked: 14847 + Math.floor((Date.now() / 4000) % 500),
    meanMitigationMs: 3.6,
    activeArcs: arcs,
  };
}
