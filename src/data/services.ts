export interface ServicePhase {
  number: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  badge: string;
  heroHeadline: string;
  shortDesc: string;
  longDesc: string;
  iconName: string;
  metrics: string;
  deliverables: {
    title: string;
    description: string;
  }[];
  processPhases: ServicePhase[];
  faqs: ServiceFAQ[];
  tools: string[];
}

export const servicesData: ServiceItem[] = [
  {
    id: "ui-ux-design",
    slug: "ui-ux-design",
    title: "UI/UX Design",
    badge: "Product Strategy",
    heroHeadline: "Precision Interfaces for High-Cognition Workflows",
    shortDesc: "Human-centered interfaces, dense telemetry dashboards, and multi-brand design systems built for speed and clarity.",
    longDesc: "We design software interfaces for high-consequence environments—from financial trading desks to AI copilots—where ergonomics, information hierarchy, and sub-100ms feedback loops are paramount.",
    iconName: "Layout",
    metrics: "100% WCAG 2.1 AA Compliant",
    deliverables: [
      {
        title: "User Research & Cognitive Mapping",
        description: "Task-flow audits, operator mental model interviews, and journey optimization for high-density applications."
      },
      {
        title: "UX Flows & Low-Fidelity Wireframes",
        description: "Exhaustive state diagrams covering edge cases, network disconnects, latency spikes, and error boundaries."
      },
      {
        title: "UI Systems & Interactive Prototypes",
        description: "Design-tokenized component libraries in Figma synced directly to production code via automated git webhooks."
      },
      {
        title: "Visual Design & Brand Architecture",
        description: "Dark-mode optimized color palettes, tabular typography scales, and high-contrast accessibility standards."
      },
      {
        title: "Micro-Interaction & Motion Design",
        description: "Physics-based Framer Motion transitions and GPU-accelerated canvas feedback states that orient the user without latency."
      },
      {
        title: "Design Ops & Production Handoff",
        description: "Pixel-perfect React component specs, responsive breakpoint grids, and zero-ambiguity documentation."
      }
    ],
    processPhases: [
      {
        number: "01",
        title: "Discover & Scope",
        duration: "Weeks 1-2",
        description: "Deep dive into existing user journeys, telemetry bottlenecks, and product requirements.",
        deliverables: ["Product Requirements Document (PRD)", "Information Architecture Map", "User Personas & Heuristic Audit"]
      },
      {
        number: "02",
        title: "Architecture & Wireframes",
        duration: "Weeks 3-4",
        description: "Mapping end-to-end navigational flows, low-fidelity wireframes, and validation experiments.",
        deliverables: ["Interactive Clickable Wireframe", "State Transition Diagram", "Accessibility Baseline Checklist"]
      },
      {
        number: "03",
        title: "Visual System & High-Fi Prototyping",
        duration: "Weeks 5-6",
        description: "Crafting polished interface components, bespoke iconography, and fluid physics-based transitions.",
        deliverables: ["Tokenized Figma Design System", "High-Fidelity Prototype", "Component Variant Matrix"]
      },
      {
        number: "04",
        title: "Design Ops & Engineering Handoff",
        duration: "Weeks 7-8",
        description: "Connecting Figma tokens to Tailwind CSS variables, reviewing edge builds, and conducting QA audits.",
        deliverables: ["Exported React Components", "Storybook Catalog", "Accessibility Compliance Certification"]
      }
    ],
    faqs: [
      {
        question: "How do your design systems synchronize with our frontend codebase?",
        answer: "We use automated design token pipelines (via Tokens Studio and GitHub Actions) that export Figma color variables, typography scales, and spacing tokens directly into Tailwind CSS configuration files and CSS custom properties."
      },
      {
        question: "Can you design for complex, data-heavy enterprise platforms?",
        answer: "Yes. Our core specialty is high-density interfaces—such as financial dashboards, real-time telemetry monitors, and AI model orchestration consoles—designed for fast scanning and zero visual fatigue."
      },
      {
        question: "What is your typical project timeline for an end-to-end design engagement?",
        answer: "Most product design engagements span 6 to 10 weeks depending on scope, progressing from initial cognitive audits to complete design systems and interactive high-fidelity prototypes."
      }
    ],
    tools: ["Figma", "Tailwind CSS", "Storybook", "Radix UI", "Tokens Studio", "Framer Motion"]
  },
  {
    id: "website-design",
    slug: "website-design",
    title: "Website Design",
    badge: "Brand & Motion",
    heroHeadline: "Digital Flagships That Convert From First Load",
    shortDesc: "Award-caliber digital brand experiences engineered with cinematic motion, editorial typography, and conversion science.",
    longDesc: "We build digital flagship websites for ambitious technology companies. Every layout balances bold visual storytelling with ruthless conversion architecture, responsive ergonomics, and sub-second load times.",
    iconName: "Globe",
    metrics: "42% Average Conversion Lift",
    deliverables: [
      {
        title: "Brand Identity & Visual Direction",
        description: "Positioning narrative, bespoke glyph design, typography pairings, and digital-first color systems."
      },
      {
        title: "Editorial Storytelling & Layouts",
        description: "High-impact narrative flow designed to establish undeniable enterprise authority and clarity of value."
      },
      {
        title: "Cinematic Motion & Interactions",
        description: "Scroll-linked visual reveals, WebGL light-ray shaders, and responsive physics animations."
      },
      {
        title: "Conversion Funnel Optimization",
        description: "Sticky contextual CTAs, friction-free booking modals, and intent-driven navigation architectures."
      },
      {
        title: "Core Web Vitals & Performance",
        description: "Zero Cumulative Layout Shift (CLS), instantaneous Largest Contentful Paint (LCP), and minimal DOM overhead."
      },
      {
        title: "User-Tested Iterative Refinement",
        description: "Heatmap analytics, live A/B session validation, and continuous conversion funnel calibration."
      }
    ],
    processPhases: [
      {
        number: "01",
        title: "Positioning & Strategy",
        duration: "Week 1",
        description: "Clarifying your competitive edge, target audience personas, and primary conversion objectives.",
        deliverables: ["Creative Brief", "Moodboard & Typography Pairings", "Sitemap & User Flow Hierarchy"]
      },
      {
        number: "02",
        title: "Creative Concepting",
        duration: "Weeks 2-3",
        description: "Exploring bold visual styles, editorial grid directions, and bespoke 3D/canvas visual motifs.",
        deliverables: ["Three Distinct Art Directions", "Hero Prototype Exploration", "Content Narrative Drafts"]
      },
      {
        number: "03",
        title: "Full Responsive Layouts",
        duration: "Weeks 4-5",
        description: "Designing all desktop, tablet, and mobile breakpoints with bespoke motion choreography.",
        deliverables: ["Full Responsive Page Layouts", "Motion Specification Guide", "Asset Production Pipeline"]
      },
      {
        number: "04",
        title: "Build Integration & QA",
        duration: "Weeks 6-7",
        description: "Collaborating with our engineering team to ensure 100% fidelity to the approved design vision.",
        deliverables: ["Design QA Audit", "Lighthouse 95+ Verification", "Cross-Browser Testing Signoff"]
      }
    ],
    faqs: [
      {
        question: "How do you ensure cinematic websites still achieve top Lighthouse scores?",
        answer: "We build all visual shaders using lightweight WebGL/Canvas pipelines that pause execution when off-screen, alongside modern responsive image formats (AVIF/WebP), pre-rendered critical CSS, and zero bloated third-party analytics bundles."
      },
      {
        question: "Do you write original copy and produce bespoke imagery?",
        answer: "Yes, our team handles technical copywriting, brand positioning, and custom SVG iconography, ensuring your product's unique technical advantages are communicated with razor-sharp precision."
      }
    ],
    tools: ["Next.js", "Three.js / WebGL", "Tailwind CSS", "Figma", "GSAP", "Lenis Scroll"]
  },
  {
    id: "website-development",
    slug: "website-development",
    title: "Web Development",
    badge: "Next.js & Edge",
    heroHeadline: "Modern Software Engineered to Ship & Scale",
    shortDesc: "Next.js App Router engineering, server components, distributed edge caching, and rock-solid headless CMS integrations.",
    longDesc: "We build enterprise-grade modern web applications and platforms. Combining React Server Components, TypeScript type-safety, edge compute, and resilient headless data sources for sub-second global responses.",
    iconName: "Cpu",
    metrics: "< 250ms Global Time-to-First-Byte",
    deliverables: [
      {
        title: "Next.js App Router Architecture",
        description: "Streaming React Server Components (RSC) with zero-bundle-size server logic and instant client hydration."
      },
      {
        title: "Headless CMS & Commerce Integrations",
        description: "Robust data connectors for Sanity, Contentful, Shopify Plus, and localized multi-region headless stores."
      },
      {
        title: "API Microservices & WebSockets",
        description: "Low-latency tRPC, GraphQL, and WebSocket backends supporting real-time collaborative state."
      },
      {
        title: "Cross-Platform & Progressive Web Apps",
        description: "Offline-first caching, mobile-touch ergonomics, and seamless responsive behavior across all viewports."
      },
      {
        title: "Edge Caching & SEO Architecture",
        description: "Dynamic OpenGraph generation, semantic JSON-LD structured schemas, and instant CDN propagation."
      },
      {
        title: "Zero-Trust Security & Compliance",
        description: "Strict Content Security Policies (CSP), automated dependency audits, and SOC2-compliant CI/CD pipelines."
      }
    ],
    processPhases: [
      {
        number: "01",
        title: "Architecture & Scaffolding",
        duration: "Week 1",
        description: "Establishing repository standards, TypeScript configurations, automated linting, and CI pipelines.",
        deliverables: ["Monorepo Setup", "Database Schema Models", "CI/CD Deployment Pipelines"]
      },
      {
        number: "02",
        title: "Component & Data Layer Build",
        duration: "Weeks 2-4",
        description: "Engineering reusable UI primitives, edge API endpoints, and caching strategies.",
        deliverables: ["Modular React Components", "Type-Safe API Contracts", "CMS Data Hydration"]
      },
      {
        number: "03",
        title: "Integration & Performance Tuning",
        duration: "Weeks 5-6",
        description: "Eliminating render waterfalls, implementing optimistic UI updates, and benchmarking under load.",
        deliverables: ["Load Testing Reports", "Edge Cache Verification", "SEO & OpenGraph Validation"]
      },
      {
        number: "04",
        title: "Production Deployment & Handoff",
        duration: "Week 7",
        description: "Executing DNS cutover, configuring automated preview branches, and providing operator documentation.",
        deliverables: ["Zero-Downtime Production Cutover", "Technical Architecture Docs", "24/7 Monitoring Alarms"]
      }
    ],
    faqs: [
      {
        question: "Why do you build on Next.js App Router rather than older single-page architectures?",
        answer: "Next.js App Router with Server Components reduces client JavaScript bundles by up to 70%, streams HTML directly from the edge, optimizes Core Web Vitals automatically, and provides unmatched developer ergonomics."
      },
      {
        question: "Can you integrate with our existing backend microservices and databases?",
        answer: "Absolutely. We routinely connect Next.js frontends to enterprise PostgreSQL, ClickHouse, REST APIs, gRPC backends, and authenticated corporate single sign-on (SSO) systems."
      }
    ],
    tools: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "PostgreSQL", "Cloudflare Edge", "Docker"]
  },
  {
    id: "ai-development",
    slug: "ai-development",
    title: "AI Development",
    badge: "Foundation Models",
    heroHeadline: "Production AI with Deterministic Reliability",
    shortDesc: "Custom LLM applications, private RAG pipelines, fine-tuning, and automated evals engineered for zero-hallucination compliance.",
    longDesc: "Moving machine learning from research proofs-of-concept into resilient production environments. We design, benchmark, and deploy enterprise AI pipelines with strict safety guardrails and sub-100ms latency.",
    iconName: "Bot",
    metrics: "< 85ms Median Token Latency",
    deliverables: [
      {
        title: "Custom RAG Pipelines & Vector Search",
        description: "Hybrid dense-sparse retrieval, multi-stage reranking, and semantic chunking for proprietary knowledge bases."
      },
      {
        title: "Model Fine-Tuning & Quantization",
        description: "LoRA/QLoRA adaptation of open weights (Llama 3, Mistral, Qwen) for domain-specific accuracy and lower hosting costs."
      },
      {
        title: "Automated Model Evals & Guardrails",
        description: "Continuous benchmarking against gold-standard test suites to catch regressions, drift, and jailbreaks."
      },
      {
        title: "Multimodal Vision, Speech & NLP",
        description: "Real-time acoustic transcription, document OCR parsing, and visual scene understanding at scale."
      },
      {
        title: "Observability & Latency Monitoring",
        description: "End-to-end token tracing, cost-per-query dashboards, and automated alert policies for anomalous queries."
      },
      {
        title: "AI Strategy & Infrastructure Sizing",
        description: "GPU hardware allocation advisory, private VPC deployment models, and Post-Quantum cryptographic encryption."
      }
    ],
    processPhases: [
      {
        number: "01",
        title: "Data Audit & Feasibility",
        duration: "Weeks 1-2",
        description: "Auditing enterprise documents, assessing data hygiene, and formulating quantitative baseline evaluation targets.",
        deliverables: ["Data Cleansing Pipeline", "Evaluation Test Suite (Golden Dataset)", "Architecture Feasibility Report"]
      },
      {
        number: "02",
        title: "Prototype & Architecture Sizing",
        duration: "Weeks 3-4",
        description: "Testing foundation models, configuring vector embeddings, and running comparative latency/cost benchmarks.",
        deliverables: ["Working RAG Sandbox", "Model Comparison Matrix", "Retrieval Recall Benchmark"]
      },
      {
        number: "03",
        title: "Hardening & Guardrails",
        duration: "Weeks 5-7",
        description: "Implementing deterministic safety filters, PII redaction, structured output schemas, and fallback models.",
        deliverables: ["Guardrail Middleware", "PII Redaction Layer", "Automated Regression Evals"]
      },
      {
        number: "04",
        title: "Production Scaling & Telemetry",
        duration: "Weeks 8-9",
        description: "Deploying to private enterprise VPCs with auto-scaling inference endpoints and full telemetry dashboards.",
        deliverables: ["High-Throughput vLLM / TensorRT Cluster", "OpenTelemetry Dashboard", "SLA Guarantee Signoff"]
      }
    ],
    faqs: [
      {
        question: "How do you prevent proprietary enterprise data from training public AI models?",
        answer: "We deploy strictly inside your isolated cloud perimeter (AWS VPC, Azure, or on-premises GPU clusters) using open-weights models and zero-data-retention enterprise enterprise APIs where inputs are never logged or stored for model training."
      },
      {
        question: "When should we choose fine-tuning versus Retrieval-Augmented Generation (RAG)?",
        answer: "RAG is best for injecting dynamic, up-to-date knowledge and citing specific source documents. Fine-tuning is best for teaching a model specific stylistic tones, specialized syntax (e.g., proprietary code or medical notation), and compressing latency."
      }
    ],
    tools: ["PyTorch", "vLLM", "Qdrant", "Ollama", "LangChain", "TensorRT-LLM", "HuggingFace"]
  },
  {
    id: "ai-agents",
    slug: "ai-agents",
    title: "AI Agents",
    badge: "Autonomous Systems",
    heroHeadline: "Autonomous Agents That Plan, Reason & Execute",
    shortDesc: "Multi-agent networks with MCP tool calling, supervisory verification, memory persistence, and human-in-the-loop controls.",
    longDesc: "Transform static software into self-executing autonomous agent clusters capable of planning, verifying decisions, interacting with external legacy systems, and self-correcting in production without hallucination.",
    iconName: "Bot",
    metrics: "95.6% Tool-Call Execution Accuracy",
    deliverables: [
      {
        title: "Voice Agents & Real-Time Call Centers",
        description: "Sub-400ms speech-to-speech telephony agents with interrupt handling and empathetic tone calibration."
      },
      {
        title: "Tool-Using LLM Agents (MCP)",
        description: "Standardized Model Context Protocol (MCP) integrations connecting agents safely to databases, APIs, and tools."
      },
      {
        title: "Multi-Agent Orchestration & Planning",
        description: "Hierarchical agent networks where planner agents supervise specialized executor, researcher, and QA agents."
      },
      {
        title: "Long-Term Knowledge & Episodic Memory",
        description: "Persistent vector memory allowing agents to recall past interactions, user preferences, and enterprise policies."
      },
      {
        title: "Workflow Automation & Sandbox Execution",
        description: "Isolated container environments where agents execute code and verify outcomes before touching production."
      },
      {
        title: "Human-in-the-Loop Supervisory Handoff",
        description: "Intuitive operator consoles with confidence score thresholds that escalate ambiguous edge cases to humans."
      }
    ],
    processPhases: [
      {
        number: "01",
        title: "Workflow Deconstruction",
        duration: "Weeks 1-2",
        description: "Mapping existing human operator SOPs, decision trees, and required API permissions.",
        deliverables: ["Agent Capability Matrix", "Tool-Calling Schema Spec", "Risk & Escalation Policy"]
      },
      {
        number: "02",
        title: "Agent Mesh Architecture",
        duration: "Weeks 3-4",
        description: "Building the planning-execution-verification cycle with isolated tool calling and state persistence.",
        deliverables: ["Orchestrator Sandbox", "MCP Server Endpoints", "Deterministic Unit Tests"]
      },
      {
        number: "03",
        title: "Supervisory UI & Safety Verification",
        duration: "Weeks 5-6",
        description: "Designing the human operator dashboard, execution log replay, and manual override controls.",
        deliverables: ["Supervisory Web Console", "Audit Log Ledger", "Automated Canary Testing"]
      },
      {
        number: "04",
        title: "Pilot Rollout & Autonomous Scaling",
        duration: "Weeks 7-8",
        description: "Deploying in shadow mode alongside human operators, benchmarking accuracy, and gradually ramping traffic.",
        deliverables: ["Shadow Deployment Report", "Production Traffic Handoff", "Continuous Evaluation Pipeline"]
      }
    ],
    faqs: [
      {
        question: "What prevents an autonomous agent from making catastrophic errors?",
        answer: "We implement multi-layered safety guardrails: strict sandboxed execution, read-only permissions by default, dual-agent verification (a critic agent must approve the executor's plan), and configurable blast-radius limits that mandate human approval for sensitive actions."
      },
      {
        question: "What is Model Context Protocol (MCP) and why do you use it?",
        answer: "MCP is the open standard for connecting AI models to external tools and data sources. It provides a secure, versioned protocol so agents can query databases, execute code, and call APIs with zero vendor lock-in."
      }
    ],
    tools: ["MCP Protocol", "CrewAI", "Temporal", "Docker", "Python", "FastAPI", "Redis"]
  },
  {
    id: "healthcare-apps",
    slug: "healthcare-apps",
    title: "Healthcare Apps",
    badge: "HIPAA & Clinical",
    heroHeadline: "Clinical-Grade Platforms Built for Care & Compliance",
    shortDesc: "HIPAA-compliant clinician copilots, EHR interoperability (FHIR/HL7), telehealth portals, and verifiable clinical decision support.",
    longDesc: "Engineering digital health platforms where human life and data privacy are at stake. We design clinical-grade software featuring zero-knowledge encryption, FHIR interoperability, and clinician-tested workflows.",
    iconName: "Shield",
    metrics: "100% HIPAA & SOC2 Type II Certified",
    deliverables: [
      {
        title: "HIPAA & PHI Compliance Architecture",
        description: "End-to-end encryption at rest and in transit, automated audit trails, and strict role-based access controls (RBAC)."
      },
      {
        title: "Telehealth & Patient Portals",
        description: "Low-latency WebRTC video consultations, asynchronous messaging, and secure digital prescription workflows."
      },
      {
        title: "EHR Interoperability (FHIR / HL7)",
        description: "Seamless bidirectional syncing with major EHR providers including Epic, Cerner, AthenaHealth, and Allscripts."
      },
      {
        title: "Clinician Decision Support & Dashboards",
        description: "Real-time vital trend monitors, lab result correlation, and ambient documentation generation."
      },
      {
        title: "Immutable Audit Logging & Access Controls",
        description: "Cryptographically verified access logs meeting all HHS Office for Civil Rights compliance requirements."
      },
      {
        title: "Clinical-Grade Reliability & SLA",
        description: "99.999% high-availability multi-region active-active architectures designed for emergency care zero-downtime."
      }
    ],
    processPhases: [
      {
        number: "01",
        title: "Compliance & Clinical Scope",
        duration: "Weeks 1-2",
        description: "Establishing regulatory baselines (HIPAA, BAA agreements, SOC2), clinical safety protocols, and FHIR resource schemas.",
        deliverables: ["HIPAA Architecture Blueprint", "BAA Agreement Template", "Clinical Workflow Specification"]
      },
      {
        number: "02",
        title: "Secure Scaffolding & EHR Sandbox",
        duration: "Weeks 3-5",
        description: "Building zero-retention data pipelines, FHIR SMART on FHIR authorization, and mock clinician testbeds.",
        deliverables: ["SMART on FHIR Auth Gateway", "End-to-End Encrypted Data Lake", "Clinician Test Harness"]
      },
      {
        number: "03",
        title: "Clinical Validation & Usability",
        duration: "Weeks 6-8",
        description: "Testing with board-certified physicians, measuring cognitive load, and conducting penetration testing audits.",
        deliverables: ["Third-Party Security Pen Test", "Clinician Usability Report", "HIPAA Compliance Attestation"]
      },
      {
        number: "04",
        title: "Production Deployment & BAA Execution",
        duration: "Weeks 9-10",
        description: "Deploying to HITRUST-certified cloud environments with continuous monitoring and automated disaster recovery.",
        deliverables: ["Production Cloud Launch", "Disaster Recovery Runbook", "24/7 Security Incident Response Plan"]
      }
    ],
    faqs: [
      {
        question: "Do you sign Business Associate Agreements (BAA)?",
        answer: "Yes, we sign comprehensive BAAs for all healthcare and health-tech engagements, guaranteeing that all architecture and cloud resources strictly comply with HIPAA and HITECH security standards."
      },
      {
        question: "How do you handle bidirectional EHR integration without breaking hospital systems?",
        answer: "We utilize modern HL7 FHIR RESTful APIs and SMART on FHIR OAuth profiles with strict idempotency keys, ensuring updates are atomic, verifiable, and cannot corrupt hospital records."
      }
    ],
    tools: ["FHIR R4", "HL7", "React", "TypeScript", "Next.js", "WebRTC", "AWS HealthLake", "PostgreSQL"]
  }
];
