export interface ClientCaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  tagline: string;
  category: "AI Apps" | "Websites" | "Enterprise";
  impactMetric: string;
  impactLabel: string;
  year: string;
  duration: string;
  summary: string;
  challenge: string;
  solution: string;
  architectureHighlights: {
    title: string;
    description: string;
  }[];
  results: string[];
  techStack: string[];
  liveUrl?: string;
}

export const clientsData: ClientCaseStudy[] = [
  {
    id: "strata-systems",
    slug: "strata-systems",
    title: "Autonomous Cloud Incident Resolution Engine",
    client: "Strata Systems",
    tagline: "Autonomous multi-agent telemetry analysis and automated infrastructure remediation",
    category: "AI Apps",
    impactMetric: "84%",
    impactLabel: "Reduction in Mean Time to Resolution (MTTR)",
    year: "2026",
    duration: "4 Months",
    summary: "Strata Systems manages over 50,000 hybrid-cloud enterprise instances. Axiom Labs architected an autonomous multi-agent triage system that diagnoses cluster anomalies and proposes verified automated remediation in seconds.",
    challenge: "Engineering teams were paralyzed by alert fatigue across multi-cloud environments, averaging 48 minutes to correlate logs, identify root causes, and deploy patches during critical outages.",
    solution: "We engineered an autonomous triage agent mesh running on local private clusters. When an anomaly triggers, specialized agents ingest distributed traces, map historical incident post-mortems via vector embeddings, and formulate safe canary remediation plans.",
    architectureHighlights: [
      {
        title: "Autonomous Canary Verification",
        description: "Executes isolated sandbox verifications before rolling out cluster configurations to production nodes."
      },
      {
        title: "Zero-Retention Telemetry Mesh",
        description: "Distributed trace correlation without exporting proprietary log data outside tenant boundaries."
      },
      {
        title: "Deterministic Fallback Guardrails",
        description: "Strict policy engines that escalate high-blast-radius incidents to human operators with pre-compiled post-mortems."
      }
    ],
    results: [
      "84% reduction in Mean Time to Resolution (MTTR) across tier-1 incidents",
      "Saved over 520 engineering hours per month from manual alert triage",
      "99.8% autonomous accuracy with zero false-positive remediation triggers"
    ],
    techStack: ["Next.js", "Python", "FastAPI", "Temporal", "Qdrant Vector DB", "Kubernetes", "Tailwind CSS"]
  },
  {
    id: "zenith-health",
    slug: "zenith-health",
    title: "Clinician Intelligence & Real-Time Diagnostic Copilot",
    client: "Zenith Health AI",
    tagline: "HIPAA-compliant zero-latency clinical decision support and documentation copilot",
    category: "AI Apps",
    impactMetric: "78%",
    impactLabel: "Reduction in Clinical Documentation Time",
    year: "2026",
    duration: "6 Months",
    summary: "A private, zero-latency clinical intelligence platform designed for acute care physicians to instantly cross-reference patient lab history, vitals, and peer-reviewed protocols.",
    challenge: "Clinicians spent more time navigating legacy electronic health records (EHRs) than interacting with patients, causing severe documentation bottlenecks and diagnostic delays.",
    solution: "Axiom Labs crafted a secure, zero-retention EHR copilot interface with sub-100ms search, ambient transcription processing, and automated differential diagnosis suggestions vetted against gold-standard clinical guidelines.",
    architectureHighlights: [
      {
        title: "FHIR / HL7 Native Sync",
        description: "Bidirectional real-time interoperability with major health networks including Epic, Cerner, and AthenaHealth."
      },
      {
        title: "Private In-Hospital Inference",
        description: "On-premises quantized LLM deployments ensuring no protected health information (PHI) ever leaves the hospital perimeter."
      },
      {
        title: "Ambient Voice Structuring",
        description: "Zero-latency acoustic parsing of doctor-patient dialogues into structured SOAP clinical notes."
      }
    ],
    results: [
      "78% reduction in documentation time per patient encounter",
      "Over 85 minutes saved per physician per shift on clinical administrative charting",
      "Adopted across 24 regional hospital networks with 99.2% provider satisfaction"
    ],
    techStack: ["React", "TypeScript", "Tailwind CSS", "vLLM", "Rust", "WebSockets", "HL7/FHIR"]
  },
  {
    id: "vortex-capital",
    slug: "vortex-capital",
    title: "High-Frequency Market Sentiment & Execution Engine",
    client: "Vortex Capital",
    tagline: "Ultra-low-latency financial intelligence and multimodal news stream analysis",
    category: "Enterprise",
    impactMetric: "<12ms",
    impactLabel: "End-to-End News Ingestion & Signal Latency",
    year: "2025",
    duration: "5 Months",
    summary: "Institutional quantitative fund requiring real-time sentiment scoring across global earnings call transcripts, regulatory filings, and central bank communications.",
    challenge: "Traditional NLP models introduced unacceptable latency (over 1.5 seconds) and suffered hallucination when parsing nuanced central bank policy statements and bond yields.",
    solution: "We designed a custom C++ inference pipeline paired with custom-trained transformer embeddings that converts audio streams and filings into structured probability vectors in under 12 milliseconds.",
    architectureHighlights: [
      {
        title: "Kernel-Bypass Audio Processing",
        description: "Raw audio stream decoding using DPDK and low-jitter kernel-bypass memory buffers."
      },
      {
        title: "Domain-Specific Tokenization",
        description: "Custom financial vocabulary models tuned for macro-economic terminology and balance sheet ratios."
      },
      {
        title: "Deterministic Risk Circuit-Breakers",
        description: "Hardware-enforced execution limits protecting against volatility spikes and anomalous liquidity conditions."
      }
    ],
    results: [
      "Sub-12ms end-to-end signal generation from spoken word to trading risk engine",
      "Zero model hallucinations across 14,000 parsed quarterly earnings disclosures",
      "3.1x increase in capture rate for news-driven market inefficiencies"
    ],
    techStack: ["C++20", "Next.js", "Python", "CUDA", "Redis Enterprise", "Apache Kafka", "WebSockets"]
  },
  {
    id: "helix-cyber",
    slug: "helix-cyber",
    title: "Zero-Trust Edge Security & Pen-Test Defense Hub",
    client: "Helix Cybersecurity",
    tagline: "Autonomous attack surface monitoring and automated penetration testing remediation",
    category: "Enterprise",
    impactMetric: "99.4%",
    impactLabel: "Automated Vulnerability Neutralization",
    year: "2025",
    duration: "3 Months",
    summary: "Helix Cybersecurity provides global defense intelligence to critical infrastructure providers. Axiom Labs designed their unified threat operations platform and MITRE ATLAS telemetry interface.",
    challenge: "Enterprise security teams were overwhelmed by millions of daily edge security events, struggling to prioritize adversarial AI prompts and novel zero-day attack vectors.",
    solution: "We built an edge-deployed telemetry analysis platform with real-time attack path graphing, post-quantum cryptographic key rotation, and automated WAF rule synthesis.",
    architectureHighlights: [
      {
        title: "MITRE ATLAS Attack Mapping",
        description: "Real-time categorization of adversarial prompts, model inversion attempts, and supply chain threats."
      },
      {
        title: "Post-Quantum Cryptography",
        description: "Lattice-based encryption wrappers securing edge communication channels against quantum decrypt risks."
      },
      {
        title: "Instant Synthetic Patching",
        description: "Automated generation and deployment of edge mitigation filters within 90 seconds of threat detection."
      }
    ],
    results: [
      "Monitored over 14 million daily threat vectors across 6 global enterprise clusters",
      "99.4% automated containment of prompt injection and model evasion attacks",
      "Achieved sub-5ms policy enforcement overhead at edge points of presence"
    ],
    techStack: ["Next.js", "Rust", "Tailwind CSS", "eBPF", "ClickHouse", "Wasm", "TypeScript"]
  },
  {
    id: "nova-commerce",
    slug: "nova-commerce",
    title: "Headless Omnichannel E-Commerce & Recommendation Mesh",
    client: "Nova Commerce",
    tagline: "Sub-second catalog browsing and real-time personalized AI merchandising",
    category: "Websites",
    impactMetric: "41%",
    impactLabel: "Increase in Checkout Conversion Rate",
    year: "2025",
    duration: "4 Months",
    summary: "A global luxury retail collective with 8 international storefronts requiring a modern headless web overhaul to replace monolithic legacy commerce platforms.",
    challenge: "Slow page loads (3.8s LCP), fragmented inventory silos across 12 countries, and zero real-time personalization resulted in severe cart abandonment.",
    solution: "We developed a globally distributed Next.js App Router storefront powered by edge caching, vector-powered visual product recommendations, and instant localized checkout.",
    architectureHighlights: [
      {
        title: "Edge Catalog Prerendering",
        description: "Instant sub-200ms page transitions across 180,000 product SKUs via ISR and Cloudflare Workers."
      },
      {
        title: "Vector Visual Search",
        description: "Allows shoppers to snap or upload photos to immediately find identical or matching inventory items."
      },
      {
        title: "Omnichannel Cart Synchronization",
        description: "Unified session persistence allowing seamless handoff between mobile app, desktop web, and in-store POS."
      }
    ],
    results: [
      "41% boost in mobile checkout conversion rate within 90 days of launch",
      "Lighthouse performance score elevated from 38 to 98 across all global regions",
      "62% decrease in cloud hosting and infrastructure maintenance overhead"
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Shopify Plus API", "Algolia Vector", "Cloudflare Workers"]
  },
  {
    id: "pulse-matrix",
    slug: "pulse-matrix",
    title: "Global Logistics Route Optimization & Dispatch AI",
    client: "Pulse Matrix Logistics",
    tagline: "Dynamic vehicle routing and predictive multimodal freight dispatching",
    category: "Enterprise",
    impactMetric: "28%",
    impactLabel: "Reduction in Fleet Fuel Consumption",
    year: "2025",
    duration: "5 Months",
    summary: "Pulse Matrix operates a fleet of over 6,500 freight transports across North America and Western Europe. We engineered their real-time dispatch dashboard and predictive routing core.",
    challenge: "Unpredictable weather disruptions, volatile diesel pricing, and traffic congestion caused recurring multi-hour delivery delays and millions in deadhead mileage.",
    solution: "Axiom Labs built a real-time dispatch orchestration hub utilizing combinatorial optimization and weather radar satellite feeds to recalculate optimal multi-stop corridors on the fly.",
    architectureHighlights: [
      {
        title: "Combinatorial Route Solver",
        description: "Real-time recalculation of dynamic vehicle routing problems with time windows (VRPTW)."
      },
      {
        title: "Predictive Fuel & Toll Arbitrage",
        description: "Optimizes fuel replenishment stops based on real-time highway pricing and state tax differentials."
      },
      {
        title: "Driver Telematics Telemetry",
        description: "Sub-second IoT sensor ingestion monitoring engine diagnostics and driving safety metrics."
      }
    ],
    results: [
      "28% reduction in annual fleet fuel expenditures and carbon emissions",
      "99.1% on-time delivery SLA compliance across 1.2M annual shipments",
      "Deadhead unloaded transit miles reduced by 34%"
    ],
    techStack: ["Next.js", "React", "Python", "Go", "PostgreSQL / PostGIS", "Mapbox GL", "Docker"]
  },
  {
    id: "synthetix-labs",
    slug: "synthetix-labs",
    title: "Generative Multimodal Audio & Media Synthesis Platform",
    client: "Synthetix Labs",
    tagline: "High-fidelity AI audio arrangement and interactive listing video generation",
    category: "Websites",
    impactMetric: "92%",
    impactLabel: "Reduction in Production Turnaround Time",
    year: "2026",
    duration: "4 Months",
    summary: "A cutting-edge creative agency platform enabling creators and digital marketers to generate studio-grade acoustic soundtracks and 4K promotional listing videos from text prompts.",
    challenge: "Manual video and audio production took 3 to 5 business days per asset, pricing out indie creators and dynamic social media marketing campaigns.",
    solution: "Axiom Labs architected an end-to-end cloud synthesis suite featuring a Web Audio visualizer, multi-track timeline editor, and distributed GPU rendering pipeline.",
    architectureHighlights: [
      {
        title: "In-Browser Web Audio Waveform",
        description: "Real-time acoustic spectrum rendering with zero-latency audio scrubber and track arrangement."
      },
      {
        title: "Distributed GPU Render Pipeline",
        description: "Parallelized video encoding across distributed cloud instances delivering 4K exports in under 60 seconds."
      },
      {
        title: "Automated Storyboarding Engine",
        description: "Synthesizes narrative shot lists, script voiceovers, and musical key changes tailored to brand tone."
      }
    ],
    results: [
      "92% reduction in video creation turnaround time from 4 days to under 4 minutes",
      "Over 45,000 unique audio tracks synthesized during launch quarter",
      "99.9% render uptime with distributed edge media delivery"
    ],
    techStack: ["Next.js", "React", "Tailwind CSS", "Web Audio API", "WebAssembly", "FFmpeg", "AWS Batch"]
  }
];

export const clientCategories = ["All", "AI Apps", "Websites", "Enterprise"] as const;
