export interface BackendVendorPlatform {
  name: string;
  provider: string;
  flagshipModel: string;
  deploymentModels: ("SaaS" | "Dedicated VPC" | "On-Prem / Self-Hosted")[];
  contextWindow: string;
  medianLatencyMs: number;
  dataPrivacyPolicy:
    | "Zero Data Retention"
    | "Configurable Opt-Out"
    | "Enterprise BAA Only";
  hipaaCompliant: boolean;
  soc2Type2: boolean;
  pqcReady: boolean;
  toolCallingAccuracy: string;
  bestFitFor: string;
}

export const VENDOR_PLATFORMS: BackendVendorPlatform[] = [
  {
    name: "OpenAI Enterprise",
    provider: "OpenAI",
    flagshipModel: "GPT-4o / o1-preview",
    deploymentModels: ["SaaS", "Dedicated VPC"],
    contextWindow: "128k Tokens",
    medianLatencyMs: 120,
    dataPrivacyPolicy: "Zero Data Retention",
    hipaaCompliant: true,
    soc2Type2: true,
    pqcReady: false,
    toolCallingAccuracy: "96.4%",
    bestFitFor:
      "Complex reasoning, general-purpose enterprise assistants, and code generation",
  },
  {
    name: "Anthropic Claude Enterprise",
    provider: "Anthropic",
    flagshipModel: "Claude 3.5 Sonnet",
    deploymentModels: ["SaaS", "Dedicated VPC"],
    contextWindow: "200k Tokens",
    medianLatencyMs: 145,
    dataPrivacyPolicy: "Zero Data Retention",
    hipaaCompliant: true,
    soc2Type2: true,
    pqcReady: false,
    toolCallingAccuracy: "97.2%",
    bestFitFor:
      "Extensive context retrieval, complex code refactoring, and deterministic document analysis",
  },
  {
    name: "AWS Bedrock",
    provider: "Amazon Web Services",
    flagshipModel: "Claude 3.5 / Llama 3.1 405B",
    deploymentModels: ["SaaS", "Dedicated VPC"],
    contextWindow: "200k Tokens",
    medianLatencyMs: 135,
    dataPrivacyPolicy: "Zero Data Retention",
    hipaaCompliant: true,
    soc2Type2: true,
    pqcReady: true,
    toolCallingAccuracy: "95.8%",
    bestFitFor:
      "Enterprises with existing AWS VPC workloads requiring native IAM and CloudWatch integration",
  },
  {
    name: "Google Vertex AI",
    provider: "Google Cloud",
    flagshipModel: "Gemini 1.5 Pro",
    deploymentModels: ["SaaS", "Dedicated VPC"],
    contextWindow: "2,000k Tokens",
    medianLatencyMs: 160,
    dataPrivacyPolicy: "Zero Data Retention",
    hipaaCompliant: true,
    soc2Type2: true,
    pqcReady: true,
    toolCallingAccuracy: "94.9%",
    bestFitFor:
      "Massive context audio/video processing and native Google Workspace ecosystem sync",
  },
  {
    name: "Azure OpenAI Service",
    provider: "Microsoft Azure",
    flagshipModel: "GPT-4o",
    deploymentModels: ["SaaS", "Dedicated VPC"],
    contextWindow: "128k Tokens",
    medianLatencyMs: 125,
    dataPrivacyPolicy: "Zero Data Retention",
    hipaaCompliant: true,
    soc2Type2: true,
    pqcReady: true,
    toolCallingAccuracy: "96.1%",
    bestFitFor:
      "Strict corporate governance, FedRAMP authorization, and Microsoft 365 enterprise tenants",
  },
  {
    name: "Cohere Private Cloud",
    provider: "Cohere",
    flagshipModel: "Command R+",
    deploymentModels: ["Dedicated VPC", "On-Prem / Self-Hosted"],
    contextWindow: "128k Tokens",
    medianLatencyMs: 95,
    dataPrivacyPolicy: "Zero Data Retention",
    hipaaCompliant: true,
    soc2Type2: true,
    pqcReady: false,
    toolCallingAccuracy: "93.7%",
    bestFitFor:
      "Multilingual enterprise search, reranking pipelines, and self-hosted on-premises deployments",
  },
  {
    name: "vLLM / Open Weights Sovereign",
    provider: "Self-Hosted (Axiom Studio Architecture)",
    flagshipModel: "Llama 3.3 70B / Qwen 2.5 72B",
    deploymentModels: ["On-Prem / Self-Hosted"],
    contextWindow: "128k Tokens",
    medianLatencyMs: 65,
    dataPrivacyPolicy: "Zero Data Retention",
    hipaaCompliant: true,
    soc2Type2: true,
    pqcReady: true,
    toolCallingAccuracy: "95.1%",
    bestFitFor:
      "Sovereign data perimeters, defense, critical banking, and zero-dependency cloud isolation",
  },
];

function escapeCsvCell(value: string | number | boolean): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateVendorMatrixCsv(
  rows: BackendVendorPlatform[] = VENDOR_PLATFORMS
): string {
  const headers = [
    "Platform Name",
    "Provider",
    "Flagship Model",
    "Deployment Models",
    "Context Window",
    "Median Latency (ms)",
    "Data Privacy Policy",
    "HIPAA Compliant",
    "SOC2 Type II",
    "PQC Ready",
    "Tool Calling Accuracy",
    "Best Fit For",
  ];

  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((v) =>
      [
        v.name,
        v.provider,
        v.flagshipModel,
        v.deploymentModels.join(" | "),
        v.contextWindow,
        v.medianLatencyMs,
        v.dataPrivacyPolicy,
        v.hipaaCompliant ? "Yes" : "No",
        v.soc2Type2 ? "Yes" : "No",
        v.pqcReady ? "Yes" : "No",
        v.toolCallingAccuracy,
        v.bestFitFor,
      ]
        .map(escapeCsvCell)
        .join(",")
    ),
  ];

  return lines.join("\n");
}
